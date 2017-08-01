const pkg = require('../package')
const { capitalizeName, setupDependenciesVersions } = require('../app/helpers')

describe('Helper methods', () => {
  test('capitalizeName', () => {
    expect(capitalizeName('project-name')).toBe('Project Name')
  })

  test('setupDependenciesVersions', () => {
    expect.assertions(1)
    return expect(setupDependenciesVersions(pkg)).resolves.toBe(pkg)
  })
})
