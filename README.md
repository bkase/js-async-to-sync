# JavaScript `asyncToSync`

> Synchrously execute any async function by blocking in a worker

### Why is this useful?

Sometime you have to work with generated code that expects a synchronous delegate, and you don't want to mess with the compiler (e.g. an Emscripten file system).


## via Service Worker


### What?

We've always had a synchronous function via XMLHttpRequests. This wasn't useful for making arbitrary async functions synchronous because it could only get results from a server. However, now [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) allow us to intercept network calls. We use this to intercept and route synchronous xhr calls from a worker, and block until the the function completes.

### How do I run this?

1. Run a static webserver and open `index.html` (like `python -m SimpleHTTPServer`)

### Caveats

- As implemented blocking calls can only be made from a Web Worker
- Only works in Chrome and Firefox

##  via SharedArrayBuffer


### What?

TC39 introduced SharedArrayBuffers and Atomics. Now we can pre-allocate a buffer and share the same one between the (ui thread?) and a web worker. Using Atomics' [`wake` and `wait`](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Atomics#Wait_and_wake), we can block in the worker and signal from UI. We can also communicate back to the worker using the same buffer.

### How do I run this?

1. Get latest Chrome Canary
2. Go to `chrome://flags`
3. Enable "Experimental enabled SharedArrayBuffer support in JavaScript" (search for `#shared-array-buffer`)
4. Run a static webserver and open `index.html` (like `python -m SimpleHTTPServer`)

### Caveats

- Only works in Chrome Canary

