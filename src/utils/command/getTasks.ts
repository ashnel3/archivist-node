import { Logger } from '../logger'
import { ArchivistRC } from '../../types'

/**
 * Find tasks by name
 * @param names  - Array of task names
 * @param logger - Logger
 * @returns      - RC tasks
 */
export const getTasks = (
  names: string[],
  rc: Partial<ArchivistRC>,
  logger: Logger,
): ArchivistRC['tasks'] => {
  return names.reduce((acc: ArchivistRC['tasks'], n) => {
    const t = rc?.tasks?.find((t) => t.name === n)
    if (typeof t === 'undefined') {
      logger('error', `failed to find task - ${n}`)
      return acc
    }
    return [...acc, t]
  }, [])
}
