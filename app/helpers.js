const _ = require('lodash')
const latestVersion = require('latest-version')

function setupDependenciesVersions (pkg) {
  const fetchVersions = deps => Promise.all(deps.map(dep => latestVersion(dep), []))

  const updatePkg = (namespace, versions) =>
    Object.keys(pkg[namespace])
      .forEach((dep, index) => (pkg[namespace][dep] = '~' + versions[index]))

  const promise = Promise.all(['dependencies']
    .map(dep => fetchVersions(Object.keys(pkg[dep]))
      .then(versions => updatePkg(dep, versions))))

  return promise.then(() => Promise.resolve(pkg))
}

const capitalizeName = name => name.split('-')
  .reduce((acc, str, index) => acc + (index === 0 ? '' : ' ') + _.capitalize(str), '')

module.exports = { setupDependenciesVersions, capitalizeName }
