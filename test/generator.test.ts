import fs from 'fs'
import path from 'path'
import { generateLockfileObject, getAndParseFiles } from '../src/generator'
import * as lock from '@yarnpkg/lockfile'
import { expect } from 'chai'

describe('Executes', () => {
    it('generates an identical lockfile for test package', () => {
        const packagePath = path.resolve(path.join(__dirname, './testPackage/package.json'))
        const lockfilePath = path.resolve(path.join(__dirname, './testPackage/yarn.lock'))
        const expectedLockfile = fs.readFileSync(lockfilePath, 'utf-8')

        const { inputLockfile, inputPackageJson } = getAndParseFiles(lockfilePath, packagePath)
        const result = generateLockfileObject(
            { ...inputPackageJson.dependencies, ...inputPackageJson.devDependencies },
            inputLockfile.object
        )

        expect(lock.stringify(result)).equals(expectedLockfile)
    })
    it('generates an identical lockfile for test package 2', () => {
        const packagePath = path.resolve(path.join(__dirname, './testPackage2/package.json'))
        const lockfilePath = path.resolve(path.join(__dirname, './testPackage2/yarn.lock'))
        const expectedLockfile = fs.readFileSync(lockfilePath, 'utf-8')

        const { inputLockfile, inputPackageJson } = getAndParseFiles(lockfilePath, packagePath)
        const result = generateLockfileObject(
            { ...inputPackageJson.dependencies, ...inputPackageJson.devDependencies },
            inputLockfile.object
        )

        expect(lock.stringify(result)).equals(expectedLockfile)
    })
})
