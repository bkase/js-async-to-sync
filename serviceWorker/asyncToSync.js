

function prepAsyncToSyncWindow(fns, ready){
  navigator.serviceWorker.register('/service-worker.js').then(function(reg){
    //console.log("SW registered");
    navigator.serviceWorker.addEventListener('message', function(event){
      var fn = event.data.fn;
      var args = event.data.args;

      args.push(function(){
        event.ports[0].postMessage({ args: Array.prototype.slice.call(arguments, 0), err: null });
      });

      fns[fn].apply(null, args)
    });
    ready();
  });
}

function callSync(fn, args){

  var data = {
    fn: fn,
    args: args,
  }

  var req = new XMLHttpRequest();
  req.open("POST", 'http://localhost:8080/intercept-sync',  false);
  req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  req.setRequestHeader('X-Mock-Response', '');
  req.send(JSON.stringify(data));

  var res = JSON.parse(req.responseText);

  var err = res.err;
  var result = res.result;

  if (err)
    throw res.error;

  return result;
}

