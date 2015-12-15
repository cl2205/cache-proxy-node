/* Host server houses resources and sends resource when requested. */

var http = require('http');
var url = require('url');
var hostServer = http.createServer().listen(4100);

hostServer.on('request', function(request, response) {

    // contrived 'not found' resource
	if (request.url === "/notfound") {

		response.writeHead(404);
		response.write('Page Not Found');

	} else {

		response.writeHead(200);
		response.write('Some static content to be cached');

	}

	response.end();


});


hostServer.on('error', function(err){
	console.log('error: ', err);

});

module.exports = hostServer;