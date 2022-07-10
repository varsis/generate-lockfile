import * as fs from 'fs'
import * as path from 'path'
import { parseSyml, stringifySyml } from '@yarnpkg/parsers'
import chalk from 'chalk'
import { log } from './logger'

interface IParsedLockfile {
    [packageNameWithVersionAndRepo: string]: IPackageDetails
}

interface IDependencyObject {
    [packageName: string]: string
}

interface IPackageDetails {
    version: string
    resolution: string
    checksum: string
    languageName: string
    linkType: string
    dependencies?: IDependencyObject
    optionalDependencies?: IDependencyObject
}

export const generateLockfileString = (
    dependencies: { [k: string]: string },
    parsedLockfile: IParsedLockfile,
    foundDependencies: Record<string, IPackageDetails> = {}
): string => stringifySyml(generateLockfileObject(dependencies, parsedLockfile, foundDependencies))

const escapeRegex = (inputString: string) => inputString.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')

const findPackageDetails = (key: string, version: string, lockFile: IParsedLockfile): { details: IPackageDetails, key: string }| null => {
  const exp = new RegExp(`(^| )${escapeRegex(key)}@\\w+:${escapeRegex(version)}`)
  const foundKey = Object.keys(lockFile).find(k => exp.test(k))
  log(`Looking for ${key} ${version} ${exp}`)
  return { key: foundKey, details: lockFile[foundKey] } ?? null
}

const generateLockfileObject = (
    dependencies: { [k: string]: string },
    parsedLockfile: IParsedLockfile,
    foundDependencies: Record<string, IPackageDetails> = {}
) => {
    for (const key of Object.keys(dependencies)) {
        const version = dependencies[key]
        const dependencyDetails = findPackageDetails(key, version, parsedLockfile)
        const lockfileKey = dependencyDetails.key
        const dependencyFromLockfile = dependencyDetails.details

        // Add the dependency
        if (!dependencyFromLockfile) {
            log(chalk.red(`Could not find: ${key} ${version}`))
            throw new Error(`Could not find: ${key} ${version}`)
        }

        if (lockfileKey in foundDependencies) {
            log(chalk.yellow('Dependency already resolved'), chalk.blue(lockfileKey))
            continue
        }

        foundDependencies[lockfileKey] = dependencyFromLockfile

        // Get any dependencies under this dependency
        if (dependencyFromLockfile.dependencies || dependencyFromLockfile.optionalDependencies) {
            generateLockfileObject(
                { ...dependencyFromLockfile.dependencies, ...dependencyFromLockfile.optionalDependencies },
                parsedLockfile,
                foundDependencies
            )
        }
    }

    // Copy metadata
    foundDependencies.__metadata = parsedLockfile.__metadata
    console.log(Object.keys(foundDependencies))
    return foundDependencies
}

export const getAndParseFiles = (lockFilePath: string, packageFilePath: string) => {
    log(chalk.whiteBright('Lockfile:'), chalk.green(lockFilePath))
    log(chalk.whiteBright('Package.json:'), chalk.green(packageFilePath))

    const lockfileString = fs.readFileSync(path.resolve(lockFilePath), 'utf8')
    const inputLockfile = parseSyml(lockfileString)
    const inputPackageJson = JSON.parse(fs.readFileSync(path.resolve(packageFilePath), 'utf8'))

    return {
        inputLockfile,
        inputPackageJson
    }
}
