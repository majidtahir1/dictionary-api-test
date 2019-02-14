var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();

chai.use(chaiHttp);
const config = require('./config.json');
const test = config.test

describe('Delete Dictionary API Test', function(done) {

  var emptyDictionaryId;
  var dictionaryIdWithKeys;
  var key1='key1';
  var key1value='key1value';

  /* before each test we create some mock data so that we can test retrieval and deletions */

  beforeEach("add an empty dictionary to set up some of our tests", function(done){
    chai.request(test.server)
    .post('/dictionary')
    .set({'Authorization':test.authorization})
    .set('content-type', test.contentType)
    .end(function(err, res){
      emptyDictionaryId = (res.body.id);
      done();      
    });
  });

  beforeEach("add a dictionary with keys to set up some of our tests", function(done){
    chai.request(test.server)
    .post('/dictionary')
    .set({'Authorization':test.authorization})
    .set('content-type', test.contentType)
    .end(function(err, res){
      dictionaryIdWithKeys = (res.body.id);            
      chai.request(test.server)
      .post('/dictionary/'+dictionaryIdWithKeys+'/keys/'+key1)
      .set({'Authorization':test.authorization})
      .set('content-type', test.contentType)
      .send({'value': key1value})
      .end(function(err, res){        
      //  done();  
      });
      done();  
    });
  });

  afterEach("remove dictionaries for cleanup", function(done){
    chai.request(test.server)
    .delete('/dictionary/'+test.dictionaryIdWithKeys)
    .set({'Authorization':test.authorization})
    .set('content-type', test.contentType)
    .end(function(err, res){});
    

    chai.request(test.server)
    .delete('/dictionary/'+emptyDictionaryId)
    .set({'Authorization':test.authorization})
    .set('content-type', test.contentType)
    .end(function(err, res){});
    done();
  });

  describe("Delete dictionary => /dictionary/:id => DELETE", function(){
    it('should return 204 deleting dictionary with valid id', function(done){
      chai.request(test.server)
      .delete('/dictionary/'+emptyDictionaryId)
      .set({'Authorization': test.authorization})
      .set('content-type', test.contentType)  
      .end((err, res) =>{
        //spec says DELETE /dictionary should return 200 but I will consider a 204 as a valid result
        res.should.have.status(204);
        done();      
      })
    });


    it('should return a 404 for attempting to delete a dictionary with invalid id', function(done){
      var invalidDictionaryId='00000000';

      chai.request(test.server)
      .delete('/dictionary/'+invalidDictionaryId)
      .set({'Authorization': test.authorization})
      .set('content-type', test.contentType)  
      .end((err, res) =>{
        res.should.have.status(404);
        done();      
      });
    });

    it('Unauthorized request should return a 401 error', function(done){
      chai.request(test.server)
      .delete('/dictionary/'+emptyDictionaryId)      
      .set('content-type', test.contentType)  
      .end((err, res) =>{
        res.should.have.status(401);
        done();      
      });
    });
  });
});