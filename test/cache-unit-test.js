var cache = require('../proxy/cache'),
    chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect,
    should = chai.should();
    
chai.use(sinonChai);


describe('Caching Layer - Unit', function() {

    beforeEach(function() {
        cache.clearAll();
        cache.maxSizeElements = 5;
        cache.maxSizeBytes = 205;
    });

    describe('Entry insertion and removal', function() {

        it ('should set first cache entry as both head and tail of cache', function() {

            cache.add('/assets/1', 'some data', 5);

            expect(cache.head.key).to.equal('/assets/1');
            expect(cache.tail.key).to.equal('/assets/1');

        });

        it ('should add most recently used entries to tail of cache', function() {

            cache.add('/assets/1', 'some data', 5);
            cache.add('/assets/2', 'some data', 5);
            cache.add('/assets/3', 'some data', 5);

            expect(cache.tail.key).to.equal('/assets/3');

        });

        it ('should remove least recently used entries from head of cache', function() {
            cache.add('/assets/1', 'some data', 5);
            cache.add('/assets/2', 'some data', 5);
            cache.add('/assets/3', 'some data', 5);

            expect(cache.head.key).to.equal('/assets/1');

            cache.removeOldest();

            expect(cache.head.key).to.equal('/assets/2');

        });

        it ('should move an older entry to tail when that entry is requested from cache', function() {

            cache.add('/assets/1', 'some data', 5, 10000);
            cache.add('/assets/2', 'some data', 5, 10000);
            cache.add('/assets/3', 'some data', 5, 10000);

            expect(cache.tail.key).to.equal('/assets/3');

            cache.get('/assets/1');
            expect(cache.tail.key).to.equal('/assets/1');

            cache.get('/assets/3');
            expect(cache.tail.key).to.equal('/assets/3');

            cache.get('/assets/3');
            expect(cache.tail.key).to.equal('/assets/3');

        });


    });


    describe('Memory management', function() {

        it ('should track memory and size limits as new entries are added', function() {

            cache.add('/assets/1', 'some data', 5);

            expect(cache.numElements).to.equal(1);
            expect(cache.numBytes).to.equal(5);

            cache.add('/assets/2', 'some data', 5);

            expect(cache.numElements).to.equal(2);
            expect(cache.numBytes).to.equal(10);

        });

        it('should remove LRU entries as max cache memory (bytes) is reached', function() {

            cache.maxSizeBytes = 100;
            var entrysize1 = 60;
            var entrysize2 = 60;
            var removeOldest = sinon.spy(cache, 'removeOldest');

            cache.add('/assets/1', 'some data', entrysize1);
            cache.add('/assets/2', 'some data', entrysize2);
            
            expect(cache.store).to.not.have.property('/assets/1');
            expect(cache.store).to.have.property('/assets/2');
            sinon.assert.calledOnce(removeOldest);
            removeOldest.restore();
         
        });

        it ('should remove LRU entries as max cache size (# of entries) is reached', function() {

            cache.maxSizeElements = 3;

            cache.add('/assets/1', 'some data', 5);
            cache.add('/assets/2', 'some data', 5);
            cache.add('/assets/3', 'some data', 5);
            cache.add('/assets/4', 'some data', 5);

            expect(cache.numElements).to.equal(3);
            expect(cache.store).to.not.have.property('/assets/1');
            expect(cache.store).to.have.property('/assets/4');

        });

    });

    describe('Cache duration management', function() {

        var eventSpy = sinon.spy();
        var spy = sinon.spy(cache, 'remove');
        var originalDuration;
        var originalTime;
        var entry1;
        var entry2;

        cache.on('expired', eventSpy);

        beforeEach(function(done) {

            entry1 = cache.add('/assets/1', 'some data', 5, 1000);
            entry2 = cache.add('/assets/2', 'some data', 5);
            originalTime = entry2.timestamp;
            originalDuration = entry2.duration;

            setTimeout(function() {
                cachedEntry2 = cache.get('/assets/2');
                done();
            }, 1000);

        });

        it('should emit an "expired" event when an entry expires', function() {

            sinon.assert.calledOnce(eventSpy);

        });

        it ('should remove individual entries as they expire', function() {

                expect(cache.store).to.not.have.property('/assets/1');
                sinon.assert.calledTwice(spy);
                spy.restore();
                
        });

        it ('should refresh timestamp and cache duration of an entry when served from cache', function(done) {

            expect(cachedEntry2.timestamp).to.be.above(originalTime);
            expect(cachedEntry2.duration).to.equal(originalDuration);
            done();

        });

    });

});

 