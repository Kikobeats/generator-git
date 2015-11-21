# <%= appname %>

<p align="center">
  <br>
  <img src="https://i.imgur.com/Mh13XWB.gif" alt="<%= appname %>">
  <br>
</p>

![Last version](https://img.shields.io/github/tag/<%= githubUser %>/<%= slugifyAppname %>.svg?style=flat-square)
[![Build Status](http://img.shields.io/travis/<%= githubUser %>/<%= slugifyAppname %>/master.svg?style=flat-square)](https://travis-ci.org/<%= githubUser %>/<%= slugifyAppname %>)
[![Coverage Status](http://img.shields.io/coveralls/<%= githubUser %>/<%= slugifyAppname %>/master.svg?style=flat-square)](https://coveralls.io/r/<%= githubUser %>/<%= slugifyAppname %>?branch=master)
[![Dependency status](http://img.shields.io/david/<%= githubUser %>/<%= slugifyAppname %>.svg?style=flat-square)](https://david-dm.org/<%= githubUser %>/<%= slugifyAppname %>)
[![Dev Dependencies Status](http://img.shields.io/david/dev/<%= githubUser %>/<%= slugifyAppname %>.svg?style=flat-square)](https://david-dm.org/<%= githubUser %>/<%= slugifyAppname %>#info=devDependencies)
[![NPM Status](http://img.shields.io/npm/dm/<%= slugifyAppname %>.svg?style=flat-square)](https://www.npmjs.org/package/<%= slugifyAppname %>)
[![Donate](https://img.shields.io/badge/donate-paypal-blue.svg?style=flat-square)](https://paypal.me/<%= githubUser %>)

**NOTE:** more badges availables in [shields.io](http://shields.io/)

> <%= appDescription %>

## Install

```bash
npm install <%=slugifyAppname%> --save
```

You can use this module globally as well:

```bash
npm install <%=slugifyAppname%> -g
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
