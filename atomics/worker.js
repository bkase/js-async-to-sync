// [u8] -> i32
function unbytify(bytes) {
  return (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
}

//
// SharedArrayBuffer -> (...args, ...cbargs -> ()) -> ()) -> (...args -> ...cbargs)
// where ...args is the arguments to cb as an array
//
// Takes a buffer to communicate over (big enough for your data)
// gives you back asyncToSync
//
// asyncToSync takes an async function (cb in last parameter)
// and gives you back a sync version that returns the args cb is
// invoked with as the return value (an array)
//
const decoder = new TextDecoder("utf-8");
function asyncToSyncFactory(buf) {
  return function asyncToSync(fn) {
    return function syncFn() {
      // tell the UI what we want to invoke
      self.postMessage({
        '$asyncToSync': 'invoke',
        fn: fn.toString(), 
        t: Array.prototype.slice.call(arguments),
        buf: buf
      });
      const i32s = new Int32Array(buf);
      // wait until i32s[0] is no longer 0
      // TODO: This can timeout, so this should really have a while-loop
      Atomics.wait(i32s, 0, 0);
      // reset i32s[0] to zero
      Atomics.store(i32s, 0, 0);
      // read the length-prefixed result (skipping the firs i32)
      const resRaw = new Uint8Array(buf)
      const resLen = unbytify(resRaw.subarray(4, 8));
      const resStr = new Uint8Array((new Uint8Array(buf)).subarray(8, resLen+8));
      const str = decoder.decode(resStr);
      return JSON.parse(str);
    };
  };
}

// this just hooks into self.onmessage
function withAsyncToSync(work) {
  self.onmessage = function(msg){
    if (msg.data['$asyncToSync'] === 'init') {
      work(asyncToSyncFactory(msg.data.buf));
    }
  };
}

function makeRandomNumbersEveryAsync(eachMs, totalAmount, cb) {
  function loop(nums, count) {
    if (count == totalAmount) {
      cb(nums);
    } else {
      setTimeout(function() {
        const moreNums = nums.concat([Math.round(Math.random()*100)]);
        loop(moreNums, count+1);
      }, eachMs);
    }
  }
  loop([], 0);
}

function countClicksAsync(totalMs, cb) {
  let clicks = 0;
  function clickCounter() {
    clicks++;
  }
  window.addEventListener('click', clickCounter);
  setTimeout(function() {
    window.removeEventListener('click', clickCounter);
    cb(clicks);
  }, totalMs);
}

// we can make async calls synchronous!
withAsyncToSync(function(asyncToSync) {
  const makeRandomNumbersEvery = asyncToSync(makeRandomNumbersEveryAsync);
  const countClicks = asyncToSync(countClicksAsync);

  console.log("Asking for 10 random numbers chosen once every 150ms");
  const [nums] = makeRandomNumbersEvery(150, 10);
  console.log("These are the numbers", nums);

  console.log("Counting clicks for 3 seconds, click everywhere!");
  const [clicks] = countClicks(3000);
  console.log("You clicked", clicks, "times");
});

