#!/usr/bin/env node
'use strict'

const path = require('path')
const pkg = require('../package.json')

require('update-notifier')({pkg}).notify()

const cli = require('meow')({
  pkg,
  help: require('fs').readFileSync(path.join(__dirname, 'help.txt'), 'utf8')
})

if (cli.input.length === 0) cli.showHelp()
