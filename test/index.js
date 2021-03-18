'use strict'

const test = require('ava')

const pkg = require('../package')
const { capitalizeName, setupDependenciesVersions } = require('../app/helpers')

test('capitalizeName', t => {
  t.is(capitalizeName('project-name'), 'Project Name')
})

test('.setupDependenciesVersions', async t => {
  t.deepEqual(await setupDependenciesVersions(pkg), pkg)
})
