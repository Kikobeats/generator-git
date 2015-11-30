'use strict'

var lodash = require('lodash')
var str = 'kiko beats huele mal'

var result = str.split(' ').reduce(function (accumulator, str, index) {
  var separator = index === 0 ? '' : ' '
  return accumulator + separator + lodash.capitalize(str)
}, '')

console.log("'" + result + "'")
