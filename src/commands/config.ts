import { join } from 'path'
import { createLogger, readRC, writeRC } from '../utils'
import { getTasks, parseTaskOptions } from '../utils/command'
import { ArchivistConfigOptions, ArchivistRC, ArchivistTaskRC } from '../types'
import { Command } from 'commander'

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
): Promise<string[]> => {
  const logger = createLogger(opts?.debug ?? rc?.debug, opts?.quiet ?? rc?.quiet)
  const optsRC = parseTaskOptions(opts, logger)
  const tasks = getTasks(names, rc, logger)

  if (Object.keys(optsRC).length > 0) {
    return await Promise.all(
      tasks.map(async ({ name, path }) => {
        const rcPath = join(path, '.taskrc.json')
        const { rc } = await readRC<Partial<ArchivistTaskRC>>(rcPath, null)

        // Task is in the rc but can't be found
        if (rc === null) {
          throw new Error(`failed to find taskrc - "${rcPath}"`)
        }

        logger('info', `configured - ${name}`)
        await writeRC<Partial<ArchivistTaskRC>>(rcPath, {
          ...rc,
          ...optsRC,
        })
        return name
      }),
    )
  } else {
    logger('error', 'Config options must be specified!')
    return []
  }
}

/**
 * add config tasks to commander
 * @param app Commander app
 * @returns   Configured app
 */
export const configTasksCommand = (app: Command): Command => {
  return app
    .command('config <task_names...>')
    .description('configure tasks')
    .option('-e, --enable', 'enable tasks')
    .option('-d, --disable', 'disable task')
    .option('-i, --interval <int>', 'update interval in hours', '24')
    .option('-a, --accept <files>', 'accepted files')
    .option('-r, --reject <files>', 'rejected files')
    .option('-x, --exclude <dirs>', 'excluded directories')
    .option('-l, --level', 'maximum recursion depth')
    .option('-q, --quiet', 'disable console output')
    .option('--debug', 'Enable debug output')
}
