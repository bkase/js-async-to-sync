# JavaScript `asyncToSync` via SharedArrayBuffer

> Synchrously execute any async function by blocking in a worker

=====

## What?

TC39 introduced SharedArrayBuffers and Atomics. Now we can pre-allocate a buffer and share the same one between the (ui thread?) and a web worker. Using Atomics' [`wake` and `wait`](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Atomics#Wait_and_wake), we can block in the worker and signal from UI. We can also communicate back to the worker using the same buffer.

## How do I run this?

1. Get latest Chrome Canary
2. Go to `chrome://flags`
3. Enable "Experimental enabled SharedArrayBuffer support in JavaScript" (search for `#shared-array-buffer`)
4. Run a static webserver and open `index.html` (like `python -m SimpleHTTPServer`)

## Why is this useful?

Sometime you have to work with generated code that expects a synchronous delegate, and you don't want to mess with the compiler (e.g. an Emscripten file system).

## I want asyncToSync without Chrome Canary

You can also implement this with synchronous XHRRequests and ServiceWorkers, look at my friend @es92's gist (link it)

