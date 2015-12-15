# Node Caching Proxy

My implementation of an HTTP server that behaves as a transparent caching reverse proxy for incoming GET requests using Node.js. 

## How It Works

1. **Proxy server**: The proxy accepts incoming HTTP GET requests and forwards them on to a destination host server. It fowards back server responses to the client and caches the response for retrieval in future requests of the same resource, done in lieu of a call to the host server. 

2. **Cache**: A configurable in-memory LRU (least recently used) cache that uses a hash map for O(1) lookup time of cached entries. It stores up to 50 entries or 5MB of memory by default and has the following methods: 
  * ```add```
  * ```get```
  * ```removeOldest```
  * ```remove```
  * ```clearAll```
  * ```hasKey```
  * ```isFull```
  * ```isEmpty```

A doubly linked list is used for efficient entry insertion and removal. Newest entries are added to tail, while oldest entries are removed from head in O(1) time as memory and size limits are reached. Individual entries also emit an ```expired``` event and are cleared from cache after 1 hour by default.

3. **Host server**: The host server is the destination where the proxy forwards requests and is set to listen to requests on port 4000. It sends back a basic text response for demo purposes. 

## How to Install

1. Install Node.js.

2. Clone the **node-cache-proxy** repository link .

```javascript
$ git clone https://github.com/cl2205/cache-proxy-node.git
$ cd cache-proxy-node
```
## Launching

The proxy can be launched by running ```node proxy``` in the root directory. 

```javascript
$ node proxy 
```

In a new terminal window, launch the host server by running ```node server``` in root.

```javascript
$ node server
```

Now, you can make GET requests to http://localhost:3000 using curl, a browser, or POSTMAN, etc.

Example: 
```javascript
$ curl http://localhost:3000
```
will return ```Some static content```

The response is now stored in the proxy's in-memory cache and will be retrieved from the cache in future requests, until cache is full or the entry expires.

## Testing

Mocha tests are run against a separate test proxy and test host server.

Run ```npm install``` to install test dependencies and ```npm test``` to run tests for this project. It's that simple :)

```javascript
$ npm install
$ npm test
```

