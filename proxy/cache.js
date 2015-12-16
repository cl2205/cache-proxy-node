/* Cache uses a hash map to store most recently 
used entries with O(1) lookup time and a doubly linked list 
to manage order when entries are added or removed. Newest 
entries are added to tail, while oldest entries are removed
from head as memory and size limits are reached. Using Event Emitters, 
individual entries also have a default self-expiration of 1 hour. */

var EventEmitter = require('events').EventEmitter;
var util = require('util');

// Cache inherit from EE
util.inherits(Cache, EventEmitter);

/* Cache constructor has default memory limit of 5MB and size limit
of 50 entries. Tracks currently used memory and size and listens
for an 'expired' event. */
    
function Cache(maxElements, maxBytes) {

    this.maxSizeElements = maxElements || 50;  // default 50 entries
    this.maxSizeBytes = maxBytes || 5000000; // default 5MB
    this.store = {};
    this.head;
    this.tail;
    this.numElements = 0;
    this.numBytes = 0;
    this.on('expired', function(key) {
        this.remove(key);
    });
}

function createCache() {
    return new Cache();
}

/* Cache entry factory function. Each entry contains
host server response data, timestamp, size, 1-hr self-expiration, and 
pointers to older and newer entries in doubly linked list. */

function createCacheEntry(key, data, size, duration) {
    var obj = {
        key: key,
        data: data,
        timestamp: Date.now(),
        size: size,
        duration: duration || 3600000, // default 1 hour 
        expiration: undefined,
        next: null,
        previous: null
    };

return obj;

}

/* Adds new entry to cache. Checks whether cache is full and
clears entries from head of linked list as needed 
before inserting new entry to end of linked list */

Cache.prototype.add = function(key, data, size, duration) {

    var self = this;

    if (typeof key !== 'string') throw new TypeError('Keys must be strings');

    while (this.isFull(size)) {
        this.removeOldest();
    }

    var newEntry = createCacheEntry(key, data, size, duration);

    // set cache duration / self-expiration on entry
    newEntry.expiration = setTimeout(function() {
        self.emit('expired', key);
    }, newEntry.duration);

    // if cache is empty, set 1st entry to both head and tail

    if (typeof this.head === 'undefined' && typeof this.tail === 'undefined') {
        this.head = newEntry;
        this.tail = newEntry;

    // else add newest entry to tail 

    } else {

        this.tail.next = newEntry;
        newEntry.previous = this.tail;
        this.tail = newEntry;
    }

    // save entry to hash map with url path as key and update cache size

    this.store[key] = newEntry;
    this.numElements++;
    this.numBytes += newEntry.size;

    return this.store[key];

};

/* Removes the oldest (least recently used) entries 
from cache and returns entry */

Cache.prototype.removeOldest = function() {

    if (this.isEmpty()) return;

    var oldestEntry = this.head;

    // if 1 entry exists
    if (this.head === this.tail) {
        this.head = undefined;
        this.tail = undefined;

    // else set new header
    } else {

        this.head = this.head.next;
        this.head.previous = null;

    }

    // clear pointers of entry to remove
    oldestEntry.previous = null;
    oldestEntry.next = null;

    var bytesFreed = oldestEntry.size;

    delete this.store[oldestEntry.key];

    this.numElements--;
    this.numBytes = this.numBytes - bytesFreed;

    return oldestEntry;
};

/* removes individual entries from cache. This method is called
as individual entries expire even if cache has not
reached memory or size limits */

Cache.prototype.remove = function(key) {

    var entry = this.store[key];

    // if not cached, return
    if (!entry) return;

    // if it is the only entry
    if (this.head === this.tail) {
        this.head = undefined;
        this.tail = undefined;

     // if it is the most recent entry, set new tail
    } else if (entry === this.tail) {
        this.tail = this.tail.previous;
        this.tail.next = null;

    // if is the oldest entry , set new head
    } else if (entry === this.head) {
        this.head.next = this.head;
        this.head.previous = null;

    // else is middle entry, link neighboring entries
    } else {
        entry.previous.next = entry.next;
        entry.next.previous = entry.previous;

    }

    // clear pointers of entry to remove
    entry.previous = null;
    entry.next = null;

    var bytesFreed = entry.size;
    this.numElements--;
    this.numBytes = this.numBytes - bytesFreed;

    delete this.store[key];

    return entry;
};

/* retrieves cached entry in O(1) time and moves it to tail 
(most recent) before returning entry contents */

Cache.prototype.get = function(key) {

    var entry = this.store[key];

    // if not cached, return
    if (!entry) {
        return;
    }

    // refresh timestamp and duration
    entry.timestamp = Date.now();
    entry.duration = 3600000;

    // if it is the only entry or already is most recent entry
    if ((entry === this.head && entry === this.tail) || entry === this.tail ) 
        return entry;

    // it if is the oldest entry 
    if (entry === this.head) {
        this.head.next = this.head
        this.head.previous = null;
    } else {
        entry.previous.next = entry.next;
        entry.next.previous = entry.previous;
    }

    // move to tail and return entry
    entry.previous = this.tail;
    this.tail.next = entry;
    this.tail = entry;
    this.tail.next = null;

    return entry;
};

/* removes all entries and resets 
cache properties */

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