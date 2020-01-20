#!/usr/bin/env node
'use strict'

const path = require('path')
const pkg = require('../package.json')
const cosmiconfig = require('cosmiconfig').cosmiconfig(pkg.name)
const <%= camelAppName %> = require('<%= appName %>')

require('update-notifier')({pkg}).notify()

const cli = require('meow')({
  pkg,
  help: require('fs').readFileSync(path.join(__dirname, 'help.txt'), 'utf8'),
  flags: {
    cwd: {
      default: process.cwd()
    }
  }
})

;(async () => {
  const { cwd } = cli.flags
  const { config } = await cosmiconfig.search(cwd) || {}
  const input = config.url || cli.input[0]
  const flags = { ...config, ...cli.flags }
  if (!input) cli.showHelp()

  const output = <%= camelAppName %>(flags)
  console.log(output)
})()
