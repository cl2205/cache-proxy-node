var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('lodash');


// Cache inherit from EE - can emit events
util.inherits(Cache, EventEmitter);

// Cache constructor 
function Cache(maxElements, maxBytes) {

	var self = this;
	this.numElements = 0;
	this.numBytes = 0;
	this.maxSizeElements = maxElements || 5;
	this.maxSizeBytes = maxBytes || 205;
	this.store = {};
	this.on('expired', function(key) {
		// listener to remove individual entry when expired
		this.remove(key, function() {
			console.log('cache entry has expired. Removed entry.');
		});
	});
}

function createCache() {
	return new Cache();
}

// cache entry factory function
function createCacheEntry(data, size, duration) {
	var obj = {
		data: data,
		timestamp: Date.now(),
		size: size,
		duration: duration || 3600000,
		expiration: undefined
	};

	return obj;

}


Cache.prototype.add = function(key, data, size, cb, duration) {

	var self = this;

	// validation
	if (typeof key !== 'string') throw new TypeError('Keys must be strings');
	
	// while cache is full (numElements or numBytes)
	while (this.maxSizeElements - this.numElements <= 0 || (size > this.maxSizeBytes - this.numBytes)) {

		console.log("Cache is full. Freeing up space before adding...");

		//remove old entries until enough space is available to cache new response
		this.removeOldest();
	}

	
	// create new cache entry
	var newEntry = createCacheEntry(data, size, duration);

	// set timeout before emitting 'expired' event
	newEntry.expiration = setTimeout(function() {
							self.emit('expired', key);
						}, newEntry.duration);

	// save entry to hash table 'store' with url path as key
	// update cache size
	this.store[key] = newEntry;
	this.numElements++;
	this.numBytes += newEntry.size;

	// call callback
	if (cb !== undefined) cb();
};

Cache.prototype.removeOldest = function() {

	// if cache is empty, return
	if (Object.keys(this.store).length === 0) return;

	// find oldest entry, remove from cache, update cache size
	var store = this.store;

	var oldestEntry = _.min(store, function(entry) {
		return entry.timestamp;
	});

	var oldestEntryKey = _.findKey(store, oldestEntry);

	var bytesFreed = store[oldestEntryKey].size;

	delete store[oldestEntryKey];

	this.numElements--;
	this.numBytes = this.numBytes - bytesFreed;

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

Cache.prototype.get = function(key) {
	var entry = this.store[key];
	// update timestamp & refresh cache duration before serving
	entry.timestamp = Date.now();
	entry.duration = 3600000; // reset to default
	return entry;
};

Cache.prototype.hasKey = function(key) {
	return !!(this.store[key]);
};

Cache.prototype.remove = function(key, cb) {
	delete this.store[key];
	cb();
};

module.exports = createCache();