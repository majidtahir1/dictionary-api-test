var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();

chai.use(chaiHttp);
const config = require('./config.json');
const test = config.test

describe('Delete pair API Test', function(done) {

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
        done();  
      });  
    });
  });

  afterEach("remove dictionaries for cleanup", function(done){
    chai.request(test.server)
    .delete('/dictionary/'+dictionaryIdWithKeys)
    .set({'Authorization':test.authorization})
    .set('content-type', test.contentType)
    .end(function(err, res){});
    

    chai.request(test.server)
    .delete('/dictionary/'+emptyDictionaryId)
    .set({'Authorization' : test.authorization})
    .set('content-type', test.contentType)
    .end(function(err, res){});
    done();
  });
  
  describe('Delete key/value pair => /dictionary/:id/keys/:key => DELETE', function(){

    it('should return 200 given a valid id and key', function(done){
      chai.request(test.server)
      .delete('/dictionary/'+dictionaryIdWithKeys + '/keys/'+key1)
      .set({'Authorization': test.authorization})
      .set('content-type', test.contentType) 
      .end((err, res) =>{
        res.should.have.status(200);
        done();
      });
    });

    it('should delete a valid key/value pair and return 404 when checking if that key/value pair exists', function(done){
      chai.request(test.server)
      .delete('/dictionary/'+dictionaryIdWithKeys + '/keys/'+key1)
      .set({'Authorization':test.authorization})
      .set('content-type', test.contentType) 
      .end((err, res) =>{               
        chai.request(test.server)        
        .get('/dictionary/'+dictionaryIdWithKeys + '/keys/' + key1)
        .set({'Authorization':test.authorization})
        .set('content-type', test.contentType) 
        .end((err2,res3) => {          
          res3.should.have.status(404);
          done();
        });      
      });
    });

    it('should return 404 on deleting a non-existent key/value pair', function(done){

      chai.request(test.server)      
      .delete('/dictionary/'+dictionaryIdWithKeys + '/keys/unknownKey')
      .set({'Authorization': test.authorization})
      .set('content-type', test.contentType) 
      .end((err, res) =>{
        res.should.have.status(404);
        done();
      });
    });

    it('Unauthorized request should return 401 error', function(done){
      chai.request(test.server)
      .delete('/dictionary/'+dictionaryIdWithKeys + '/keys/unknownKey')      
      .set('content-type', test.contentType) 
      .end((err, res) =>{
        res.should.have.status(401);
        done();
      });
    });
  });

});