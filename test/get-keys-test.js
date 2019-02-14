var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();

chai.use(chaiHttp);

const config = require('./config.json');
const test = config.test

describe('Get Keys API Test', function(done) {

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

  /* Our tests begin */
  describe("Get keys => /dictionary/:id/keys GET =>", function(){
    it('should return 404 using an invalid dictionary id', function(done) {
    /*
    SPEC:
    {
       "id": "dictionary-id"
    }
    */
    var invalidDictionaryId='111111111111';
    chai.request(test.server)
    .get('/dictionary/'+invalidDictionaryId+'/keys')  
    .set({'Authorization': test.authorization})
    .set('content-type', test.contentType)          
    .end((err, res) => {              
      res.should.have.status(404);                                                           
      done();
    })
  });

    it('should return a 200 and have key count using a valid dictionary id with no keys GET', function(done) {    
    /*
    Specification of response 200:
    {
    "count": n,
    "keys": [
        "key1",
        "key2",
        ...,
        "keyn"
    ]
    */
      //GET call to retrieve keys based on dictionaryId from test setup function
      chai.request(test.server)      
      .get('/dictionary/'+emptyDictionaryId+'/keys')  
      .set({'Authorization': test.authorization})
      .set('content-type', test.contentType)          
      .end((err, res) => {              
        res.should.have.status(200);                                      
        res.should.be.json
        res.body.should.have.property('count');
        done();
      })    
    });

    it('should return a 200 and a count of keys and an array of keys using an valid dictionary id with keys', function(done) {
    /*
    SPEC:
    {
    "count": n,
    "keys": [
        "key1",
        "key2",
        ...,
        "keyn"
    ]
    */
      //GET call to retrieve keys based on dictionaryId from test setup function
      chai.request(test.server)      
      .get('/dictionary/'+dictionaryIdWithKeys+'/keys')  
      .set({'Authorization': test.authorization})
      .set('content-type', test.contentType)          
      .end((err, res) => {              
        res.should.have.status(200);                                      
        res.should.be.json        
        res.body.should.have.property('count')
        res.body.should.have.property('keys'); 
        res.body.keys[0].is(key1value);

        done();
      })    
    });
    it('Unauthorized request should return 401 error', function(done){
      chai.request(test.server)      
      .get('/dictionary/'+dictionaryIdWithKeys+'/keys')  
      .set('content-type', test.contentType)          
      .end((err, res) => {              
        res.should.have.status(401);                                      
        done();
      })    
    });
  });
});