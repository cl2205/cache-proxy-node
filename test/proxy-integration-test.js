var proxy = require('./test-proxy-server'),
    server = require('./test-host-server'),
    cache = require('../proxy/cache'),
    chai = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai'),
    expect = chai.expect,
    should = chai.should(),
    request = require('supertest-as-promised')(proxy),
    http = require('http');
    
chai.use(sinonChai);

describe('Caching Proxy Server - Integration', function () {

    describe('GET requests', function() {

        beforeEach(function() {
            cache.clearAll();
            cache.maxSizeElements = 5;
            cache.maxSizeBytes = 205;
        });

        it ('should send a 200 response', function() {

            return request.get('/assets/1').expect(200);

        });

        it ('should forward initial requests to host server', function() {
        
            var spy = sinon.spy(http, 'request');

            return request.get('/assets/1').then(function(res) {
                http.request.restore();
                expect(res.text).to.equal('Some static content to be cached');
                sinon.assert.calledTwice(spy);
            });

        });

        it ('should cache response after initial request', function() {

            return request.get('/assets/')
                .expect(200)
                .then(function(res) {
                    expect(cache.store).to.have.property('/assets/');
                    return;
                });
        });

        it ('should retrieve from cache for 2nd request', function() {
           
           var cacheSpy = sinon.spy(cache, 'get');
    
            return request.get('/assets/').expect(200)
            .then(function(res) {
                cacheSpy.should.not.have.been.called;
                return request.get('/assets/').expect(200);
            })
            .then(function(res) {
                sinon.assert.calledOnce(cacheSpy);
                cache.get.restore();
                return;
            });

        });

    }); // describe GET requests

    describe('POST requests', function() {

        it ('should NOT be forwarded', function() {

            return request.post('/assets/', {}).expect(200).then(function(res) {
                 expect(res.text).to.equal('Some uncacheable resource');
                 return;
            });
        });

    }); // describe POST request 

}); // Transparent Proxy server
