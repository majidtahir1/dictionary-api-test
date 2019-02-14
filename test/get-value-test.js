var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();

const config = require('./config.json');
const test = config.test

chai.use(chaiHttp);


describe('Get Value Dictionary API Test', function(done) {

  var emptyDictionaryId;
  var dictionaryIdWithKeys;
  var key1='key1';
  var key1value='key1value';

  /* before each test we create some mock data so that we can test retrieval and deletions */

  beforeEach("add an empty dictionary to set up some of our tests", function(done){    
    chai.request(test.server)
    .post('/dictionary')
    .set({'authorization':test.authorization})
    .set('content-type', test.contentType)
    .end(function(err, res){
      emptyDictionaryId = (res.body.id);
      done();      
    });
  });

  beforeEach("add a dictionary with keys to set up some of our tests", function(done){
    chai.request(test.server)
    .post('/dictionary')
    .set({'authorization':test.authorization})
    .set('content-type', test.contentType)
    .end(function(err, res){
      dictionaryIdWithKeys = (res.body.id);      
      chai.request(test.server)
      .post('/dictionary/'+dictionaryIdWithKeys+'/keys/'+key1)
      .set({'authorization':test.authorization})
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
    .set({'authorization':test.authorization})
    .set('content-type', test.contentType)
    .end(function(err, res){});
    

    chai.request(test.server)
    .delete('/dictionary/'+emptyDictionaryId)
    .set({'authorization':test.authorization})
    .set('content-type', test.contentType)
    .end(function(err, res){});
    done();
  });
  
  
  describe('Get Value => /dictionary/:id/keys/:key => GET', function(){
    it('should get a single value with a valid key and return 200', function(done){
      chai.request(test.server)
      .get('/dictionary/'+ dictionaryIdWithKeys+ '/keys/' + key1)
      .set({'authorization': test.authorization})
      .set('content-type', test.contentType) 
      .end((err, res) =>{

        res.should.have.status(200);
        res.body.should.have.property('value').equal(key1value);
        done();
      })
    });

    it('should return 404 if using an invalid key', function(done){
      chai.request(test.server)
      .get('/dictionary/'+ dictionaryIdWithKeys+ '/keys/invalidkey' )
      .set({'authorization': test.authorization})
      .set('content-type', test.contentType) 
      .end((err, res) =>{
        res.should.have.status(404);  
        done();    
      });
    });

    it('Unauthorized request should return 401', function(done){
      chai.request(test.server)
      .get('/dictionary/'+ dictionaryIdWithKeys+ '/keys/invalidkey' )      
      .set('content-type', test.contentType) 
      .end((err, res) =>{
        res.should.have.status(401);  
        done();    
      });
    })
  });
});