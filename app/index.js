'use strict'

const _ = require('lodash')
const path = require('path')
const yosay = require('yosay')
const superb = require('superb')
const mkdirp = require('mkdirp')
const finepack = require('finepack')
const askName = require('inquirer-npm-name')
const generators = require('yeoman-generator')
const latestVersion = require('latest-version')

function setupDependenciesVersions (pkg) {
  function fetchVersions (dependencies) {
    return Promise.all(dependencies.map(function (dependency) {
      return latestVersion(dependency)
    }, []))
  }

  function updatePkg (namespace, versions) {
    Object.keys(pkg[namespace]).forEach(function (dep, index) {
      pkg[namespace][dep] = '~' + versions[index]
    })
  }

  let promise = Promise.all(['dependencies'].map(function (dep) {
    let pkgs = Object.keys(pkg[dep])
    return fetchVersions(pkgs).then(function (versions) {
      updatePkg(dep, versions)
    })
  }))

  return promise.then(function () {
    return Promise.resolve(pkg)
  })
}

let CONST = {
  TRANSPILERS: ['coffee-script'],
  STYLES: ['standard', 'jshint', 'jscs'],
  TESTING: ['mocha', 'should', 'tap', 'tape']
}

let proxy = process.env.http_proxy || process.env.HTTP_PROXY ||
  process.env.https_proxy || process.env.HTTPS_PROXY || null

let githubOptions = {
  version: '3.0.0'
}

if (proxy) {
  let proxyUrl = url.parse(proxy)
  githubOptions.proxy = {
    host: proxyUrl.hostname,
    port: proxyUrl.port
  }
}

let GitHubApi = require('github')
let github = new GitHubApi(githubOptions)

if (process.env.GITHUB_TOKEN) {
  github.authenticate({
    type: 'oauth',
    token: process.env.GITHUB_TOKEN
  })
}

function githubUserInfo (name, cb, log) {
  let emptyGithubRes = {
    name: '',
    email: '',
    html_url: ''
  }

  github.user.getFrom({
    user: name
  }, function (err, res) {
    if (err) {
      log.error("Cannot fetch your github profile. Make sure you've typed it correctly.")
      res = emptyGithubRes
    }

    return cb(JSON.parse(JSON.stringify(res)))
  })
}

function capitalizeName (name) {
  return _.reduce(name.split('-'), function (acc, str, index) {
    let separator = index === 0 ? '' : ' '
    return acc + separator + _.capitalize(str)
  }, '')
}

/**
 * Generate a new Project.
 * Currently settings that will be configured are:
 *
 * about project name
 *
 * - appName
 * - camelAppName
 * - appDescription
 *
 * about user info (Github)
 *
 * - userLogin
 * - userUrl
 * - userEmail
 * - userBlog
 * - userName
 *
 *  about style
 *
 * - coffee
 * - cli
 * - browser
 * - jshint
 * - jscs
 */
module.exports = generators.Base.extend({
  initializing: function () {
    this.licenseYear = new Date().getFullYear()
  },

  projectName: function () {
    this.log(yosay('Initializing ' + superb() + ' Project'))
    let cb = this.async()
    askName({
      name: 'name',
      message: 'Your project name',
      default: _.kebabCase(path.basename(process.cwd())),
      filter: _.kebabCase,
      validate: function (str) {
        return str.length > 0
      }
    }, this, function (name) {
      this.appName = name
      this.camelAppName = _.camelCase(name)
      this.capitalizeName = capitalizeName(this.appName)
      cb()
    }.bind(this))
  },

  setupPath: function () {
    if (path.basename(this.destinationPath()) !== this.appName) {
      this.log(
        'Your generator must be inside a folder named ' + this.appName + '\n' +
        "I'll automatically create this folder."
      )
      mkdirp(this.appName)
      this.destinationRoot(this.destinationPath(this.appName))
    }

    this.readme = this.fs.read(this.templatePath('README/header.md'))
    this.package = this.fs.read(this.templatePath('package/base.json'))
  },

  questions: function () {
    let cb = this.async()

    this.prompt([{
      name: 'appDescription',
      message: 'A short description of your project',
      default: "I'm a lazy"
    }, {
      name: 'userLogin',
      message: 'Would you mind telling me your username on GitHub?',
      default: 'someone'
    }, {
      name: 'cli',
      message: 'Do you need a CLI ?',
      type: 'confirm',
      default: false
    }, {
      name: 'browser',
      message: 'Do you need a Browser Support (powered by Browserify) ?',
      type: 'confirm',
      default: false
    }], function (props) {
      this.appDescription = props.appDescription
      this.userLogin = props.userLogin
      this.cli = props.cli
      this.browser = props.browser
      cb()
    }.bind(this))
  },

  userInfo: function () {
    let done = this.async()

    githubUserInfo(this.userLogin, function (res) {
      this.userName = res.name
      this.userEmail = res.email
      this.userBlog = res.blog
      this.userUrl = res.html_url
      done()
    }.bind(this), this.log)
  },

  transpilers: function () {
    let cb = this.async()

    this.prompt([{
      type: 'checkbox',
      name: 'transpilers',
      message: 'Select transpilers:',
      choices: CONST.TRANSPILERS
    }], function (props) {
      _.forEach(CONST.TRANSPILERS, function (choice) {
        this[choice] = _.includes(props.transpilers, choice)
      }.bind(this))
      cb()
    }.bind(this))
  },

  style: function () {
    let cb = this.async()

    this.prompt([{
      type: 'checkbox',
      name: 'styles',
      message: 'Select the style:',
      choices: CONST.STYLES
    }], function (props) {
      _.forEach(CONST.STYLES, function (choice) {
        this[choice] = _.includes(props.styles, choice)
      }.bind(this))
      cb()
    }.bind(this))
  },

  testing: function () {
    let cb = this.async()

    this.prompt([{
      type: 'checkbox',
      name: 'testing',
      message: 'Select testing tools:',
      choices: CONST.TESTING
    }], function (props) {
      _.forEach(CONST.TESTING, function (choice) {
        this[choice] = _.includes(props.testing, choice)
      }.bind(this))
      cb()
    }.bind(this))
  },

  setup: function () {
    this.copy('_editorconfig', '.editorconfig')
    this.copy('_gitignore', '.gitignore')
    this.copy('_gitattributes', '.gitattributes')
    this.copy('_npmignore', '.npmignore')
    this.copy('_npmrc', '.npmrc')
    this.copy('_travis.yml', '.travis.yml')
    this.template('_LICENSE.md', 'LICENSE.md')

    this.package = _.template(this.package)(this)
    this.package = JSON.parse(this.package)

    if (this.cli) {
      let cliPackage = this.fs.read(this.templatePath('package/cli.json'))
      cliPackage = _.template(cliPackage)(this)
      cliPackage = JSON.parse(cliPackage)

      _.merge(this.package, cliPackage, {})
      this.readme += this.fs.read(this.templatePath('README/install/cli.md'))

      this.template('bin/_help.txt', 'bin/help.txt')
      this.copy('bin/_index.js', 'bin/index.js')
    } else {
      this.readme += this.fs.read(this.templatePath('README/install/normal.md'))
    }

    if (this.browser) {
      _.merge(this.package, this.fs.readJSON(this.templatePath('package/browser.json'), {}))

      this.readme += this.fs.read(this.templatePath('README/install/browser.md'))
      this.template('_bower.json', 'bower.json')
      this.bulkCopy('_gulpfile.coffee', 'gulpfile.coffee')
      this.mkdir('dist')
      this.template('dist/_index.html', 'dist/index.html')
      this.copy('bumped/browser', '.bumpedrc')
    } else {
      this.copy('bumped/base', '.bumpedrc')
    }

    /* STYLES */

    let lintScript = ''

    _.forEach(CONST.STYLES, function (style) {
      if (this[style]) {
        let script = style + ' lib'
        this.package.devDependencies[style] = 'latest'
        lintScript += lintScript === '' ? script : ' && ' + script
      }
    }.bind(this))

    if (this.jshint) this.copy('_jshintrc', '.jshintrc')
    if (this.jscs) this.copy('_jscsrc', '.jscsrc')

    /* SCRIPTS */

    this.package.scripts.lint = lintScript

    /* TRANSPILERS */

    _.forEach(CONST.TRANSPILERS, function (transpiler) {
      if (this[transpiler]) this.package.dependencies[transpiler] = 'latest'
    }.bind(this))

    /* TESTING */

    _.forEach(CONST.TESTING, function (testing) {
      if (this[testing]) this.package.devDependencies[testing] = 'latest'
    }.bind(this))

    let testScript = 'mocha'
    if (this.mocha) this.copy('test/_mocha.opts', 'test/mocha.opts')
    if (this.tape && !this.mocha) testScript = 'tape'
    this.package.scripts.test = testScript

    /* INDEX.JS */

    let indexExtension = 'js'

    if (!this['coffee-script'])
      this.package.devDependencies['coffee-script'] = 'latest'
    else
      indexExtension = 'coffee'

    this.copy('_index.' + indexExtension, 'index.js')

    /* README */

    this.readme += this.fs.read(this.templatePath('README/body.md'))
    this.readme = _.template(this.readme)(this)
    this.fs.write(this.destinationPath('README.md'), this.readme)
  },

  dependenciesVersion: function () {
    let cb = this.async()
    let _this = this

    setupDependenciesVersions(this.package).then(function (newPkg) {
      _this.package = newPkg
      cb()
    })
  },

  write: function () {
    let cb = this.async()

    finepack(this.package, {
      validate: false,
      color: false
    }, function (err, packageFormated) {
      this.fs.writeJSON(this.destinationPath('package.json'), packageFormated)
      cb()
    }.bind(this))
  },

  install: function () {
    this.installDependencies({bower: false})
  }
})
