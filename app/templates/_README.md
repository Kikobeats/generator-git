# <%= appname %>

[![Build Status](http://img.shields.io/travis/<%= githubUser %>/<%= _.slugify(appname) %>/master.svg?style=flat)](https://travis-ci.org/<%= githubUser %>/<%= _.slugify(appname) %>)
[![Coverage Status](http://img.shields.io/coveralls/<%= githubUser %>/<%= _.slugify(appname) %>/master.svg?style=flat)](https://coveralls.io/r/<%= githubUser %>/<%= _.slugify(appname) %>?branch=master)
[![Dependency status](http://img.shields.io/david/<%= githubUser %>/<%= _.slugify(appname) %>.svg?style=flat)](https://david-dm.org/<%= githubUser %>/<%= _.slugify(appname) %>)
[![Dev Dependencies Status](http://img.shields.io/david/dev/<%= githubUser %>/<%= _.slugify(appname) %>.svg?style=flat)](https://david-dm.org/<%= githubUser %>/<%= _.slugify(appname) %>#info=devDependencies)
[![NPM Status](http://img.shields.io/npm/dm/<%= _.slugify(appname) %>.svg?style=flat)](https://www.npmjs.org/package/<%= _.slugify(appname) %>)
[![Gittip](http://img.shields.io/gittip/<%= githubUser %>.svg?style=flat)](https://www.gittip.com/<%= githubUser %>/)

**NOTE:** more badges availables in [shields.io](http://shields.io/)

> <%= appDescription %>

## Install

```bash
npm install <%=_.slugify(appname)%>
```

If you want to use in the browser (powered by [Browserify](http://browserify.org/)):

```bash
bower install <%=_.slugify(appname)%> --save
```

and later link in your HTML:

```html
<script src="bower_components/<%=_.slugify(appname)%>/dist/<%=_.slugify(appname)%>.js"></script>
```

## Usage

## API

## License

MIT © [<%= realname %>](<%= blog %>)


