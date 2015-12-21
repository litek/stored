'use strict'
const fs = require('fs')
const rimraf = require('rimraf')
const expect = require('chai').expect
const stored = require('..')

describe('stored', function() {
  let tmp = `${__dirname}/tmp`
  let cache = new stored(tmp)

  before(function(done) {
    rimraf(tmp, function() {
      fs.mkdir(tmp, done)
    })
  })

  describe('exists', function() {
    it('returns false when key does not exist', function() {
      return cache.exists('key').then(function(res) {
        expect(res).to.be.false
      })
    })

    it('returns true when key does exist', function() {
      return cache.write('key', 'data').then(function() {
        return cache.exists('key')
      }).then(function(res) {
        expect(res).to.be.true
      })
    })

    it('returns false when key is expired', function() {
      return cache.exists('key', 1).then(function(res) {
        expect(res).to.be.false
      })
    })

    it('returns true when key is not expired', function() {
      return cache.exists('key', 9000).then(function(res) {
        expect(res).to.be.true
      })
    })
  })

  describe('read', function() {
    it('throws when key does not exist', function(done) {
      return cache.read('foo').catch(err => done())
    })

    it('throws when key is expired', function(done) {
      return cache.read('key', 1).catch(err => done())
    })

    it('returns content when key exists and is not expired', function() {
      return cache.read('key').then(function(res) {
        expect(res).to.equal('data')
      })
    })
  })

  describe('ensure', function() {
    it('calls callback to retrieve key data', function() {
      return cache.ensure('newkey', function() {
        return {foo: 'bar'}
      }).then(function(res) {
        expect(res).to.eql({foo: 'bar'})
      })
    })

    it('does not call callback when key exists', function() {
      return cache.ensure('newkey', function() {
        expect(true).to.be.false
      }).then(function(res) {
        expect(res).to.eql({foo: 'bar'})
      })
    })
  })
})
