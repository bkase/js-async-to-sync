
self.addEventListener('install', function(event){
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event){
  event.waitUntil(self.clients.claim());
});


self.addEventListener('fetch', function(event){
  var requestUrl = new URL(event.request.url);

  if (requestUrl.pathname === '/intercept-sync' && event.request.headers.has('X-Mock-Response')) {

    var responseInit = {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': 'application/json', 'X-Mock-Response': 'yes'
      }
    };

    event.respondWith(self.clients.get(event.clientId).then(function(client){

      var messageChannel = new MessageChannel();

      let on_done;

      messageChannel.port1.onmessage = function(event){
        let result = event.data.args;
        let err = event.data.err;

        var responseBody = {
          result: result,
          error: err
        };

        var mockResponse = new Response(JSON.stringify(responseBody), responseInit);
        on_done(mockResponse);
      }

      event.request.json().then(function(json){
        client.postMessage({
          fn: json.fn,
          args: json.args,
        }, [messageChannel.port2]);
      });

      return new Promise(function(resolve, reject){
        on_done = resolve;
      });
    }));
  }
});
