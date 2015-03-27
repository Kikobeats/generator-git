# <%= appname %>

<h1 align="center">
  <br>
  <img src="" alt="<%= appname %>">
  <br>
  <br>
</h1>

[![Build Status](http://img.shields.io/travis/<%= githubUser %>/<%= _.slugify(appname) %>/master.svg?style=flat-square)](https://travis-ci.org/<%= githubUser %>/<%= _.slugify(appname) %>)
[![Coverage Status](http://img.shields.io/coveralls/<%= githubUser %>/<%= _.slugify(appname) %>/master.svg?style=flat-square)](https://coveralls.io/r/<%= githubUser %>/<%= _.slugify(appname) %>?branch=master)
[![Dependency status](http://img.shields.io/david/<%= githubUser %>/<%= _.slugify(appname) %>.svg?style=flat-square)](https://david-dm.org/<%= githubUser %>/<%= _.slugify(appname) %>)
[![Dev Dependencies Status](http://img.shields.io/david/dev/<%= githubUser %>/<%= _.slugify(appname) %>.svg?style=flat-square)](https://david-dm.org/<%= githubUser %>/<%= _.slugify(appname) %>#info=devDependencies)
[![NPM Status](http://img.shields.io/npm/dm/<%= _.slugify(appname) %>.svg?style=flat-square)](https://www.npmjs.org/package/<%= _.slugify(appname) %>)
[![Gittip](http://img.shields.io/gittip/<%= githubUser %>.svg?style=flat-square)](https://www.gittip.com/<%= githubUser %>/)

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


