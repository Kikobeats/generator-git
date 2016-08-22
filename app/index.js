'use strict'

const _ = require('lodash')
const path = require('path')
const yosay = require('yosay')
const superb = require('superb')
const mkdirp = require('mkdirp')
const ghUser = require('gh-user')
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

  const promise = Promise.all(['dependencies'].map(function (dep) {
    const pkgs = Object.keys(pkg[dep])
    return fetchVersions(pkgs).then(function (versions) {
      updatePkg(dep, versions)
    })
  }))

  return promise.then(function () {
    return Promise.resolve(pkg)
  })
}

const CONST = {
  LINTERS: {
    choose: ['standard', 'jshint', 'jscs']
  },

  TESTING: {
    choose: ['mocha', 'should', 'tap', 'tape']
  },

  TRANSPILERS: {
    choose: ['coffee-script']
  }
}

function capitalizeName (name) {
  return _.reduce(name.split('-'), function (acc, str, index) {
    const separator = index === 0 ? '' : ' '
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
    const cb = this.async()

    const promise = askName({
      name: 'name',
      message: 'Your project name',
      default: _.kebabCase(path.basename(process.cwd())),
      filter: _.kebabCase,
      validate: function (str) {
        return str.length > 0
      }
    }, this)

    promise
      .then(function (answer) {
        const name = answer.name
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
    const cb = this.async()

    const promise = this.prompt([{
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
    }])

    promise.then(function (props) {
      this.appDescription = props.appDescription
      this.userLogin = props.userLogin
      this.cli = props.cli
      this.browser = props.browser
      cb()
    }.bind(this))
  },

  userInfo: function () {
    const cb = this.async()
    const promise = ghUser(this.userLogin)

    promise.then(function (user) {
      this.userName = user.name
      this.userEmail = user.email
      this.userBlog = user.blog
      this.userUrl = user.html_url
      cb()
    }.bind(this))
  },

  transpilers: function () {
    const cb = this.async()

    const promise = this.prompt([{
      type: 'checkbox',
      name: 'transpilers',
      message: 'Select transpilers:',
      choices: CONST.TRANSPILERS.choose
    }])

    promise.then(function (props) {
      _.forEach(CONST.TRANSPILERS.choose, function (choice) {
        this[choice] = _.includes(props.transpilers, choice)
      }.bind(this))
      cb()
    }.bind(this))
  },

  linters: function () {
    const cb = this.async()

    const promise = this.prompt([{
      type: 'checkbox',
      name: 'linter',
      message: 'Select the linter:',
      choices: CONST.LINTERS.choose
    }])

    promise.then(function (props) {
      _.forEach(CONST.LINTERS.choose, function (choice) {
        this[choice] = _.includes(props.linter, choice)
      }.bind(this))
      cb()
    }.bind(this))
  },

  testing: function () {
    const cb = this.async()

    const promise = this.prompt([{
      type: 'checkbox',
      name: 'testing',
      message: 'Select testing tools:',
      choices: CONST.TESTING.choose
    }])

    promise.then(function (props) {
      _.forEach(CONST.TESTING.choose, function (choice) {
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

    /* TRANSPILERS */

    _.forEach(CONST.TRANSPILERS.choose, function (transpiler) {
      if (this[transpiler]) this.package.dependencies[transpiler] = 'latest'
    }.bind(this))

    /* TESTING */

    _.forEach(CONST.TESTING.choose, function (testing) {
      if (this[testing]) this.package.devDependencies[testing] = 'latest'
    }.bind(this))

    let testScript = 'mocha'
    if (this.mocha) this.copy('test/_mocha.opts', 'test/mocha.opts')
    if (this.tape && !this.mocha) testScript = 'tape'
    this.package.scripts.test += testScript

    /* LINTERS */

    let lintScript = ''

    _.forEach(CONST.LINTERS.choose, function (style) {
      if (this[style]) {
        const script = style
        this.package.devDependencies[style] = 'latest'
        lintScript += lintScript === '' ? script : ' && ' + script
      }
    }.bind(this))

    if (this.jshint) this.copy('_jshintrc', '.jshintrc')
    if (this.jscs) this.copy('_jscsrc', '.jscsrc')

    this.package.scripts.lint = lintScript

    if (this.mocha && this.standard) this.package.standard = this.fs.readJSON(this.templatePath('linter/standard.json'))

    /* INDEX.JS */

    let indexExtension = 'js'
    if (!this['coffee-script']) this.package.devDependencies['coffee-script'] = 'latest'
    else indexExtension = 'coffee'

    this.copy('_index.' + indexExtension, 'index.js')

    /* README */

    this.readme += this.fs.read(this.templatePath('README/body.md'))
    this.readme = _.template(this.readme)(this)
    this.fs.write(this.destinationPath('README.md'), this.readme)
  },

  dependenciesVersion: function () {
    const cb = this.async()
    const _this = this

    setupDependenciesVersions(this.package).then(function (newPkg) {
      _this.package = newPkg
      cb()
    })
  },

  write: function () {
    const cb = this.async()

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
