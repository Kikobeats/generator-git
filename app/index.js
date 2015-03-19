'use strict';
var url     = require('url');
var path    = require('path');
var yosay   = require('yosay');
var superb  = require('superb');
var _       = require('lodash');
var npmName = require('npm-name');
var yeoman  = require('yeoman-generator');
var _s      = require('underscore.string');

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

var extractGeneratorName = function(appname) {
  var slugged = _s.slugify(appname);
  var match = slugged.match(/^generator-(.+)/);

  if (match && match.length === 2) {
    return match[1].toLowerCase();
  }

  return slugged;
};

var emptyGithubRes = {
  name: '',
  email: '',
  html_url: ''
};

var githubUserInfo = function(name, cb, log) {
  github.user.getFrom({
    user: name
  }, function(err, res) {
    if (err) {
      log.error('Cannot fetch your github profile. Make sure you\'ve typed it correctly.');
      res = emptyGithubRes;
    }
    cb(JSON.parse(JSON.stringify(res)));
  });
};

var GitGenerator = module.exports = yeoman.generators.Base.extend({
  initializing: function() {
    this.pkg = require('../package.json');
    this.currentYear = (new Date()).getFullYear();
  },

  prompting: {

    /**
     * Ask for your Github account
     */
    askFor: function() {
      var done = this.async();

      this.log(yosay('Initializing ' + superb() + ' Git Repository'));

      var prompts = [{
        name: 'githubUser',
        message: 'Would you mind telling me your username on GitHub?',
        default: 'someuser'
      }];

      this.prompt(prompts, function(props) {
        this.githubUser = props.githubUser;
        this.licenseYear = new Date().getFullYear();
        done();
      }.bind(this));
    },

    /**
     * Ask about the proyect
     */
    askForProyectName: function() {
      var done = this.async();
      var generatorName = extractGeneratorName(this.appname);

      var prompts = [{
        name: 'generatorName',
        message: 'What\'s the base name of your proyect?',
        default: generatorName
      }, {
        type: 'confirm',
        name: 'pkgName',
        message: 'The name above already exists on npm, choose another?',
        default: true,
        when: function(answers) {
          var done = this.async();
          npmName(answers.generatorName, function(err, available) {
            if (!available) {
              done(true);
            }
            done(false);
          });
        }
      }];

      this.prompt(prompts, function(props) {
        if (props.pkgName) {
          return this.prompting.askForProyectName.call(this);
        }
        this.generatorName = props.generatorName;
        this.appname = this.generatorName;
        done();
      }.bind(this));
    },

    askForProyectDescription: function() {
      var done = this.async();
      var prompts = [{
        name: 'appDescription',
        message: 'A short description of your project',
        default: 'I\'m a lazy'
      }];
      this.prompt(prompts, function(props) {
        this.appDescription = props.appDescription;
        done();
      }.bind(this));
    }
  },

  configuring: {
    enforceFolderName: function() {
      if (this.appname !== _.last(this.destinationRoot().split(path.sep))) {
        this.destinationRoot(this.appname);
      }
      this.config.save();
    },
    userInfo: function() {
      var done = this.async();

      githubUserInfo(this.githubUser, function(res) {
        /*jshint camelcase:false */
        this.realname = res.name;
        this.email = res.email;
        this.blog = res.blog;
        this.githubUrl = res.html_url;
        done();
      }.bind(this), this.log);
    }
  },

  writing: {
    projectfiles: function() {
      /* meta */
      this.copy('_editorconfig', '.editorconfig');
      this.copy('_gitignore', '.gitignore');
      this.copy('_gitattributes', '.gitattributes');
      this.copy('_jshintrc', '.jshintrc');
      this.copy('_jscsrc', '.jscsrc');
      this.copy('_npmignore', '.npmignore');
      this.copy('_npmrc', '.npmrc');
      this.copy('_travis.yml', '.travis.yml');

      /* basic */
      this.copy('_index.js', 'index.js');
      this.template('_README.md', 'README.md');
      this.template('_LICENSE.md', 'LICENSE.md');
      this.template('_package.json', 'package.json');
      this.template('_bower.json', 'bower.json');
      this.bulkCopy('_gulpfile.coffee', 'gulpfile.coffee');

      /* testing */
      this.mkdir('test');
      this.copy('test/_test.sh', 'test/test.sh');
      this.copy('test/_test.coffee', 'test/test.coffee');

      this.mkdir('dist');
      this.template('dist/_example.html', 'dist/example.html');

    }
  },

  install: function() {
    this.installDependencies({
      skipInstall: this.options['skip-install'],
      bower: false
    });
  }
});
