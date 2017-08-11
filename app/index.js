'use strict'

const _ = require('lodash')
const path = require('path')
const yosay = require('yosay')
const superb = require('superb')
const mkdirp = require('mkdirp')
const ghUser = require('gh-user')
const finepack = require('finepack')
const askName = require('inquirer-npm-name')
const Generator = require('yeoman-generator')

const { capitalizeName, setupDependenciesVersions } = require('./helpers')

const CONST = {
  LINTERS: {
    choose: ['jscs', 'jshint', 'standard']
  },

  TESTING: {
    choose: ['ava', 'jest', 'mocha', 'should', 'tap', 'tape']
  },

  TRANSPILERS: {
    choose: ['coffee-script']
  }
}

module.exports = class extends Generator {
  initializing () {
    this.licenseYear = new Date().getFullYear()
  }

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
  }

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
  }

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
  }

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
  }

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
  }

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
  }

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
  }

  setup () {
    this.fs.copy(
      this.templatePath('_editorconfig'),
      this.destinationPath('.editorconfig')
    )
    this.fs.copy(
      this.templatePath('_gitignore'),
      this.destinationPath('.gitignore')
    )
    this.fs.copy(
      this.templatePath('_gitattributes'),
      this.destinationPath('.gitattributes')
    )
    this.fs.copy(
      this.templatePath('_npmignore'),
      this.destinationPath('.npmignore')
    )
    this.fs.copy(
      this.templatePath('_npmrc'),
      this.destinationPath('.npmrc')
    )
    this.fs.copy(
      this.templatePath('_travis.yml'),
      this.destinationPath('.travis.yml')
    )
    this.fs.copyTpl(
      this.templatePath('_LICENSE'),
      this.destinationPath('LICENSE'),
      this
    )

    this.package = _.template(this.package)(this)
    this.package = JSON.parse(this.package)

    if (this.cli) {
      let cliPackage = this.fs.read(this.templatePath('package/cli.json'))
      cliPackage = _.template(cliPackage)(this)
      cliPackage = JSON.parse(cliPackage)

      this.package = Object.assign({}, this.package, cliPackage)
      this.readme += this.fs.read(this.templatePath('README/install/cli.md'))

      this.fs.copyTpl(
        this.templatePath('bin/_help.txt'),
        this.destinationPath('bin/help.txt'),
        this
      )
      this.fs.copy(
        this.templatePath('bin/_index.js'),
        this.destinationPath('bin/index.js')
      )
    } else {
      this.readme += this.fs.read(this.templatePath('README/install/normal.md'))
    }

    this.fs.copy(
      this.templatePath('_bumpedrc'),
      this.destinationPath('.bumpedrc')
    )

    /* TRANSPILERS */

    CONST.TRANSPILERS.choose.forEach(transpiler =>
      (this[transpiler]) && (this.package.dependencies[transpiler] = 'latest'))

    /* TESTING */

    CONST.TESTING.choose.forEach(testing =>
      (this[testing]) && (this.package.devDependencies[testing] = 'latest'))

    let testScript = 'mocha'
    if (this.mocha) {
      this.fs.copy(
        this.templatePath('test/_mocha.opts'),
        this.destinationPath('test/mocha.opts')
      )
    }
    if (this.ava) testScript = 'ava'
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

    if (this.jshint) {
      this.fs.copy(
        this.templatePath('_jshintrc'),
        this.destinationPath('.jshintrc')
      )
    }
    if (this.jscs) {
      this.fs.copy(
        this.templatePath('_jscsrc'),
        this.destinationPath('.jscsrc')
      )
    }

    this.package.scripts.lint = lintScript

    if (this.standard) {
      this.package.devDependencies['prettier-standard'] = 'latest'
      this.package.devDependencies['standard-markdown'] = 'latest'
      this.package.scripts.prelint = 'npm run pretty'
      this.package.scripts.pretty = 'prettier-standard {core,test,bin}/**/*.js'

      lintScript = `standard-markdown && ${lintScript}`

      if (this.mocha || this.jest) {
        this.package.standard = { env: [this.mocha ? 'mocha' : 'jest'] }
      }
    }

    this.package.scripts.lint = lintScript

    /* INDEX.JS */

    const indexExtension = this['coffee-script'] ? 'coffee' : 'js'
    this.fs.copy(
      this.templatePath(`_index.${indexExtension}`),
      this.destinationPath('index.js')
    )

    /* README */

    this.readme += this.fs.read(this.templatePath('README/body.md'))
    this.readme = _.template(this.readme)(this)
    this.fs.write(this.destinationPath('README.md'), this.readme)
  }

  dependenciesVersion () {
    const cb = this.async()

    setupDependenciesVersions(this.package)
      .then(newPkg => {
        this.package = newPkg
        cb()
      })
  }

  writePackage () {
    const cb = this.async()

    finepack(this.package, {
      validate: false,
      color: false
    }, (err, packageFormated) => {
      if (err) cb(err)
      this.fs.writeJSON(this.destinationPath('package.json'), packageFormated)
      cb()
    })
  }

  install () {
    this.installDependencies({ bower: false })
  }
}
