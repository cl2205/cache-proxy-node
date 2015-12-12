## Node Caching Proxy

My implementation of an HTTP server that behaves as a transparent caching proxy for GET requests using Node.js. 

The proxy accepts incoming HTTP GET requests and forwards them on to a destination host server, with a caching layer to reduce server load when possible.

Caveats: 
- Does not cover full validation/error handling at the moment
- Assumes http headers are not stored in cache

Testing:

Run 'npm install' to install dependencies and 'npm test' in the command line to run tests for this project.
