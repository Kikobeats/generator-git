'use strict';
var path    = require('path');
var url     = require('url');
var yeoman  = require('yeoman-generator');
var yosay   = require('yosay');
var chalk   = require('chalk');
var npmName = require('npm-name');
var superb  = require('superb');

/* jshint -W106 */
var proxy = process.env.http_proxy || process.env.HTTP_PROXY || process.env.https_proxy ||
  process.env.HTTPS_PROXY || null;
/* jshint +W106 */
var githubOptions = {
  version: '3.0.0'
};

if (proxy) {
  var proxyUrl = url.parse(proxy);
  githubOptions.proxy = {
    host: proxyUrl.hostname,
    port: proxyUrl.port
  };
}

var GitHubApi = require('github');
var github = new GitHubApi(githubOptions);

if (process.env.GITHUB_TOKEN) {
  github.authenticate({
    type: 'oauth',
    token: process.env.GITHUB_TOKEN
  });
}

var extractGeneratorName = function (_, appname) {
  var slugged = _.slugify(appname);
  var match = slugged.match(/^generator-(.+)/);

  if (match && match.length === 2) {
    return match[1].toLowerCase();
  }

  return slugged;
};

var githubUserInfo = function (name, cb) {
  github.user.getFrom({
    user: name
  }, function (err, res) {
    if (err) {
      throw new Error(err.message +
        '\n\nCannot fetch your github profile. Make sure you\'ve typed it correctly.');
    }
    cb(JSON.parse(JSON.stringify(res)));
  });
};

var GitGenerator = yeoman.generators.Base.extend({
  init: function () {
    this.pkg = require('../package.json');
    this.currentYear = (new Date()).getFullYear();

    this.on('end', function () {
      if (!this.options['skip-install']) {
        this.npmInstall();
      }
    });
  },

  /**
   * Ask for your Github account
   */
  askForYou: function () {
    var done = this.async();

    this.log(yosay('Initializing ' + superb() + ' Git Repository'));

    var prompts = [{
      name: 'githubUser',
      message: 'Would you mind telling me your username on GitHub?',
      default: 'someuser'
    }];

    this.prompt(prompts, function (props) {
      this.githubUser = props.githubUser;
      this.licenseYear = new Date().getFullYear();
      done();
    }.bind(this));
  },

  /**
   * Ask about the proyect
   */
  askForProyectName: function () {
    var done = this.async();
    var generatorName = extractGeneratorName(this._, this.appname);

    var prompts = [{
      name: 'generatorName',
      message: 'What\'s the base name of your generator?',
      default: generatorName
    }, {
      type: 'confirm',
      name: 'pkgName',
      message: 'The name above already exists on npm, choose another?',
      default: true,
      when: function(answers) {
        var done = this.async();

        npmName(answers.generatorName, function (err, available) {
          if (!available) {
            done(true);
          }

          done(false);
        });
      }
    }];

    this.prompt(prompts, function (props) {
      if (props.pkgName) {
        return this.askForProyectName();
      }

      this.generatorName = props.generatorName;
      this.appname = this.generatorName;

      done();
    }.bind(this));
  },

  askForProyectDescription: function(){
    var done = this.async();

    var prompts = [{
      name: 'appDescription',
      message: 'A short description of your project',
      default: 'I\'m a lazy'
    }];

    this.prompt(prompts, function (props) {
      this.appDescription = props.appDescription;
      done();
    }.bind(this));
  },

  enforceFolderName: function () {
    if (this.appname !== this._.last(this.destinationRoot().split(path.sep))) {
      this.destinationRoot(this.appname);
    }
  },

  userInfo: function () {
    var done = this.async();

    githubUserInfo(this.githubUser, function (res) {
      /*jshint camelcase:false */
      this.realname = res.name;
      this.email = res.email;
      this.blog = res.blog;
      this.githubUrl = res.html_url;
      done();
    }.bind(this));
  },

  projectfiles: function () {
    this.copy('_editorconfig', '.editorconfig');
    this.copy('_gitignore', '.gitignore');
    this.copy('_gitattributes', '.gitattributes');
    this.copy('_jshintrc', '.jshintrc');
    this.copy('_travis.yml', '.travis.yml');
    this.template('_README.md', 'README.md');
    this.template('_LICENSE.md', 'LICENSE.md');
    this.template('_package.json', 'package.json');
  },


  projectFolders: function () {
    this.mkdir('test');
    this.copy('test/_mocha.opts', 'test/mocha.opts');
  }

  // templates: function () {
  //   this.copy('editorconfig', 'app/templates/editorconfig');
  //   this.copy('jshintrc', 'app/templates/jshintrc');
  //   this.copy('app/templates/_package.json', 'app/templates/_package.json');
  //   this.copy('app/templates/_bower.json', 'app/templates/_bower.json');
  // },

  // tests: function () {
  //   this.mkdir('test');
  //   this.template('test-load.js', 'test/test-load.js');
  //   this.template('test-creation.js', 'test/test-creation.js');
  // }
});

module.exports = GitGenerator;
