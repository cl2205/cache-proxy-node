// var proxy = require('../proxy'),
//     server = require('../server'),
//     cache = require('../proxy/cache'),
// 	chai = require('chai'),
// 	expect = chai.expect,
// 	should = chai.should(),
//     supertest = require('supertest'),
//     http = require('http'),
//     db = require('../server/data'),
//     app = supertest(proxy);


// describe('caching layer', function() {

//     describe('GET request', function() {
//         it ('should call host server on initial request', function(done) {
//             app.get('localhost:3000').expect(200, done);
//             // done();
//         });

//         it ('should only call host server once for the same GET request', function(done) {
//             app.get('localhost:3000').expect(200, done);
//             // done();
//         });

//         it ('should be cached on initial cache', function(done) {
//             app.get('localhost:3000').expect(200, done);
//             // done();
//         });


//     });

// });