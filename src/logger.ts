let _verbose = false
export const setVerbose = (verbose: boolean) => (_verbose = verbose)
export const log = (message?: any, ...optional: any[]) => (_verbose ? console.debug(message, ...optional) : null)
