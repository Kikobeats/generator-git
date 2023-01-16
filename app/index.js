'use strict'

const { camelCase, template, kebabCase } = require('lodash')
const Generator = require('yeoman-generator')
const askName = require('inquirer-npm-name')
const humanizeUrl = require('humanize-url')
const { mkdir } = require('fs/promises')
const finepack = require('finepack')
const ghUser = require('gh-user')
const path = require('path')

const mkdirp = filepath => mkdir(filepath, { recursive: true }).catch(() => {})

const { capitalizeName, setupDependenciesVersions } = require('./helpers')

module.exports = class extends Generator {
  initializing () {
    this.licenseYear = new Date().getFullYear()
  }

  async prompting () {
    const answer = await askName(
      {
        name: 'name',
        message: 'Your project name',
        default: kebabCase(path.basename(process.cwd())),
        filter: kebabCase,
        validate: str => str.length > 0
      },
      this
    )

    const name = answer.name
    this.appName = name
    this.camelAppName = camelCase(name)
    this.capitalizeName = capitalizeName(this.appName)
  }

  default () {
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

    const promise = this.prompt([
      {
        name: 'appDescription',
        message: 'A short description of your project',
        default: "I'm a lazy"
      },
      {
        name: 'keywords',
        message: 'Throw here some keywords of your project (comma separated)'
      },
      {
        name: 'userLogin',
        message: 'Would you mind telling me your username on GitHub?',
        default: 'someone'
      },
      {
        name: 'cli',
        message: 'Do you need a CLI ?',
        type: 'confirm',
        default: false
      }
    ])

    promise.then(props => {
      this.appDescription = props.appDescription
      this.keywords = props.keywords
        ? props.keywords.replace(/\s/g, '').split(',')
        : []
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
      this.userEmail = user.email || this.user.git.email()
      this.userUrl = user.blog
      this.githubUrl = user.html_url
      this.humanizeUserUrl = this.userUrl
        ? humanizeUrl(this.userUrl)
        : this.userUrl
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
    this.fs.copy(this.templatePath('_npmrc'), this.destinationPath('.npmrc'))
    this.fs.copy(this.templatePath('_github'), this.destinationPath('.github'))
    this.fs.copyTpl(
      this.templatePath('_LICENSE.md'),
      this.destinationPath('LICENSE.md'),
      this
    )

    this.package = template(this.package)(this)
    this.package = JSON.parse(this.package)

    if (this.cli) {
      let cliPackage = this.fs.read(this.templatePath('package/cli.json'))
      cliPackage = template(cliPackage)(this)
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

    /* KEYWORDS */

    this.package.keywords = this.keywords

    /* KEYWORDS */

    this.package.keywords = this.keywords

    /* INDEX.JS */

    this.fs.copy(
      this.templatePath('_index.js'),
      this.destinationPath('index.js')
    )

    /* README */

    this.readme += this.fs.read(this.templatePath('README/body.md'))
    this.readme = template(this.readme)(this)
    this.fs.write(this.destinationPath('README.md'), this.readme)
  }

  dependenciesVersion () {
    const cb = this.async()

    setupDependenciesVersions(this.package).then(newPkg => {
      this.package = newPkg
      cb()
    })
  }

  writePackage () {
    const cb = this.async()

    finepack(
      this.package,
      {
        validate: false,
        color: false
      },
      (err, packageFormated) => {
        if (err) cb(err)
        this.fs.writeJSON(this.destinationPath('package.json'), packageFormated)
        cb()
      }
    )
  }

  install () {
    this.spawnCommandSync('git', ['init'])
    this.spawnCommandSync('git', [
      'remote',
      'add',
      'origin',
      `git@github.com:${this.userLogin}/${this.appName}.git`
    ])
    this.spawnCommandSync('npm', ['install'])
  }
}
