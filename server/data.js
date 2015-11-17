var messages = [{ name: 'Alex', message:'Hello' }];

module.exports = messages;

// proxyServer.on('request', function(request, response) {
// 	// var url = url.parse(request.url).path;
// 	// console.log("REQEUST OBJ", request.host);
// 	// console.log("REQUEST HOST: ", request.host)
// 	var url = request.headers.host;
// 	console.log("url: ", url);

// 	if (request.method === 'GET') {
// 		var options = {};
// 		// var options = url.parse(request.url);
// 		options.headers = request.headers;
// 		options.method = request.method;
// 		options.port = 4000;
// 		console.log("options object: ", options);

// 		// if request is cached, return cached copy
// 		var cache;
// 		if (cache && cache[url]) {
// 			console.log("sending cached copy");
// 			cache[url].lastUsedTimeStamp = Date.now();
// 			response.send(cache[url]);

// 		} else {
// 			// else make server request
// 			var getRequest = http.request(options, function(serverResponse) {
// 				console.log("server response headers: ", serverResponse.headers);
// 				response.writeHead(serverResponse.statusCode, serverResponse.headers);
// 				// cache the response
// 				cache = new Cache('dolly');
		
// 				console.log("typeof url: ", typeof url);
// 				cache.add(url, serverResponse, 5000, 0, function() {
// 					console.log("added");
// 					console.log("new Cache: ", cache);
// 				});

		

// 		   //      response.on('data', function(chunk) {
// 		   //      	var size = 0;
// 		   //      	size += chunk.size;
// 		   //      	console.log("data event emitted, chunk", chunk.toString());
// 		   //      });

// 		   //      response.on('end', function() {
// 		   //      	console.log("end event emitted");
// 		   //      	var newCacheEntry = new CacheEntry(serverResponse, size);
// 					// cache.add(url, newCacheEntry);
// 		   //      	console.log("FULL DATA SIZE: ", size);
// 		   //      	console.log("NEW CACHE ENTRY: ", newCacheEntry);
	
// 		   //      });


// 				serverResponse.pipe(response);
// 			});

// 			request.pipe(getRequest);

// 		}

// 		// if NOT GET request
// 	} else {
// 		response.end("Not redirected");
// 	}

// });

// Implement a caching layer for your proxy that can be used in lieu of a call to the destination server. 
// The cache layer should allow for a configurable expiration time in milliseconds for individual entries as 
// well as overall caches based on size in bytes and number of elements. An example cache configuration might 
// look like:
// var cache = new Cache();



//getter and setter for cache?


//getCache?

// var cachedServerResponse = {
//     cacheDuration: 30 * 1000,
//     cacheSizeBytes: 1024 * 2,
//     cacheSizeElements: 50
//}
