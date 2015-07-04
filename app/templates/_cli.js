#!/usr/bin/env node
'use strict';
var meow = require('meow');
var <%= appname %> = require('./');
var updateNotifier = require('update-notifier');

var cli = meow({
  pkg: '../package.json',
  help: [
    'Usage',
    '  $ <%= appname %> <command> [options]',
    '\n  options:',
    '\t --no-validate disable validate mode.',
    '\t --no-color\t disable colors in the output.',
    '\t --version\t output the current version.',
    '\n  examples:',
    '\t <%= appname %> package.json',
    '\t <%= appname %> bower.json --no-validate'
  ].join('\n')
});

updateNotifier({pkg: cli.pkg}).notify();
if (cli.input.length === 0) cli.showHelp();
