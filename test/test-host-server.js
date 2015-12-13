var http = require('http');
var url = require('url');
var hostServer = http.createServer().listen(4100);

// Target http server

hostServer.on('request', function(request, response) {

	var message = 'request successfully proxied to port 4000';

	response.writeHead(200, {'Content-Type': 'text/plain'});
	response.write(message);
	response.end();
});


hostServer.on('error', function(err){
	console.log('error: ', err);
});

module.exports = hostServer;