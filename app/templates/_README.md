# <%= appname %>

<h1 align="center">
  <br>
  <img src="" alt="<%= appname %>">
  <br>
  <br>
</h1>

![Last version](https://img.shields.io/github/tag/<%= githubUser %>/<%= slugifyAppname %>.svg?style=flat-square)
[![Build Status](http://img.shields.io/travis/<%= githubUser %>/<%= slugifyAppname %>/master.svg?style=flat-square)](https://travis-ci.org/<%= githubUser %>/<%= slugifyAppname %>)
[![Coverage Status](http://img.shields.io/coveralls/<%= githubUser %>/<%= slugifyAppname %>/master.svg?style=flat-square)](https://coveralls.io/r/<%= githubUser %>/<%= slugifyAppname %>?branch=master)
[![Dependency status](http://img.shields.io/david/<%= githubUser %>/<%= slugifyAppname %>.svg?style=flat-square)](https://david-dm.org/<%= githubUser %>/<%= slugifyAppname %>)
[![Dev Dependencies Status](http://img.shields.io/david/dev/<%= githubUser %>/<%= slugifyAppname %>.svg?style=flat-square)](https://david-dm.org/<%= githubUser %>/<%= slugifyAppname %>#info=devDependencies)
[![NPM Status](http://img.shields.io/npm/dm/<%= slugifyAppname %>.svg?style=flat-square)](https://www.npmjs.org/package/<%= slugifyAppname %>)
[![Gratipay](https://img.shields.io/gratipay/<%= githubUser %>.svg?style=flat-square)](https://gratipay.com/~<%= githubUser %>/)

**NOTE:** more badges availables in [shields.io](http://shields.io/)

> <%= appDescription %>

## Install

```bash
npm install <%=slugifyAppname%> --save
```

If you want to use in the browser (powered by [Browserify](http://browserify.org/)):

```bash
bower install <%=slugifyAppname%> --save
```

and later link in your HTML:

```html
<script src="bower_components/<%=slugifyAppname%>/dist/<%=slugifyAppname%>.js"></script>
```

## Usage

```js
var <%= camelAppame %> = require('<%= slugifyAppname %>');
```

## API

### <%= camelAppame %>(input, [options])

#### input

*Required*
Type: `string`

Lorem ipsum.

#### options

##### foo

Type: `boolean`
Default: `false`

Lorem ipsum.

## License

MIT © [<%= realname %>](<%= blog %>)


