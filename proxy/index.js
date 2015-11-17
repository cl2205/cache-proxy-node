var http = require('http');
// var url = require('url');

// var app = require('./app');

// var proxyServer = http.createServer(app);
var proxyServer = http.createServer();
var port = process.env.PORT || 3000;

// proxyServer.set('port', port);

proxyServer.listen(port, function() {
	console.log("proxy server listening on port " + port);
});


var request = require('request');
var db = require('../server/data');
var cache = require('./cache');
var apiServerHost = 'http://localhost:4000';
// var http = require('http');
// var apiServerHost = require('../server')

// app.get('/api/*', function(req, res) {

proxyServer.on('request', function(request, response) {
// 	// var url = url.parse(request.url).path;

	if (request.method === 'GET') {
		var url = request.url;
		console.log('request path', request.path);
	 	console.log("Request url", url);
 	// var parsedUrl = url.parse(request.url);
 	// console.log('parsed request url:', parsedUrl);
// 	// console.log("REQEUST OBJ", request.host);
// 	// console.log("REQUEST HOST: ", request.host)
	// console.log(request.headers)
	// var url = request.headers.host;
	// console.log("url: ", url);

// 	if (request.method === 'GET') {

	// console.log("REQ HEADERS: ", req.headers);
	// var url = req.url;
	// console.log("REQ URL: ", req.url);

	// if cached, send cached resource

	if (cache.hasKey(url)) {

		console.log("Url is cached. Retrieving from cache...");

		// var resource = cache.get(url).data;
		var resource = cache.get(url);
		console.log("resource: ", resource);
		// update timestamp to current retrieval time and serve resource
		resource.timestamp = Date.now();

		// console.log("CACHED RESOURCE: ", resource);
		// response.writeHead(resource.statusCode, resource.headers);
		// response.write(resource.message);
		response.write(resource.data);
		response.end();

	// else forward request to host server

	} else {

		console.log("forwarding request to host server on port 4000");

		// set the origin server options
		var options = {};
		// var options = url.parse(request.url);
		// options.hostname = 'http://localhost';
		options.host = 'localhost';	// NEED HOST
		// options.url = 'http://localhost:4000/api/';
		options.url = apiServerHost + request.url;
		options.headers = request.headers;
		options.method = request.method;
		options.port = 4000;
		console.log("options object: ", options);

		// else make server request

			var req = http.request(options, function(serverResponse) {
			
				var resBody = '';
				var resBodySize = 0;


				// console.log("server response headers: ", serverResponse.headers);
				// response.writeHead(serverResponse.statusCode, serverResponse.headers);
				// console.log("serverReponse body", serverResponse.body);
				serverResponse.pipe(response, {end: true});
				
		        serverResponse.on('data', function(chunk) {
		        	console.log("data event emitted, chunk", chunk.toString());
		        	console.log('got %d bytes of data', chunk.length);
		        	resBody += chunk;
		        	resBodySize += chunk.length;
		        	console.log("Body: ", resBody);
		        	// serverResponse.pipe(response, {end: true});
		        });

		        serverResponse.on('end', function() {
		        	console.log("end event emitted");
		        	// console.log("serverResponse headers: ", serverResponse.headers);
		        	// cache the response
		        	// var dataToCache = { headers: serverResponse.headers, body: resBody}
		        	// var dataToCache = resBody;

		        	// var dataNumBytes = serverResponse.headers['content-length'];
		        	// console.log("DATA NUM BYTES: ", dataNumBytes);
		        	cache.add(url, resBody, resBodySize, function() {
						console.log("updated cache: ", cache.store);
						console.log("updated cache byte size: ", cache.numBytes);
					});

		        	
	
		       		// req.pipe(response, {end: true});
		       		// return serverResponse.pipe(response);
		        
		        });

				
				// return serverResponse.pipe(response, {end: true});
		

			});
			
			return request.pipe(req);
			// return request.pipe(req, {end: true}).pipe(response);
			// req.pipe(serverReq).pipe(res);
			// request.pipe(serverReq);

	





		// change this to promise..
		// var serverResponse = request(apiServerHost + req.url);
		// console.log("serverResponse bytesWRitten: ", serverResponse.headrs);
		// console.log("server response ", serverResponse);


		// while cache is full, remove old entries until enough space is available to cache new response
			//TEST
			// cache.removeOldest();
			

		// else cache has space

			//cache new server responsees for future req



		// pipe request to target host server, pipe response to proxy response
		// req.pipe(callHostServer).pipe(res);



			

	// }

		}
	} else {

		// not a GET request
		response.write('Not a GET request - Not forwarded');
	}

});




function handleError(error) {
	console.log(error.message);
}


module.exports = proxyServer;