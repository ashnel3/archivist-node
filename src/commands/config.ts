import { createLogger, readRC, writeRC } from '../utils'
import { getTasks, parseTaskOptions } from '../utils/command'
import { ArchivistConfigOptions, ArchivistRC, ArchivistTaskRC } from '../types'

/**
 * Configure tasks
 * @param names - Task names
 * @param opts  - Command-line opts
 * @param rc    - Archivist rc
 */
export const configTasks = async (
  names: string[],
  opts: Partial<ArchivistConfigOptions>,
  rc: Partial<ArchivistRC>,
): Promise<void> => {
  const logger = createLogger(opts?.debug ?? rc?.debug, opts?.quiet ?? rc?.quiet)
  const optsRC = parseTaskOptions(opts, logger)
  const tasks = getTasks(names, rc, logger)

  if (Object.keys(optsRC).length > 0) {
    await Promise.all(
      tasks.map(async ({ name, path }) => {
        const { rc } = await readRC<Partial<ArchivistTaskRC>>(path, null)

        if (rc === null) {
          logger('error', `failed to find taskrc - ${path}`)
          return
        }

        logger('info', `configured - ${name}`)
        await writeRC<Partial<ArchivistTaskRC>>(path, {
          ...rc,
          ...optsRC,
        })
      }),
    )
  } else {
    logger('error', 'Config options must be specified!')
  }
}
