export type LoggerLevels = 'info' | 'error' | 'debug'

export type Logger = (level: LoggerLevels, ...messages: string[]) => void

/**
 * Create configured logger
 * @param debug - Enable debug output
 * @param quiet - Disable logger
 * @returns     - Logger
 */
export const createLogger = (debug = false, quiet = false): Logger => {
  const header = '[archivist]: '
  if (quiet) {
    return () => {}
  }
  if (debug) {
    return (level, ...messages) => {
      switch (level) {
        case 'debug':
          console.log(header + 'Debug: ' + messages.join(' '))
          return
        case 'error':
          console.log(header + 'Error: ' + messages.join(' '))
          return
        case 'info':
          console.log(header + messages.join(' '))
      }
    }
  }
  return (level, ...messages) => {
    switch (level) {
      case 'error':
        console.error(header + 'Error: ' + messages.join(' '))
        return
      case 'info':
        console.log(header + messages.join(' '))
    }
  }
}
