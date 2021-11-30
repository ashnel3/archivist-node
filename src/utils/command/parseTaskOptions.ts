import { Logger } from '../logger'
import { ArchivistOptions, ArchivistTaskRC } from '../../types'

/**
 * Extract task rc from command-line options
 * @param opts   - Command-line options
 * @param logger - Logger
 * @returns      - Task RC
 */
export const parseTaskOptions = (
  opts: Partial<ArchivistOptions>,
  logger: Logger,
): Partial<ArchivistTaskRC> => {
  return Object.entries(opts).reduce((acc: Partial<ArchivistTaskRC>, [key, value]) => {
    switch (true) {
      case key === 'enable' || key === 'disable':
        return { ...acc, enabled: key === 'enable' }
      case key === 'accept' || key === 'reject' || key === 'exclude':
        return {
          ...acc,
          [key]: (value as string).split(',').filter((v) => v !== ''),
        }
      case key === 'interval' || key === 'level': {
        const int = parseInt(value as string, 10)
        if (isNaN(int)) {
          logger('error', `failed to parse integer: ${value as string}`)
          return acc
        }
        return { ...acc, [key]: int }
      }
      default:
        return acc
    }
  }, {})
}
