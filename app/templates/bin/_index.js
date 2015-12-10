#!/usr/bin/env node
'use strict';

var pkg = require('../package.json')
require('update-notifier')({pkg: pkg}).notify()

var <%= appname %> = require('./')
var cli = require('meow')({
  pkg: pkg
  help: require('fs').readFileSync(__dirname + '/help.txt', 'utf8')
})

if (cli.input.length === 0) cli.showHelp()
