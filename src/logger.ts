let _verbose = true
export const setVerbose = (verbose: boolean) => (_verbose = verbose)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const log = (message?: any, ...optional: any[]) => (_verbose ? console.debug(message, ...optional) : null)
