import * as fs from 'fs'
import * as path from 'path'
import * as lock from '@yarnpkg/lockfile'
import chalk from 'chalk'
import program from 'commander-plus'
import pkg from '../package.json'
import { log, setVerbose } from './logger'
import { generateLockfileObject, getAndParseFiles } from './generator'

program
    .version(pkg.version)
    .option('-v, --verbose', 'Log details')
    .option('-f, --force', 'Overwrite lockfile')
    .option('-d, --dev [dev]', 'Include devDependencies', false)
    .option('-w, --write [write]', 'Write lockfile')
    .option('-p, --package [package]', 'package.json path')
    .option('-l, --lockfile [lockfile]', 'yarn.lock path')
    .parse(process.argv)

// Check for args
if (!program.package || !program.lockfile) {
    program.help()
}

setVerbose(program.verbose)

try {
    const { inputLockfile, inputPackageJson } = getAndParseFiles(program.lockfile, program.package)
    log('Using dev:', chalk.cyan(program.dev))
    const lockfileObject = generateLockfileObject(
        { ...inputPackageJson.dependencies, ...(program.dev ? inputPackageJson.devDependencies : {}) },
        inputLockfile.object
    )

    if (program.write) {
        const lockWritePath = program.write === true ? 'yarn.lock' : program.write
        const fileExists = fs.existsSync(lockWritePath)
        if (fileExists && !program.force) {
            console.error('Lockfile already exists at:', chalk.red(lockWritePath), `(Use --force to overwrite)`)
            process.exit(1)
        }
        if (program.force && fileExists) {
            console.log(chalk.yellow('Overwriting:'), chalk.red(lockWritePath))
        }
        console.log(chalk.yellow('Lockfile written to:'), chalk.blue(lockWritePath))
        fs.writeFileSync(path.resolve(lockWritePath), lock.stringify(lockfileObject))
    } else {
        console.log(lock.stringify(lockfileObject))
    }
} catch (err) {
    console.error('Error:', chalk.red(err))
}
