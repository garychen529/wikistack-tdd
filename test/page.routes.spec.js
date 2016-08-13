
var supertest = require('supertest');
var expect = require('chai').expect;
var app = require('../index');
var Page = require('../models').Page;
var agent = supertest.agent(app);



describe('http requests', function () {
	var page;
	  before(function(done) {
	    Page.sync({
	      force: true
	    })
	      .then(function() {
	        return Page.create({
	          title: 'Next',
	          content: '# Awesome Title',
	          tags: ['x']
	        })
	      }).then(function() {
	        return Page.create({
	          title: 'World',
	          content: '# New Title',
	          tags: ['c', 'b']
	        })
	      }).then(function() {
	        return Page.create({
	          title: 'Hello',
	          content: '# Title',
	          tags: ['a', 'b']
	        })
	      }).then(function(result) {
	        page = result;
	        done();
	      })
	      .catch(function(err) {
	        done(err);
	      });
	  });
  describe('GET /wiki', function () {
    it('responds with 200', function(done) {
    	agent
    	.get('/wiki')
    	.expect(200, done);
    });
  });

  describe('GET /wiki/add', function () {
    it('responds with 200', function(done) {
    	agent
    	.get('/wiki/add')
    	.expect(200, done);
    });
  });

  describe('GET /wiki/:urlTitle', function () {
    it('responds with 404 on page that does not exist', function(done) {
    	agent
    	.get('/wiki/fooFires')
    	// .on('error', function(err){
    		// console.log("hahahahaha" + err);
    	.expect(404)
    	.end(function(err, res) {
    		if (err) return done(err);
    		done();
    	});
    });
    it('responds with 200 on page that does exist', function(done) {
    	agent
    	.get('/wiki/Hello')
    	.expect(200, done);
    });
  });

  describe('GET /wiki/search', function () {
    it('responds with 200', function(done) {
    	agent
    	.get('/wiki/search')
    	.expect(200, done);
    });
  });

  describe('GET /wiki/:urlTitle/similar', function () {
    it('responds with 404 for page that does not exist', function(done) {
    	agent
    	.get('/wiki/fooFires/similar')
    	.expect(404, done);
    });
    it('responds with 200 for similar page', function(done) {
    	agent
    	.get('/wiki/Hello/similar')
    	.expect(200, done);
    });
  });

  describe('POST /wiki', function () {
    it('responds with 302', function() {
    	agent
    	.post('/wiki')
    	.send({title: 'supertest',
	          content: '# Awesom Title',
	          tags: ['x']});
    });
    it('creates a page in the database', function(done) {
    	Page.findAll({
    		where: {
    			title: 'supertest'
    		}
    	})
    	.then(function(result) {
    		expect(result).to.be.ok;
    		done();
    	});
    });
  });

});