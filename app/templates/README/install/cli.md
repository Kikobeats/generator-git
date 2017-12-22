
## Install

```bash
$ npm install <%= appName %> --global
```

## CLI

```bash
$ <%= appName %> --help

  Generates regular expressions that match a set of strings.

  Usage
    $ <%= appName %> [-gimuy] string1 string2 string3...

  Examples
    $ <%= appName %> foobar foobaz foozap fooza
    $ jq '.keywords' package.json | <%= appName %>
```
