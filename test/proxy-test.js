var proxy = require('../proxy'),
    server = require('../server'),
    cache = require('../proxy/cache'),
	chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
	expect = chai.expect,
	should = chai.should(),
    request = require('supertest-as-promised')(proxy),
    http = require('http');
    
chai.use(sinonChai);


describe('Proxy Server', function () {

    describe('GET requests', function() {

        afterEach(function() {
            cache.clearAll();
            cache.maxSizeElements = 5;
            cache.maxSizeBytes = 205;
        });


        it ('should send a 200 response', function() {

            return request.get('/api/').expect(200);

        });

        it ('should forward initial requests to host server', function() {
 
            var spy = sinon.spy(http, 'request');


            // var request = sinon.stub();
            // var expectedResult = 'request successfully proxied';

            // request.withArgs('/api/').yields(null, expectedResult);

            // request('/api', function(err, data) {
            //     expect(err).to.be.null;
            //     expect(data).to.equal('request successfully proxied');
            //     done();
            // });
            // request.restore();

            return request.get('/api/').then(function(res) {

                sinon.assert.calledTwice(spy);

                http.request.restore();

                expect(res.text).to.equal('request successfully proxied to port 4000');
                return;
            });
            
        });

        it ('should NOT forward other request actions (ie. POST, PUT, DELETE)', function() {

            request.post('/api/', {}).expect(200).then(function(res) {
                 expect(res.text).to.equal('Not a GET request - Not forwarded');
                 return;
            });
           
        });

        it ('should cache response after initial request', function() {

            return request.get('/api/')
                .expect(200)
                .then(function(res) {
                    expect(cache.store).to.have.property('/api/');
                    return;
                });
        });


        it ('should retrieve from cache for 2nd request', function() {
           
           var cacheSpy = sinon.spy(cache, 'get');
    
            return request.get('/api/').expect(200)
            .then(function(res) {

                cacheSpy.should.not.have.been.called;
                return request.get('/api/').expect(200);
            })
            .then(function(res) {
                sinon.assert.calledOnce(cacheSpy);
                cache.get.restore();
                return;
            });

        });

        it ('should improve load/reponse times for cached requests', function() {
            
            var newReqTime;
            var cachedReqTime;
            var start2;
            var start1 = Date.now();

            return request.get('/api/').expect(200)

            .then(function(res) {
                newReqTime = Date.now() - start1;
                start2 = Date.now();
                return request.get('/api/').expect(200);
            })

            .then(function(res) {
                cachedReqTime = Date.now() - start2;
                expect(cachedReqTime).to.be.below(newReqTime);
                console.log("New req response time: %dms", newReqTime);
                console.log("Cached req response time: %dms", cachedReqTime);
                return;
            });

        });

       
    }); // describe GET requests

}); // Transparent Server



describe('Caching Layer', function() {

    afterEach(function() {
        cache.clearAll();
        cache.maxSizeElements = 5;
        cache.maxSizeBytes = 205;
    });

    it ('should set first cache entry as both head and tail of cache', function() {

        cache.add('/api/1', 'some data', 5);
        expect(cache.head.key).to.equal('/api/1');
        expect(cache.tail.key).to.equal('/api/1');

    });

    it ('should add most recently used entries to tail of cache', function() {

        cache.add('/api/1', 'some data', 5);
        cache.add('/api/2', 'some data', 5);
        cache.add('/api/3', 'some data', 5);

        expect(cache.tail.key).to.equal('/api/3');

    });

    it ('should remove least recently used entries from head of cache', function() {
        cache.add('/api/1', 'some data', 5);
        cache.add('/api/2', 'some data', 5);
        cache.add('/api/3', 'some data', 5);

        expect(cache.head.key).to.equal('/api/1');
        cache.removeOldest();
        expect(cache.head.key).to.equal('/api/2');

    });

    it ('should move an older entry to tail when that entry is requested from cache', function() {

        cache.add('/api/1', 'some data', 5, 10000);
        cache.add('/api/2', 'some data', 5, 10000);
        cache.add('/api/3', 'some data', 5, 10000);
        expect(cache.tail.key).to.equal('/api/3');

        cache.get('/api/1');
        expect(cache.tail.key).to.equal('/api/1');

    });


    it ('should track memory and size limits as new entries are added', function() {

        cache.add('/api/1', 'some data', 5);

        expect(cache.numElements).to.equal(1);
        expect(cache.numBytes).to.equal(5);

        cache.add('/api/2', 'some data', 5);

        expect(cache.numElements).to.equal(2);
        expect(cache.numBytes).to.equal(10);

    });

          
    it('should remove LRU entries as max cache memory (bytes) is reached', function() {

        var entrysize1 = 60;
        var entrysize2 = 60;
        var removeOldest = sinon.spy(cache, 'removeOldest');

        cache.maxSizeBytes = 100;
        cache.add('/api/1', 'some data', entrysize1);
        cache.add('/api/2', 'some data', entrysize2);
        removeOldest.restore();
        
        expect(cache.store).to.not.have.property('/api/1');
        expect(cache.store).to.have.property('/api/2');
        sinon.assert.calledOnce(removeOldest);
     
    });

    it ('should remove LRU entries as max cache size (# of entries) is reached', function() {

        cache.maxSizeElements = 3;

        cache.add('/api/1', 'some data', 5);
        cache.add('/api/2', 'some data', 5);
        cache.add('/api/3', 'some data', 5);
        cache.add('/api/4', 'some data', 5);

        expect(cache.numElements).to.equal(3);
        expect(cache.store).to.not.have.property('/api/1');
        expect(cache.store).to.have.property('/api/4');

    });

    it('should emit an "expired" event when an entry expires', function() {
        var eventSpy = sinon.spy();
        setTimeout(function() {
            sinon.assert.calledOnce(eventSpy);
            eventSpy.restore();
        }, 1000);

        cache.on('expired', eventSpy);
    });

    it ('should remove LRU cached entries as they expire', function() {

        cache.add('/api/1', 'some data', 5, 1000);
    
        setTimeout(function() {
            expect(cache.store).to.not.have.property('/api/1');
        }, 1500);
            
    });

    it ('should refresh timestamp and expiration of an entry when served from cache', function() {

        cache.add('/api/1', 'some data', 5, 10000);

        var entry = cache.store['/api/1'];
        var originalTime = entry.timestamp;

        setTimeout(function() {
            var originalDuration = entry.duration;
            cache.get('/api/1');
            console.log("original duration: ", originalDuration, " updated duration: ", entry.duration);
            expect(entry.timestamp).to.be.above(originalTime);
            expect(entry.duration).to.be.above(originalDuration);

        }, 1000);

    });

});

 