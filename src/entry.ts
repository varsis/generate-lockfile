import * as fs from 'fs'
import * as path from 'path'
import * as lock from '@yarnpkg/lockfile'
import chalk from 'chalk'
import semver from 'semver'
import program from 'commander-plus'

program
    .version('0.0.1')
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

const log = (message?: any, ...optional: any[]) => (program.verbose ? console.debug(message, ...optional) : null)

try {
    log(chalk.whiteBright('Lockfile:'), chalk.green(program.lockfile))
    log(chalk.whiteBright('Package.json:'), chalk.green(program.package))

    const lockfileString = fs.readFileSync(path.resolve(program.lockfile), 'utf8')
    const inputLockfile = lock.parse(lockfileString)
    const inputPackageJson = JSON.parse(fs.readFileSync(path.resolve(program.package), 'utf8'))

    const gen = (dependencies: { [k: string]: string }, parsedLockfile: object, deps: object = {}) => {
        for (const key of Object.keys(dependencies)) {
            for (const found of Object.keys(parsedLockfile).filter((x) => x.startsWith(key))) {
                const v = parsedLockfile[found]
                if (semver.satisfies(v.version, dependencies[key])) {
                    log(chalk.whiteBright('Satisfies version:'), chalk.cyan(key), chalk.blue(v.version), chalk.green(dependencies[key]))
                    const versionKey = `${key}@${dependencies[key]}`

                    if (versionKey in deps) {
                        log(chalk.yellow('Dependency already resolved'), chalk.blue(versionKey))
                        // break early
                        continue
                    }

                    deps[versionKey] = v

                    if (v.dependencies || v.optionalDependencies) {
                        gen({ ...v.dependencies, ...v.optionalDependencies }, parsedLockfile, deps)
                    }
                }
            }
        }
        return deps
    }

    log('Using dev:', chalk.cyan(program.dev))
    const lockfileObject = gen(
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
