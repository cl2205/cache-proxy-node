/* Host server houses resources and sends resource when requested. */

var http = require('http');
var url = require('url');
var hostServer = http.createServer().listen(4000, function() {
	console.log('server listening on port 4000');
});

hostServer.on('request', function(request, response) {

	console.log("host server called");

    // contrived 'not found' resource
	if (request.url === "/notfound") {

		response.writeHead(404);
		response.write('Page Not Found');

	} else {

		response.writeHead(200);
		response.write('Some static content');

	}

	response.end();


});


hostServer.on('error', function(err){
	console.log('error: ', err);

});

module.exports = hostServer;