var chai = require('chai');
var spies = require('chai-spies');
var Page = require('../models').Page;
var Promise = require('bluebird');
chai.use(require('chai-things'));
chai.should();
var expect = chai.expect;


describe('Page', function() {
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

  it('exists', function() {
    expect(Page).to.be.ok;
  });

  describe('Virtuals', function() {

    describe('route', function() {
      it('returns the url_name prepended by "/wiki/"', function() {
        expect(page.route).to.equal('/wiki/' + page.urlTitle);
      });
    });

    describe('renderedContent', function() {
      it('converts the markdown-formatted content into HTML', function() {
        expect(page.renderedContent).to.contain('</h1>');
      });
    });
  });

  describe('Class methods', function() {
    describe('findByTag', function() {
      it('gets pages with the search tag', function(done) {
        Page.findByTag('b').then(function(result) {
          expect(result).to.be.ok;
          done();
        })
      });
      it('does not get pages without the search tag', function(done) {
        Page.findByTag().then(function(result) {
          expect(result.length).to.equal(0);
          done();
        })
      });
    });
  });

  describe('Instance methods', function() {
    describe('findSimilar', function() {
      it('never gets itself', function(done) {
        page.findSimilar().then(function(result) {
          result.should.not.include({
            id: page.id
          });
          done();
        })
      });
      it('gets other pages with any common tags', function(done) {
        page.findSimilar().then(function(result) {
          expect(result.length > 0).to.ok;
          done();
        })
      });
      it('does not get other pages without any common tags', function(done) {
        
        done();
      });
    });
  });

  describe('Validations', function() {
    var errPage, statusErrPage;
    beforeEach(function(done) {
      var errPagePromise = Page.build();
      var statusErrPagePromise = Page.build({title: 'title', urlTitle: 'title', content: 'content', status: 'foo'});
      Promise.all([errPagePromise, statusErrPagePromise]).then(function(results){
      	errPage = results[0];
      	statusErrPage = results[1];
      	done();
      })
    })
    it('errors without title', function(done) {
    	errPage.validate()
      .then(function(err) {
        expect(err).to.exist;
        expect(err.errors).to.exist;
        expect(err.errors[0].path).to.equal('title');
        done();
      });
    });
    it('errors without content', function(done) {
  		errPage.validate()
  	  .then(function(err) {
  	    expect(err).to.exist;
  	    expect(err.errors).to.exist;
  	    expect(err.errors[2].path).to.equal('content');
  	    done();
  	  });
    });
    it('errors given an invalid status', function(done) {
  		statusErrPage.save()
  	  .then(null, function(err) {
  	    expect(err).to.exist;
  	    expect(err.parent.routine).to.equal('enum_in');
  	    done();
  	  });
    });
  });

  describe('Hooks', function() {
    it('it sets urlTitle based on title before validating', function(){
    	expect(page.urlTitle).to.be.ok;
    });
  });

});