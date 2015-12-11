var http = require('http'),
    proxyServer = http.createServer(),
    port = process.env.PORT || 3000,
    cache = require('./cache'),
    apiServerHost = 'http://localhost:4000';

proxyServer.listen(port, function() {
    console.log("proxy server listening on port " + port);
});

proxyServer.on('request', function(request, response) {

    if (request.method === 'GET') {

        var url = request.url;

        // check if cached, serve cached resource

        if (cache.hasKey(url)) {

            var resource = cache.get(url);

            response.statusCode = 200;
            response.write(resource.data);
            response.end();

        // else forward request to host server

        } else {

            var options = {
                host: 'localhost',
                url: apiServerHost + request.url,
                headers: request.headers,
                method: request.method,
                port: 4000 // server port 

            };

            var serverReq = http.request(options, function(serverResponse) {

                var resBody = '';
                var resBodySize = 0;

                serverResponse.pipe(response);
                
                serverResponse.on('error', function(err) {
                    handleError(err);
                });

                serverResponse.on('data', function(chunk) {
                    resBody += chunk;
                    resBodySize += chunk.length;
                });

                serverResponse.on('end', function() {
                    cache.add(url, resBody, resBodySize);
                });

            });
            
            return request.pipe(serverReq);

        }

    // else not a GET request   
    } else {

        response.statusCode = 200;
        response.write('Not a GET request - Not forwarded');
        response.end();

    }

});


function handleError(error) {
    console.log(error.message);
}


module.exports = proxyServer;