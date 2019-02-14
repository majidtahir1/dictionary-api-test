var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();

chai.use(chaiHttp);
const config = require('./config.json');
const test = config.test


describe('Create pair API Test', function(done) {

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
    .set({'Authorization':test.authorization})
    .set('content-type', test.contentType)
    .end(function(err, res){});
    done();
  });
  
  describe('Create key/value pair => /dictionary/:id/keys/:key => POST', function(){
    /*specification:
    {value:'VALUE'}
    */
    it('should create a new key/value pair and return 200', function(done){
      var newKey='brandNewKey';
      chai.request(test.server)
      .post('/dictionary/'+dictionaryIdWithKeys+'/keys/'+newKey)
      .set({'Authorization': test.authorization})
      .set('content-type', test.contentType) 
      .send({'value': "newkeyvaluepair"})
      .end((err, res) =>{
        res.should.have.status(200);
        done();
      })
    });

    it('should modify an existing key/value pair and return 200', function(done){
      /* specification:
        {value:'VALUE'}
        */
        chai.request(test.server)
        .post('/dictionary/'+dictionaryIdWithKeys+'/keys/'+key1)
        .set({'Authorization': test.authorization})
        .set('content-type', test.contentType) 
        .send({'value': "changedValue"})
        .end((err, res) =>{
          res.should.have.status(200);
          done();
        })
      });

    it('should modify an existing key/value pair and return 200 and verify if value was actually changed', function(done){
      /* specification:
        {value:'VALUE'}
        */
        chai.request(test.server)
        .post('/dictionary/'+dictionaryIdWithKeys+'/keys/'+key1)
        .set({'Authorization': test.authorization})
        .set('content-type', test.contentType) 
        .send({'value': "changedValue"})
        .end((err, res) =>{
          chai.request(test.server)
          .get('/dictionary/'+ dictionaryIdWithKeys+ '/keys/' + key1)
          .set({'Authorization':test.authorization})
          .set('content-type', test.contentType) 
          .end((err, res) =>{
            res.should.have.status(200);
            res.body.should.have.property('value').equal("changedValue");
            done();
          });        
        });
      });

    it('Unauthorized request should return a 401', function(done){
      var newKey='brandNewKey';
      chai.request(test.server)
      .post('/dictionary/'+dictionaryIdWithKeys+'/keys/'+newKey)
      .set('content-type', test.contentType) 
      .send({'value': "newkeyvaluepair"})
      .end((err, res) =>{
        res.should.have.status(401);
        done();
      })
    });
  });
});