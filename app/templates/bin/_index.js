#!/usr/bin/env node
'use strict';

var fs = require('fs');
var meow = require('meow');
var <%= appname %> = require('./');
var updateNotifier = require('update-notifier');

var cli = meow({
  pkg: '../package.json',
  help: fs.readFileSync(__dirname + '/help.txt', 'utf8')
});

updateNotifier({pkg: cli.pkg}).notify();
if (cli.input.length === 0) cli.showHelp();
