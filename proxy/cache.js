var EventEmitter = require('events').EventEmitter;
var util = require('util');


// Cache inherit from EE - can emit events
util.inherits(Cache, EventEmitter);

// Cache constructor 
function Cache(maxElements, maxBytes) {

	var self = this;
	this.head;
	this.tail;
	this.numElements = 0;
	this.numBytes = 0;
	this.maxSizeElements = maxElements || 5;
	this.maxSizeBytes = maxBytes || 100000;
	this.store = {};
	this.on('expired', function(key) {
		this.remove(key, function() {
		});
	});
}

function createCache() {
	return new Cache();
}

// cache entry factory function
function createCacheEntry(key, data, size, duration) {
	var obj = {
		key: key,
		data: data,
		timestamp: Date.now(),
		size: size,
		duration: duration || 3600000,
		expiration: undefined,
		next: null,
		previous: null
	};

	return obj;

}


Cache.prototype.add = function(key, data, size, duration) {

	var self = this;

	if (typeof key !== 'string') throw new TypeError('Keys must be strings');
	
    while (this.isFull(size)) {
		this.removeOldest();
	}

	// create new cache entry
	var newEntry = createCacheEntry(key, data, size, duration);

	// set timeout before emitting 'expired' event
	newEntry.expiration = setTimeout(function() {
		self.emit('expired', key);
	}, newEntry.duration);

	// if cache is empty
	if (typeof this.head === 'undefined' && typeof this.tail === 'undefined') {
		this.head = newEntry;
		this.tail = newEntry;

	} else {
		// else add entry to Tail - adjust pointers
		this.tail.next = newEntry;
		newEntry.previous = this.tail;
		this.tail = newEntry;
	}
	
	// save entry to hash table 'store' with url path as key
	// update cache size
	this.store[key] = newEntry;
	this.numElements++;
	this.numBytes += newEntry.size;

};

Cache.prototype.removeOldest = function() {

	if (this.isEmpty()) return;

	var oldestEntry = this.head;

	// if 1 entry 
	if (this.head === this.tail) {
		this.head = undefined;
		this.tail = undefined;

	} else {
		this.head = this.head.next;
		this.head.previous = null;
	}

	oldestEntry.previous = null;
	oldestEntry.next = null;

	var bytesFreed = oldestEntry.size;

	delete this.store[oldestEntry.key];

	this.numElements--;
	this.numBytes = this.numBytes - bytesFreed;

	return oldestEntry;
};

Cache.prototype.clearAll = function() {
	var store = this.store;
	for (var key in store) {
		if (store.hasOwnProperty(key)) {
			delete store[key];
		}
	}
	this.head = undefined;
	this.tail = undefined;
	this.numElements = 0;
	this.numBytes = 0;

};

Cache.prototype.get = function(key) {
	var entry = this.store[key];
	if (!entry) return;
	// update timestamp & refresh cache duration before serving
	entry.timestamp = Date.now();
	entry.duration = 3600000; // reset to default

	// if 1 entry or most recent entry (tail)
	if ((entry === this.head && entry === this.tail) || entry === this.tail ) 
		return entry;

	if (entry === this.head) {

		this.head.next = this.head
		this.head.previous = null;

	} else {
		// middle node
		entry.previous.next = entry.next;
		entry.next.previous = entry.previous;
	}

	// move retrieved entry to tail, adjust pointers
	entry.previous = this.tail;
	this.tail.next = entry;
	this.tail = entry;
	this.tail.next = null;

	return entry;
};

Cache.prototype.hasKey = function(key) {
	return !!(this.store[key]);
};

Cache.prototype.isFull = function(entrySize) {
    return (this.maxSizeElements - this.numElements <= 0 || entrySize > this.maxSizeBytes - this.numBytes);
};

Cache.prototype.isEmpty = function() {
	return typeof this.head === 'undefined' && typeof this.tail === 'undefined';
};

module.exports = createCache();