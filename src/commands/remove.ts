import { join } from 'path'
import { createLogger } from '../utils/logger'
import { command, remove } from '../utils'
import { ArchivistRC, ArchivistRemoveOptions } from '../types'

// FIXME: Tasks can be anywhere
// the dir param can be removed. the releases dir should be in the same folder

/**
 * Remove tasks
 * @param dir   - Release directory
 * @param names - Task names
 * @param opts  - Command-line opts
 * @param rc    - Archivist rc
 */
export const removeTasks = async (
  dir: string,
  names: string[],
  opts: Partial<ArchivistRemoveOptions>,
  rc: Partial<ArchivistRC>,
): Promise<void> => {
  const logger = createLogger(opts?.debug ?? rc?.debug, opts?.quiet ?? rc?.quiet)
  const tasks = command.getTasks(names, rc, logger)
  await Promise.all(
    tasks.map(async ({ name, path }) => {
      logger('info', `removing task - ${name}`)
      await remove([path, ...(opts?.clean === true ? [join(dir, name)] : [])])
    }),
  )
}
