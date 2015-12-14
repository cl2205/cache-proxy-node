var http = require('http'),
    proxyServer = http.createServer(),
    port = process.env.PORT || 3100,
    cache = require('../proxy/cache'),
    net = require('net'),
    url = require('url'),
    hostServerPort = 4100;

    // how to point your browser to transparent proxy server?
proxyServer.listen(port);

proxyServer.on('connect', function(req, cltSocket, head) {

    // connect to an origin server
    var serverUrl = url.parse('http://' + req.url);
    console.log("serverUrl: ", serverUrl);

    var serverSocket = net.connect(serverUrl.port, serverUrl.hostname, function() {
        console.log("CONNECTED");
        cltSocket.write('HTTP/1.1 200 Connection Established\r\n' +
                        'Proxy-agent: Node.js-Proxy\r\n' +
                        '\r\n');
        serverSocket.write(head); // buffer
        serverSocket.pipe(cltSocket);
        cltSocket.pipe(serverSocket);
    });

    serverSocket.on('error', function(err) {
        console.log("error connecting to " + req.url);
        console.log("err: ", err);
        cltSocket.destroy();
        // serverSocket.destroy();
    });

    serverSocket.on('data', function(chunk) {
        console.log("sending request to google..");
    });
});


proxyServer.on('request', function(request, response) {
    console.log("got get request");

    if (request.url === '/favicon.ico') {
        response.writeHead(200, {'Content-Type': 'imagee/x-icon'} );
        response.end();
        console.log('favicon requested');
        return;
    }

    if (request.method === 'GET') {
        // add favicon exception

        var requestUrl = request.url;
        console.log("requestUrl: ", requestUrl);
        var options = url.parse(requestUrl);
        console.log("request OPTIONS: ", options);
 
        // check if cached, serve cached resource

        if (cache.hasKey(requestUrl)) {

            console.log("Cached. Retrieving from cache..");

            var resource = cache.get(requestUrl);

            response.statusCode = 200;
            // console.log("resource: ", resource);    // sends back cache entry
            response.write(resource.data);  // sends back 'request proxied...'
            response.end(); // convert to json? 

        // else forward request to host server

        } else {
            console.log("forwarding to google...");

            var destServerOptions = url.parse(request.url);
            console.log('destServer Options: ', destServerOptions);
            // destServerOptions.port = hostServerPort;
            var destServer = url.parse('http://' + destServerOptions.path.slice(1));
            console.log("destServer: ", destServer);
            destServer.port = 80;

            if (destServer.path === '/') destServer.path = "";
            // make a req to a tunneling proxy
            var options = {
                port: 3100,
                hostname: 'localhost',
                method: 'CONNECT',
                path: destServer.hostname + ":" + destServer.port + destServer.path
                // look at what path is in docs
            };

            console.log('options pathhhh: ', options.path);

            var resBody = '';
            var resBodySize = 0;
            // console.log('serverOptions: ', options.serverOptions);
            // console.log("Optiosn path: ", options.path.slice(1));
            var req = http.request(options);

            req.on('response', function(res) {
                    console.log("response received");
                    console.log('res:', res);
                    res.pipe(response);
             });

            req.end();

            // req.setEncoding('utf8');

            req.on('error', function(err) {
                console.log("ERROR with request");
                response.writeHead(404);
                response.write('Page Not Found');
                response.end();
            });

            req.on('connect', function(res, socket, head) {
                var optionsPath = options.path;
                var path;

                socket.setEncoding('utf8');

                if ((/www/i).test(options.path)) {
                    path = optionsPath;
                    
                } else {
                    path = 'www.' + optionsPath;
                }

                console.log("PATH: ", path);

                console.log("got connected!");



                // socket.on('pipe', function(src) {
                //     console.log('piping into response');
                //     console.log("typeof data: ", typeof src);
                // });
                // console.log("RES: ", response.data);
               



                // make a request over an HTTP tunnel
                socket.write('GET / HTTP/1.1\r\n' +
                         'Host: ' + path + '\r\n' +
                         'Connection: close\r\n' +
                         '\r\n');

                socket.on('data', function(chunk) {
                    console.log("SENDING DATA....");
                    // console.log("CHUNK: ", chunk);
                    resBody += chunk;
                    resBodySize += chunk.length;
                    // console.log(chunk.toString());
                });

                socket.on('error', function(err) {
                    console.log("SOCKET CONNECTION ERROR");
                    handleError(err);
                    response.statusCode(404);
                    response.write('not found');
                });

                socket.on('close', function(had_error) {
                    console.log("had error: ", had_error);

                });

                socket.on('end', function() {
                    console.log("finished sending data");
                    //console.log("RESPONSE: ", response);
                    console.log("bytes read: ", socket.bytesRead);
                    // console.log("resbody:", resBody);

                    console.log("res headers: ", res.headers);
                    console.log("resBodySize: ", resBodySize);
                    // var body = JSON.parse(resBody);
                    // response.write(resBody);
                    // response.end();

                    // response.writeHead(200, {'Content-Type': 'text/html'});
                    // cache.add(requestUrl, resBody, resBodySize);
                    // console.log("cache: ", cache.store);
                    // bad request 400 don't get cached
                    // proxyServer.close();
                });


                socket.pipe(response);
            });
        }


            // var options = {
            //     host: 'localhost',
            //     url: request.url,   // ie. google.com
            //     headers: request.headers,
            //     method: request.method,
            //     port: hostServerPort // server port 
            //     // port 80 if forward proxy

            // };

            // var proxyReq = http.request(options, function(serverResponse) {
            //     console.log("server Response: ", serverResponse);
            //     var resBody = '';
            //     var resBodySize = 0;

            //     serverResponse.pipe(response);
            //     console.log("server response headers sent: ", serverResponse.headersSent);
            //     // console.log("origin server headers: ", serverResponse.headers);

            //     serverResponse.on('error', function(err) {
            //         handleError(err);
            //     });

            //     serverResponse.on('data', function(chunk) {
            //         // console.log("DATA CHUNK: ", chunk.toString());
            //         resBody += chunk;
            //         resBodySize += chunk.length;
            //     });

            //     serverResponse.on('end', function() {
            //         cache.add(url, resBody, resBodySize);
            //     });

            // });

            // request.pipe(proxyReq);

      



    // else not a GET request   
    } else {

        response.statusCode = 200;
        response.write('Not a GET request - Not forwarded');
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