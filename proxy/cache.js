var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('lodash');


// Cache inherit from EE - can emit events
util.inherits(Cache, EventEmitter);

  // {
  //   cacheDuration: 30 * 1000,
  //   cacheSizeBytes: 1024 * 2,
  //   cacheSizeElements: 50
  // }

// Cache constructor 
function Cache(maxElements, maxBytes) {

	var self = this;
	this.numElements = 0;
	this.numBytes = 0;
	this.maxSizeElements = maxElements || 5;
	this.maxSizeBytes = maxBytes || 205;
	this.store = {};
	this.on('expired', function(key) {
		console.log("cache entry has expired. Removing entry...");
		this.remove(key, function() {
			console.log('cache entry has expired. Removed entry.');
		});
	});
	// this.store.addEventListener('entryExpired', function(err, key) {
	// 	if (err) console.log('Error: ', err);
		
	// 	this.remove(key, function() {
	// 		console.log('cache entry has expired. Removed entry.');
	// 	});
	// });

}




// Cache.on('maxSizeReached', function(key) {
// 	console.log("Cache size limit reached. Removing older records...");
// 	this.remove(key, function() {
// 		console.log('Freeing up space by removing 1 records.');
// 	});
// });


// new cache entry constructor
function CacheEntry() {

	// var self = this;
	// this.data = data;
	// this.timestamp = Date.now();
	// console.log("this.timestamp: ", this.timestamp);
	// this.size = size; // how to determine the size of a resource in bytes?
	// register entry expiration event
}

Cache.prototype = Object.create(EventEmitter.prototype);


// // cache obj constructor
// function CacheEntry(duration, size) {
// 	this.cacheDuration = duration;
// 	this.timestamp;
// 	this.lastUsedTimestamp;
// 	this.size = size;
// }

// When a DNS record is stored in the cache of a DNS server, the record's TTL is continuously reduced as time go by, and when the TTL finally reaches zero the record is removed from the cache.

// register event -- or setTimeoutevent;

// Cache.prototype.getCache = function(name) {
// 	if (this.name === name) return this;
// };

Cache.prototype.add = function(key, data, size, cb, duration) {

	var self = this;
	console.log("Called cache add function");

	// checkCacheSize - if (this.numElements = maxNumEelements) || if (bytesRemaining <= 0)
		// while (bytesRemaining = 0 || numElementsRemaining = 0)
			//this.removeOldest 
	// validate key data type (string?) error handling
	if (typeof key !== 'string') throw new TypeError('Keys must be strings');
	

	// while cache is full, remove old entries until enough space is available to cache new response

	var bytesRemaining = this.maxSizeBytes - this.numBytes;
	var numElementsRemaining = this.maxSizeElements - this.numElements;

	console.log("MAX SIZE ELEMENTS: ", this.maxSizeElements);
	console.log("CURRENT NUM OF ELEMENTS: ", this.numElements);
	console.log("NUM ELEMENTS REMAINING: ", numElementsRemaining);

	console.log("TRUE OR NOT? ", this.maxSizeElements - this.numElements <= 0);
	while (this.maxSizeElements - this.numElements <= 0 || (size > this.maxSizeBytes - this.numBytes)) {
		console.log("CACHE IS FULL!!!! DELETING ELMEENTS");
		// this.removeOldest();
		console.log("THIS STORE: ", this.store);
		this.removeOldest();
		// removeOldest(this.store);
	}

	
		// else cache has space, create new entry

			//cache new server responsees for future req

	var newEntry = new CacheEntry();
	newEntry.timestamp = Date.now();
	newEntry.size = size;
	newEntry.data = data;


	newEntry.duration = duration || 3600000;
	newEntry.expiration = duration + this.timestamp || 3600000 + newEntry.timestamp; // default 1 hour

	newEntry.cacheDuration = setTimeout(function() {
							console.log("DURATION: ", newEntry.duration);
							// console.log("what is 'this': ", this);
							self.emit('expired', key);
						}, newEntry.duration);
	
	// var obj = {};
	// obj.data = data;
	// obj.timestamp = Date.now();
	// obj.cacheDuration = duration + obj.timestamp || 3600000 + obj.timestamp; // default 1 hour
	// obj.lastUsedTimestamp;
	// obj.size = size || 0;
	
	// if (!duration) duration = 50000; // set default ttl (time-to-live) to 1 hour
	this.store[key] = newEntry;
	this.numElements++;
	this.numBytes += newEntry.size;

	// check if max size reached? 
	// this.bytesRemaining = this.maxSizeBytes - data.size;
	cb();
};

Cache.prototype.get = function(key) {
	console.log("called cache.get");
	return this.store[key];
};

Cache.prototype.hasKey = function(key) {
	return (this.store[key]);
};

Cache.prototype.remove = function(key, cb) {
	delete this.store[key];
	cb();
};

Cache.prototype.clearAll = function() {
	var store = this.store;
	for (var key in store) {
		if (store.hasOwnProperty(key)) {
			delete store[key];
		}
	}

	this.numElements = 0;
	this.numBytes = 0;

};

Cache.prototype.removeOldest = function() {
	// check if store is empty;
	var store = this.store;
	console.log("STORE: ", store);
	var oldestEntry = _.min(store, function(entry) {
		console.log("etnry timestamp:", entry.timestamp);
		return entry.timestamp;
	});
	
	// console.log("OLDEST ENTRY: ", oldestEntry);
	var oldestEntryKey = _.findKey(store, oldestEntry);
	
	console.log("oldestEntryKey", oldestEntryKey);
	console.log("Deleted ", store[oldestEntryKey]);
	var bytesFreed = store[oldestEntryKey].size;
	console.log("BYTES FREED:", bytesFreed);
	delete store[oldestEntryKey];
	this.numElements--;
	this.numBytes = this.numBytes - bytesFreed;
	console.log("updated number of elmenets after removal: ", this.numElements);
	console.log('updated num bytes after removal: ', this.numBytes);
};



// function removeOldest(store) {

// 	console.log("STORE: ", store);

// 	var oldestEntry = _.min(store, function(entry) {
// 		console.log("etnry timestamp:", entry.timestamp);
// 		return entry.timestamp;
// 	});
	
// 	// console.log("OLDEST ENTRY: ", oldestEntry);
// 	var oldestEntryKey = _.findKey(store, oldestEntry);
	
// 	console.log("oldestEntryKey", oldestEntryKey);
// 	delete store[oldestEntryKey];
// }
// 	// var timestamps = [];
	// var oldestKey = Math.min.apply

	// _.findKey(this.store, function(entry) {
	// 	entry.timestamp
	// })

	// this.store.forEach(function(key) {
	// 	timestamps.push(key.timestamp);
	// })

	// for (var key in store) {
	// 	var oldest = key;
	// 	if ()
	// }

	// var oldest = Math.min.apply(timestamps);

// this emit even twill be on the duration property of entry




// whenever entry in cache is expired (duration time = 0), emit expired event and auto remove key from cache where LRU (least recently used) timestampt is longest is eveicted - lastUsed time 


function createCache() {
	return new Cache();
}

function createNewEntry() {
	return new CacheEntry();
}

module.exports = createCache();


// benefits of caching - in memory:
// improve latencies, ease the load on your databae, reduce hardware costs