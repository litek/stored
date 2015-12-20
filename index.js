'use strict'
const fs = require('fs')
const path = require('path')

const promisify = function(obj, method) {
  return function() {
    let args = [].slice.call(arguments)

    return new Promise(function(resolve, reject) {
      args.push((err, res) => err ? reject(err) : resolve(res))
      obj[method].apply(obj, args)
    })
  }
}

/**
 * Simple disk cache
 */
class Stored {
  constructor(dir, ext) {
    if (!dir) throw new Error('Expected a cache directory')

    this.dir = dir
    this.ext = '.json'
  }

  name(key) {
    return path.join(this.dir, key) + this.ext
  }

  exists(key, ttl) {
    let file = this.name(key)

    return new Promise(function(resolve, reject) {
      fs.stat(file, (err, res) => resolve(!err))
    })
  }

  write(key, body) {
    let file = this.name(key)
    let json = JSON.stringify(body)

    return new Promise(function(resolve, reject) {
      fs.writeFile(file, json, (err, res) => (err ? reject : resolve)(err || body))
    })
  }

  read(key, ttl) {
    let file = this.name(key)

    return this.exists(key, ttl).then(function(exists) {
      if (!exists) throw new Error('Cache key does not exist or is expired')

      return new Promise(function(resolve, reject) {
        fs.readFile(file, 'utf8', (err, res) => (err ? reject : resolve)(err || res))
      })
    }).then(function(json) {
      return JSON.parse(json)
    })
  }

  ensure(key, fn) {
    return this.read(key).catch(function() {
      return fn()
    }).then((body) => this.write(key, body))
  }
}

module.exports = Stored
