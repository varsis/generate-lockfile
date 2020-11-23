import fs from 'fs'
import path from 'path'
import childProcess from 'child_process'
import util from 'util'
const exec = util.promisify(childProcess.exec)

describe('Executes', () => {
    it('generates an identical lockfile', async () => {
        const scriptPath = path.resolve(path.join(__dirname, '../bin/index.js'))
        const packagePath = path.resolve(path.join(__dirname, './testPackage/package.json'))
        const lockfilePath = path.resolve(path.join(__dirname, './testPackage/yarn.lock'))
        console.log(scriptPath, packagePath, lockfilePath)
        const expectedLockfile = fs.readFileSync(lockfilePath, 'utf-8')
        const result = await exec(`${scriptPath} --package ${packagePath} --lockfile ${lockfilePath}`)

        console.log(result, expectedLockfile)
    })
})
