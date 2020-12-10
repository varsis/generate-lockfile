# Generate Lockfile

### Description
This package allows you to generate a new yarn.lock file from an existing yarn.lock file and 
package.json. This is useful for use with Yarn workspaces and allows you to generate a lockfile for a workspace using the root lockfile. The cli only looks up exact versions and should not be used for generating a lockfile from one project to another.

### Usage
```
  Usage: index.js --package <package> --lockfile <lockfile> [options]

  Options:

    -h, --help                 output usage information
    -V, --version              output the version number
    -p, --package <package>    package.json path
    -l, --lockfile <lockfile>  yarn.lock path
    -v, --verbose [verbose]    Log details
    -f, --force [force]        Overwrite lockfile
    -d, --dev [dev]            Include devDependencies
    -w, --write [write]        Write lockfile
 ```

