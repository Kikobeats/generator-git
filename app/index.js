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
  const fetchVersions = deps => Promise.all(deps.map(dep => latestVersion(dep), []))

  const updatePkg = (namespace, versions) =>
    Object.keys(pkg[namespace])
      .forEach((dep, index) => (pkg[namespace][dep] = '~' + versions[index]))

  const promise = Promise.all(['dependencies']
    .map(dep => fetchVersions(Object.keys(pkg[dep]))
      .then(versions => updatePkg(dep, versions))))

  return promise.then(() => Promise.resolve(pkg))
}

const CONST = {
  LINTERS: {
    choose: ['jscs', 'jshint', 'standard-markdown', 'standard']
  },

  TESTING: {
    choose: ['jest', 'mocha', 'should', 'tap', 'tape']
  },

  TRANSPILERS: {
    choose: ['coffee-script']
  }
}

const capitalizeName = name => name.split('-')
  .reduce((acc, str, index) => acc + (index === 0 ? '' : ' ') + _.capitalize(str), '')

module.exports = generators.Base.extend({
  initializing () {
    this.licenseYear = new Date().getFullYear()
  },

  projectName () {
    this.log(yosay(`Initializing ${superb()} Project`))
    const cb = this.async()

    const promise = askName({
      name: 'name',
      message: 'Your project name',
      default: _.kebabCase(path.basename(process.cwd())),
      filter: _.kebabCase,
      validate: str => str.length > 0
    }, this)

    promise
      .then(answer => {
        const name = answer.name
        this.appName = name
        this.camelAppName = _.camelCase(name)
        this.capitalizeName = capitalizeName(this.appName)
        cb()
      })
  },

  setupPath () {
    if (path.basename(this.destinationPath()) !== this.appName) {
      this.log(
        `Your generator must be inside a folder named ${this.appName}\n
        I'll automatically create this folder.`
      )
      mkdirp(this.appName)
      this.destinationRoot(this.destinationPath(this.appName))
    }

    this.readme = this.fs.read(this.templatePath('README/header.md'))
    this.package = this.fs.read(this.templatePath('package/base.json'))
  },

  questions () {
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
    }])

    promise.then(props => {
      this.appDescription = props.appDescription
      this.userLogin = props.userLogin
      this.cli = props.cli
      cb()
    })
  },

  userInfo () {
    const cb = this.async()
    const promise = ghUser(this.userLogin)

    promise.then(user => {
      this.userName = user.name
      this.userEmail = user.email
      this.userBlog = user.blog
      this.userUrl = user.html_url
      cb()
    })
  },

  transpilers () {
    const cb = this.async()

    const promise = this.prompt([{
      type: 'checkbox',
      name: 'transpilers',
      message: 'Select transpilers:',
      choices: CONST.TRANSPILERS.choose
    }])

    promise.then(props => {
      CONST.TRANSPILERS.choose
        .forEach(choice => (this[choice] = _.includes(props.transpilers, choice)))
      cb()
    })
  },

  linters () {
    const cb = this.async()

    const promise = this.prompt([{
      type: 'checkbox',
      name: 'linter',
      message: 'Select the linter:',
      choices: CONST.LINTERS.choose
    }])

    promise.then(props => {
      CONST.LINTERS.choose
        .forEach(choice => (this[choice] = _.includes(props.linter, choice)))
      cb()
    })
  },

  testing () {
    const cb = this.async()

    const promise = this.prompt([{
      type: 'checkbox',
      name: 'testing',
      message: 'Select testing tools:',
      choices: CONST.TESTING.choose
    }])

    promise.then(props => {
      CONST.TESTING.choose
        .forEach(choice => (this[choice] = _.includes(props.testing, choice)))
      cb()
    })
  },

  setup () {
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

      this.package = Object.assign({}, this.package, cliPackage)
      this.readme += this.fs.read(this.templatePath('README/install/cli.md'))

      this.template('bin/_help.txt', 'bin/help.txt')
      this.copy('bin/_index.js', 'bin/index.js')
    } else {
      this.readme += this.fs.read(this.templatePath('README/install/normal.md'))
    }

    this.copy('_bumpedrc', '.bumpedrc')

    /* TRANSPILERS */

    CONST.TRANSPILERS.choose.forEach(transpiler =>
      (this[transpiler]) && (this.package.dependencies[transpiler] = 'latest'))

    /* TESTING */

    CONST.TESTING.choose.forEach(testing =>
      (this[testing]) && (this.package.devDependencies[testing] = 'latest'))

    let testScript = 'mocha'
    if (this.mocha) this.copy('test/_mocha.opts', 'test/mocha.opts')
    if (this.tape && !this.mocha) testScript = 'tape'
    this.package.scripts.test += testScript

    if (this.jest) {
      delete this.package.devDependencies.nyc // nyc is not needed anymore!
      this.package.scripts.coveralls = 'cat ./coverage/lcov.info | coveralls'
      this.package.scripts.test = 'jest --coverage'
      this.package.scripts['test:watch'] = 'jest --watch'
      const jestConfig = this.fs.readJSON(this.templatePath('package/jest.json'))
      this.package = Object.assign({}, this.package, jestConfig)
    }

    /* LINTERS */

    let lintScript = ''

    CONST.LINTERS.choose.forEach(linter => {
      if (this[linter]) {
        this.package.devDependencies[linter] = 'latest'
        lintScript += lintScript === '' ? linter : ' && ' + linter
      }
    })

    if (this.jshint) this.copy('_jshintrc', '.jshintrc')
    if (this.jscs) this.copy('_jscsrc', '.jscsrc')

    this.package.scripts.lint = lintScript

    if (this.standard) {
      this.package.devDependencies['prettier-standard'] = 'latest'
      this.package.scripts.prelint = 'npm run pretty'
      this.package.scripts.pretty = 'prettier-standard index.js src/**/*.js test/**/*.js bin/**/*.js'

      if (this.mocha || this.jest) {
        this.package.standard = { env: [this.mocha ? 'mocha' : 'jest'] }
      }
    }

    /* INDEX.JS */

    const indexExtension = this['coffee-script'] ? 'coffee' : 'js'
    this.copy('_index.' + indexExtension, 'index.js')

    /* README */

    this.readme += this.fs.read(this.templatePath('README/body.md'))
    this.readme = _.template(this.readme)(this)
    this.fs.write(this.destinationPath('README.md'), this.readme)
  },

  dependenciesVersion () {
    const cb = this.async()

    setupDependenciesVersions(this.package)
      .then(newPkg => {
        this.package = newPkg
        cb()
      })
  },

  write () {
    const cb = this.async()

    finepack(this.package, {
      validate: false,
      color: false
    }, (err, packageFormated) => {
      if (err) cb(err)
      this.fs.writeJSON(this.destinationPath('package.json'), packageFormated)
      cb()
    })
  },

  install () {
    this.installDependencies({ bower: false })
  }
})
