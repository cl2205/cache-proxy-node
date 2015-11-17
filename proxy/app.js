// var app = require('express')(); // create Express app
var proxyServer = require('./index.js');
var request = require('request');
var db = require('../server/data');
var cache = require('./cache');
var apiServerHost = 'http://localhost:4000';
var http = require('http');
// var apiServerHost = require('../server')

console.log("Proxy server: ", proxyServer);

// app.get('/api/*', function(req, res) {

proxyServer.on('request', function(request, response) {
// 	// var url = url.parse(request.url).path;
// 	// console.log("REQEUST OBJ", request.host);
// 	// console.log("REQUEST HOST: ", request.host)
	switch (request.method) {

		case 'GET':

			var url = request.url;
			console.log("url: ", url);

		// 	if (request.method === 'GET') {

			// console.log("REQ HEADERS: ", req.headers);
			// var url = req.url;
			// console.log("REQ URL: ", req.url);

			// if cached, send cached resource

			if (cache.hasKey(url)) {

				console.log("Url is cached. Retrieving from cache...");

				var resource = cache.get(url).data;

				// update timestamp to current retrieval time and serve resource
				resource.timestamp = Date.now();

				// console.log("CACHED RESOURCE: ", resource);
				res.send(resource);

			// else forward request to host server

			} else {

				console.log("forwarding request to host server on port 4000");

				var options = {};
				// var options = url.parse(request.url);
				options.url = request.headers.host;
				options.path = '/api/';
				options.headers = request.headers;
				options.method = request.method;
				options.port = 4000;
				console.log("options object: ", options);

				// else make server request
				var serverReq = http.request(options, function(serverResponse) {

					// console.log("server response headers: ", serverResponse.headers);
					res.writeHead(serverResponse.statusCode, serverResponse.headers);
					// cache the response
					serverResponse.pipe(response);
			
			        serverResponse.on('data', function(chunk) {
			        	console.log("data event emitted, chunk", chunk.toString());
			        });

			        serverResponse.on('end', function() {
			        	console.log("end event emitted");
			       
			        	// console.log("FULL DATA SIZE: ", size);
			        	// console.log("NEW CACHE ENTRY: ", newCacheEntry);
		
			        });
				});

					// req.pipe(serverReq).pipe(res);
					// request.pipe(getRequest);

			

			}
			break;

		case 'POST':

			var newMessage = request.query;
			db.push(newMessage);
			response.writeHead(200, response.headers);
			response.write("new message posted");
			response.end();

			break;
			
	}

});




				// change this to promise..
				// var serverResponse = request(apiServerHost + req.url);
				// console.log("serverResponse bytesWRitten: ", serverResponse.headrs);
				// console.log("server response ", serverResponse);
				// while cache is full, remove old entries until enough space is available to cache new response
					//TEST
					// cache.removeOldest();
					

				// else cache has space

					//cache new server responsees for future req

					// cache.add(url, serverResponse, 5000000, 2, function() {
					// 	console.log("updated cache: ", cache.store['/api/'].data);

					// });


				// pipe request to target host server, pipe response to proxy response
				// req.pipe(callHostServer).pipe(res);


		// when new req comes in

			// check if req isCached

				// if req isCached, retrieve from cache and serve

				// else forward to server 

					

			// }


app.post('/api/', function(req, res) {

	console.log("HIT POST ROUTE");
	// console.log("Request obj: ", req);
	// console.log("Req qs: ", req.query);
	var newMessage = req.query;
	db.push(newMessage);
	res.send("new message posted");
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
	console.log("ERROR REQUEST: ", req.url);
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


module.exports = app;

