import * as fs from 'fs'
import * as path from 'path'
import * as lock from '@yarnpkg/lockfile'
import chalk from 'chalk'
import { log } from './logger'

interface IParsedLockfile {
    [packageNameWithVersion: string]: IPackageDetails
}

interface IDependencyObject {
    [packageName: string]: string
}

interface IPackageDetails {
    version: string
    resolved: string
    integrity: string
    dependencies?: IDependencyObject
    optionalDependencies?: IDependencyObject
}

const getDependencyKey = (key: string, version: string) => `${key}@${version}`

export const generateLockfileObject = (
    dependencies: { [k: string]: string },
    parsedLockfile: IParsedLockfile,
    foundDependencies: object = {}
) => {
    for (const key of Object.keys(dependencies)) {
        const version = dependencies[key]
        const dependencyKey = getDependencyKey(key, version)

        if (dependencyKey in foundDependencies) {
            log(chalk.yellow('Dependency already resolved'), chalk.blue(dependencyKey))
            continue
        }

        // Add the dependency
        if (!(dependencyKey in parsedLockfile)) {
            log(chalk.red(`Could not find: ${dependencyKey}`))
            throw new Error(`Could not find: ${dependencyKey}`)
        }
        const dependencyFromLockfile: IPackageDetails = parsedLockfile[dependencyKey]
        foundDependencies[dependencyKey] = dependencyFromLockfile

        // Get any dependencies under this dependency
        if (dependencyFromLockfile.dependencies || dependencyFromLockfile.optionalDependencies) {
            generateLockfileObject(
                { ...dependencyFromLockfile.dependencies, ...dependencyFromLockfile.optionalDependencies },
                parsedLockfile,
                foundDependencies
            )
        }
    }
    return foundDependencies
}

export const getAndParseFiles = (lockFilePath: string, packageFilePath: string) => {
    log(chalk.whiteBright('Lockfile:'), chalk.green(lockFilePath))
    log(chalk.whiteBright('Package.json:'), chalk.green(packageFilePath))

    const lockfileString = fs.readFileSync(path.resolve(lockFilePath), 'utf8')
    const inputLockfile = lock.parse(lockfileString)
    const inputPackageJson = JSON.parse(fs.readFileSync(path.resolve(packageFilePath), 'utf8'))

    return {
        inputLockfile,
        inputPackageJson
    }
}
