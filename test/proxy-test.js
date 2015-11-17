var proxy = require('../proxy'),
    mocha = require('mocha'),
    server = require('../server'),
    cache = require('../proxy/cache'),
	chai = require('chai'),
    sinon = require('sinon'),
    request = require('request'),
    sinonChai = require('sinon-chai'),
    spies = require('chai-spies'),
	expect = chai.expect,
	should = chai.should(),
    supertest = require('supertest-as-promised'),
    // http = require('http'),
    db = require('../server/data'),
    superTestProxy = supertest(proxy);
    

chai.use(sinonChai);
// chai.use(spies);


describe('Transparent Proxy Server', function () {


    describe('GET requests', function() {

        beforeEach(function() {
            console.log("Clearing cache...");
            cache.clearAll();
        });

        // it ('should get 200', function(done) {
        //     superTestProxy.get('/api/').end(function(err, res) {
        //         console.log("err: ", err);
        //         console.log("RES: ", res);
        //         done();
        //     })
        //     ;
        // });

        it ('should get 200', function() {
            console.log("getting in here");
            return superTestProxy.get('/api/').expect(200).then(function(res) {
                console.log("Calling this");
            });
        });

        it ('should cache response after first request', function() {

            return superTestProxy.get('/api/1')
                .expect(200)
                .then(function(res) {
                    console.log("looking at cache store");
                    expect(cache.store).to.have.property('/api/1');
                    // return res;
                });
        });

        // it('should hold max of 5 entries', function(done) {

        //     expect(cache.numElements).to.equal(5);
        //     done();
        //  });
        // it should update cache in bytes

        // it should update num elements in cache;

        it ('should clear oldest cached entries when max number of elements in cache is reached', function() {

            // cache.maxSizeElements = 5;

            return superTestProxy.get('/api/1').expect(200)

            .then(function(res) {
                return superTestProxy.get('/api/2').expect(200);
            })
            .then(function(res) {
                return superTestProxy.get('/api/3').expect(200);
            })
            .then(function(res) {
                return superTestProxy.get('/api/4').expect(200);
            })
            .then(function(res) {
                return superTestProxy.get('/api/5').expect(200);
            })
            .then(function(res) {
                return superTestProxy.get('/api/6').expect(200);
            })
            .then(function(res) {
                console.log("CACHE", cache);
                expect(cache.numElements).to.equal(5);
            });

        });

        xit('should delete oldest entries once max size (in bytes) is reached', function(done) {

            // var spy = chai.spy(cache.removeKey);
            // expect(spy).to.have.been.called();
            // expect(cache).to.not.have.property('/api/1');
            // done();
        });

        it ('should retrieve from cache for 2nd request', function() {
           
           var spy = sinon.spy(cache, 'get');
        // var spy = chai.spy(http.request);
            // var spy = chai.spy(request('http://localhost:4000/api/1'));
            console.log("cache.get is a function: ", cache.get);
            // cache.get = chai.spy(cache.get);
            return superTestProxy.get('/api/').expect(200)

            .then(function(res) {
                return superTestProxy.get('/api/').expect(200);
            })
            .then(function(res) {
                sinon.assert.calledOnce(spy);
                      // return res;

            });
        });

       
    }); // describe GET requests

}); // Transparent Server

describe('Caching Layer', function() {

    it ('should clear cached entries as they expire', function() {

    });

});


        // it ('should improve load/reponse times for cached requests', function() {
            
        //     var startTimeCachedReq = Date.now();
        //     var executionTimeCached;


        //     var startTimeNewReq = Date.now();
        //     var executionTimeNew;

        //     return superTestProxy.get('/api/new-request')
        //         .then(function(res) {
        //             executionTimeNew = Date.now() - startTimeNewReq;
        //             console.info("New execution time: %dms", executionTimeNew);
        //             return superTestProxy.get('/api/1')
        //         })
        //         .then(function(res) {
        //             expect(executionTimeCached).to.be.below(executionTimeNew);
        //         }

                    
        //         .then

        //         .then(function(res) {
        //             executionTimeCached = Date.now() - startTimeCachedReq;
        //             console.info("Cached execution time: %dms", executionTimeCached);

        //         });

        //         })
     
        // });
            


// });

// });
//    