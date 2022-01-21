#!/usr/bin/env node
'use strict'

const path = require('path')
const pkg = require('../package.json')
const <%= camelAppName %> = require('<%= appName %>')
const JoyCon = require('joycon')

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

  const joycon = new JoyCon({
    cwd,
    packageKey: pkg.name,
    files: [
      'package.json',
      `.${pkg.name}rc`,
      `.${pkg.name}rc.json`,
      `.${pkg.name}rc.js`,
      `${pkg.name}.config.js`
    ]
  })

  const { data: config = {} } = (await joycon.load()) || {}
  const input = config.url || cli.input[0]
  const flags = { ...config, ...cli.flags }
  if (!input) cli.showHelp()

  const output = <%= camelAppName %>(flags)
  console.log(output)
})()
