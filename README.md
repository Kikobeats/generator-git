# generator-git

![Last version](https://img.shields.io/github/tag/kikobeats/generator-git.svg?style=flat-square)
[![Dependency status](http://img.shields.io/david/Kikobeats/generator-git.svg?style=flat-square)](https://david-dm.org/Kikobeats/generator-git)
[![Dev Dependencies Status](http://img.shields.io/david/dev/Kikobeats/generator-git.svg?style=flat-square)](https://david-dm.org/Kikobeats/generator-git#info=devDependencies)
[![NPM Status](http://img.shields.io/npm/dm/generator-git.svg?style=flat-square)](https://www.npmjs.org/package/generator-git)
[![Gittip](http://img.shields.io/gittip/Kikobeats.svg?style=flat-square)](https://www.gittip.com/Kikobeats/)
> Create the basic scaffolding to start with a git proyect

![](http://i.imgur.com/T2DgNL0.gif)

Inspired in [sindresorhus](https://github.com/sindresorhus) and [mikermcneil](https://github.com/mikermcneil) style.

## What's new:

- Setup `package.json` and `bower.json` fetching information from your Github account.
- Setup testing scaffold and travis configuration.
- Added common meta information for editor and linters.
- Prepare the environment for start a NPM project using JavaScript/CoffeeScript.
- Prepare a gulp task for compile the code for use in the browser using broserify.

## Install

```bash
$ npm install -g generator-git
```

## Usage

```bash
$ yo git
```

## Scaffolding

### Basic

* `.gitattributes`
* `.gitignore`
* `.travis.yml`
* `.jshintrc`
* `.editorconfig`
* `package.json`
* `LICENSE.md`
* `README.md`

### For Testing

* `test/test.sh`
* `test/test.coffee`

## Additional

Remember install [editorconfig](http://editorconfig.org/) in your favorite editor.

## License

MIT © [Kiko Beats](http://kikobeats.com)
