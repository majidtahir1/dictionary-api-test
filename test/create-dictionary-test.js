var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();

chai.use(chaiHttp);

const config = require('./config.json');
const test = config.test

describe('Create dictionary API Test', function(done) {
  /* Our tests begin */
  describe("Create new dictionary => /dictionary POST =>", function(){
    it('should successfuly create a new dictionary and return a 201', function(done) {
      /*
      SPEC:
      {
         "id": "dictionary-id"
      }
      */
      chai.request(test.server)
      .post('/dictionary')
      .set({'Authorization': test.authorization})
      .set('content-type', test.contentType)
      .end(function(err, res){
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.have.property('id');
        done();
      });
    });

    it('Unauthorized request should return 401', function(done) {
      chai.request(test.server)
      .post('/dictionary')
      .set('content-type', test.contentType)
      .end(function(err, res){
        res.should.have.status(401);        
        done();
      });
    });
  });
});