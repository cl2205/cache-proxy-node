/* Proxy server with an in-memory cache. Receives incoming GET requests 
and forwards request to the host server. Server responses are cached for
retrieval without a server call for future requests of the same resource.
*/

var http = require('http'),
    proxyServer = http.createServer(),
    port = process.env.PORT || 3000,
    cache = require('../proxy/cache'),
    url = require('url'),
    hostServer = '/localhost:4100',
    hostServerPort = 4000;

proxyServer.listen(port, function() {
    console.log('server listening on port 3000');
});

proxyServer.on('request', function(request, response) {

    if (request.method === 'GET') {

        var reqUrl = request.url;

        // if cached, serve cached resource

        if (cache.hasKey(reqUrl)) {

            console.log('Retrieving from cache...');

            var resource = cache.get(reqUrl);

            response.statusCode = 200;
            response.write(resource.data);
            response.end();

        // else forward request to host server

        } else {

            console.log('Forwarding request to host server...');
        
            var options = {

                host: 'localhost',
                port: hostServerPort,
                path: request.url,
                method: request.method,
                headers: request.headers

            };

            var proxyReq = http.request(options, function(serverResponse) {

                // store response object contents and size
                var resBody = '';
                var resBodySize = 0;

                serverResponse.setEncoding('utf8');

                serverResponse.on('error', function(err) {
                    handleError(err);
                });

                serverResponse.on('data', function(chunk) {
                    resBody += chunk;
                    resBodySize += chunk.length;
                });

                serverResponse.on('end', function() {
                    // add finished response to cache
                    cache.add(reqUrl, resBody, resBodySize);
                });

                serverResponse.pipe(response);

            });

            proxyReq.on('error', function(err) {
                response.writeHead(500);
                response.write('Internal Server Error');
                response.end();
            });

            request.pipe(proxyReq);

        }

    // non-GET requests are not forwarded and cached

    } else {

        response.statusCode = 200;
        response.write('Some uncacheable resource');
        response.end();

    }

});

proxyServer.on('error', function(err){
    handleError(err);
});

function handleError(error) {
    console.log(error.message);
}


module.exports = proxyServer;