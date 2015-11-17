var http = require('http');
var url = require('url');

// Target http server

var hostServer = http.createServer().listen(4000, function() {
	console.log("host listening on port 4000");
});

hostServer.on('request', function(err, response) {

	if (err) console.log(err);

	console.log("request received by host server");
	var message = 'request successfully proxied to port 4000';
	// var byteLengthOfMessage = Buffer.byteLength(message);
	// var byteLengthOfHeaders = Buffer.byteLength(response.headers);
	// var totalBytes = byteLengthOfHeaders + byteLengthOfMessage;
	// console.log("BUFFER BYTE LENGTH: ", byteLengthOfMessage);
	// console.log("TOTAL BYTES: ", totalBytes);
	response.writeHead(200, {'Content-Type': 'text/plain'});
	// response.writeHead(200, {'Content-Type': 'text/plain',
	// 					'Content-Length': totalBytes });
	// res.setHeader('Content-Length', totalBytes);
	response.write(message);
	response.end();
});

// error handling

hostServer.on('error', function(err){
	console.log('error: ', err);
});

module.exports = hostServer;