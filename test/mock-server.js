var http = require('http');
var url = require('url');
var hostServer = http.createServer().listen(4100, function() {
	console.log("host listening on port 4100");
});

// Target http server

hostServer.on('request', function(err, response) {

	if (err) console.log(err);

	console.log("request received by host server");

	var message = 'request successfully proxied to port 4000';
	response.writeHead(200, {'Content-Type': 'text/plain'});
	response.write(message);
	response.end();
});

// error handling

hostServer.on('error', function(err){
	console.log('error: ', err);
});

module.exports = hostServer;