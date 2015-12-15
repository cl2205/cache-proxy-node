# Node Caching Proxy

## Summary

My implementation of an HTTP server that behaves as a transparent caching reverse proxy for incoming GET requests using Node.js. 


## How It Works

1. **Proxy server**: The proxy accepts incoming HTTP GET requests and forwards them on to a destination host server. It fowards back server responses to the client and caches the response for retrieval for future requests of the same resource in lieu of a call to the host server. 

...The proxy can be launched by running ```node proxy``` in the root directory.

2. **Cache**: A temporary in-memory LRU (least recently used) cache that uses a hash map and doubly linked list. Stores up to 50 entries or 5MB of memory by default. Hash allows for O(1) lookup time of cached entries. Newest entries are added to tail, while oldest entries are removed in O(1) time from head as memory and size limits are reached. Individual entries also have a default self-expiration and are removed from cache after 1 hour.


3. **Host server**: The host server is the destination where the proxy forwards requests and is set to listen to requests on port 4000. It sends back a basic text response for a demo purposes. 

...The host server can be launched by running ```node server``` in root.

## Testing:

Tests are run against a separate test proxy and test host server.

Run ```npm install``` to install dependencies and ```npm test``` in the command line to run tests for this project. It's that simple :)
