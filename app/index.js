'use strict'

var _ = require('lodash')
var path = require('path')
var yosay = require('yosay')
var superb = require('superb')
var mkdirp = require('mkdirp')
var finepack = require('finepack')
var askName = require('inquirer-npm-name')
var generators = require('yeoman-generator')

var proxy = process.env.http_proxy || process.env.HTTP_PROXY ||
  process.env.https_proxy || process.env.HTTPS_PROXY || null

var githubOptions = {
  version: '3.0.0'
}

if (proxy) {
  var proxyUrl = url.parse(proxy)
  githubOptions.proxy = {
    host: proxyUrl.hostname,
    port: proxyUrl.port
  }
}

var GitHubApi = require('github')
var github = new GitHubApi(githubOptions)

if (process.env.GITHUB_TOKEN) {
  github.authenticate({
    type: 'oauth',
    token: process.env.GITHUB_TOKEN
  })
}

function githubUserInfo (name, cb, log) {
  var emptyGithubRes = {
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

function makeGeneratorName (name) {
  name = _.kebabCase(name)
  name = name.indexOf('generator-') === 0 ? name : 'generator-' + name
  return name
}

function capitalizeName (name) {
  return _.reduce(name.split('-'), function (acc, str, index) {
    var separator = index === 0 ? '' : ' '
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
 * - kebabAppName
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
    var cb = this.async()
    askName({
      name: 'name',
      message: 'Your project name',
      default: makeGeneratorName(path.basename(process.cwd())),
      filter: makeGeneratorName,
      validate: function (str) {
        return str.length > 0
      }
    }, this, function (name) {
      this.appName = name
      this.kebabAppName = _.kebabCase(name)
      this.camelAppName = _.camelCase(name)
      this.capitalizeName = capitalizeName(this.kebabAppName)
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
    var cb = this.async()

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
    var done = this.async()

    githubUserInfo(this.userLogin, function (res) {
      this.userName = res.name
      this.userEmail = res.email
      this.userBlog = res.blog
      this.userUrl = res.html_url
      done()
    }.bind(this), this.log)
  },

  transpilers: function () {
    var cb = this.async()

    this.prompt([{
      name: 'transpiler',
      message: 'Transpiler',
      choices: ['none', 'coffee-script'],
      default: 'none',
      type: 'list'
    }], function (props) {
      this.transpiler = props.transpiler === 'none' ? null : props.transpiler
      cb()
    }.bind(this))
  },

  style: function () {
    var cb = this.async()

    this.prompt([{
      type: 'checkbox',
      name: 'modules',
      message: 'Select the style:',
      choices: [ 'JSHint', 'JSCS' ],
      default: [ 'JSHint', 'JSCS' ]
    }], function (styles) {
      this.jshint = _.includes(styles, 'JSHint')
      this.jscs = _.includes(styles, 'JSCS')
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

    this.copy('test/_test.sh', 'test/test.sh')
    this.copy('test/_test.coffee', 'test/test.coffee')

    this.package = _.template(this.package)(this)
    this.package = JSON.parse(this.package)

    if (this.cli) {
      _.assign(this.package, this.fs.readJSON(this.destinationPath('package/cli.json'), {}))
      this.readme += this.fs.read(this.templatePath('README/install/cli.md'))

      this.template('bin/help.txt', 'bin/_help.txt')
      this.copy('bin/index.js', 'bin/_index.js')
    } else {
      this.readme += this.fs.read(this.templatePath('README/install/normal.md'))
    }

    if (this.browser) {
      _.assign(this.package, this.fs.readJSON(this.destinationPath('package/browser.json'), {}))
      this.readme += this.fs.read(this.templatePath('README/install/browser.md'))
      this.template('_bower.json', 'bower.json')
      this.copy('_gulpfile.coffee', 'gulpfile.coffee')
      this.mkdir('dist')
      this.template('dist/_index.html', 'dist/index.html')
      this.copy('bumped/browser', '.bumpedrc')
    } else {
      this.copy('bumped/base', '.bumpedrc')
    }

    if (this.jshint) this.copy('_jshintrc', '.jshintrc')
    if (this.jscs) this.copy('_jscsrc', '.jscsrc')

    if (!this.transpiler || this.transpiler !== 'coffee-script')
      this.package.devDependencies['coffee-script'] = 'latest'
    else
      this.package.dependencies[this.transpiler] = 'latest'

    var indexExt = this.transpiler === 'coffee-script' ? 'coffee' : 'js'

    this.copy('_index.' + indexExt, 'index.js')

    this.readme += this.fs.read(this.templatePath('README/body.md'))
    this.readme = _.template(this.readme)(this)
    this.fs.write(this.destinationPath('README.md'), this.readme)

    finepack(this.package, {
      validate: false,
      color: false
    }, function (err, packageFormated) {
      this.fs.writeJSON(this.destinationPath('package.json'), packageFormated)
    }.bind(this))
  },

  install: function () {
    this.installDependencies({bower: false})
  }
})
