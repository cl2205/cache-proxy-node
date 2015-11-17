// var cache = require('../proxy/cache'),
//     chai = require('chai'),
//     sinon = require('sinon'),
//     sinonChai = require('sinon-chai'),
//     expect = chai.expect,
//     should = chai.should();
    
// chai.use(sinonChai);

// describe('Caching Layer', function() {

//     afterEach(function() {
//         cache.clearAll();
//         cache.maxSizeElements = 5;
//         cache.maxSizeBytes = 205;
//     });

//     var cb = function() {
//         return;
//     };

//     it ('should keep track of cache size as new entries are added', function() {

//         cache.add('/api/1', 'some data', 5);

//         expect(cache.numElements).to.equal(1);
//         expect(cache.numBytes).to.equal(5);

//         cache.add('/api/2', 'some data', 5);

//         expect(cache.numElements).to.equal(2);
//         expect(cache.numBytes).to.equal(10);

//     });

//     it('should hold only as many entries as it can fit (in number)', function(done) {

//         cache.maxSizeElements = 2;

//         cache.add('/api/1', 'some data', 5);
//         cache.add('/api/2', 'some data', 5);
//         cache.add('/api/3', 'some data', 5);

//         expect(cache.numElements).to.equal(2);

//         done();

//     });

//     it('should hold only as many entries as it can fit (in bytes)', function(done) {

//         var entrysize1 = 60;
//         var entrysize2 = 60;

//         cache.maxSizeBytes = 100;

//         cache.add('/api/1', 'some data', entrysize1, cb);
//         cache.add('/api/2', 'some data', entrysize2, cb);

//         expect(cache.numBytes).to.equal(60);

//         done();
//      });

//     it('should emit an "expired" event when an entry expires', function() {
//         var eventSpy = sinon.spy();
//         setTimeout(function() {
//             sinon.assert.calledOnce(eventSpy);
//             eventSpy.restore();
//         }, 1000);

//         cache.on('expired', eventSpy);
//     });

//     it ('should remove cached entries as they expire', function() {

//         cache.add('/api/1', 'some data', 5, cb, 1000);
    
//         setTimeout(function() {
//             expect(cache.store).to.not.have.property('/api/1');
//         }, 1500);
            
//     });
          
//     it('should free up space and remove oldest entries as max size (in bytes) is reached', function() {

//         var entrysize1 = 60;
//         var entrysize2 = 60;
//         var removeOldest = sinon.spy(cache, 'removeOldest');

//         cache.maxSizeBytes = 100;
//         cache.add('/api/1', 'some data', entrysize1, cb);
//         cache.add('/api/2', 'some data', entrysize2, cb);
        
//         expect(cache.store).to.not.have.property('/api/1');
//         expect(cache.store).to.have.property('/api/2');
//         sinon.assert.calledOnce(removeOldest);
     
//     });

//     it ('should free up space and remove oldest entries as max size (in # of entries) is reached', function() {

//         cache.maxSizeElements = 3;

//         cache.add('/api/1', 'some data', 5);
//         cache.add('/api/2', 'some data', 5);
//         cache.add('/api/3', 'some data', 5);
//         cache.add('/api/4', 'some data', 5);

//         expect(cache.numElements).to.equal(3);
//         expect(cache.store).to.not.have.property('/api/1');
//         expect(cache.store).to.have.property('/api/4');

//     });

//     it ('should refresh timestamp and cache duration of an entry when served from cache', function() {

//         cache.add('/api/1', 'some data', 5, cb, 10000);

//         var entry = cache.store['/api/1'];
//         var originalTime = entry.timestamp;

//         setTimeout(function() {
//             var originalDuration = entry.duration;
//             cache.get('/api/1');
//             console.log("original duration: ", originalDuration, " updated duration: ", entry.duration);
//             expect(entry.timestamp).to.be.above(originalTime);
//             expect(entry.duration).to.be.above(originalDuration);

//         }, 1000);

//     });
// });