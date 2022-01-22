import { dirname } from 'path'
import { Command } from 'commander'
import { createLogger } from '../utils/logger'
import { command, remove } from '../utils'
import { ArchivistRC, ArchivistRemoveOptions } from '../types'

/**
 * Remove tasks
 * @param names - Task names
 * @param opts  - Command-line opts
 * @param rc    - Archivist rc
 */
export const removeTasks = async (
  names: string[],
  opts: Partial<ArchivistRemoveOptions>,
  rc: Partial<ArchivistRC>,
): Promise<string[]> => {
  const logger = createLogger(opts?.debug ?? rc?.debug, opts?.quiet ?? rc?.quiet)
  const tasks = command.getTasks(names, rc, logger)
  return await Promise.all(
    tasks.map(async ({ name, path }) => {
      logger('info', `removing task - ${name}`)
      await remove([path])
      return name
    }),
  )
}

/**
 * Add remove tasks command to commander
 * @param app Commander app
 * @returns   Configured app
 */
export const removeTasksCommand = (app: Command): Command => {
  return app
    .command('remove <task_names...>')
    .alias('rm')
    .description('remove tasks')
    .option('-c, --clean', 'Remove all downloaded files')
    .option('-q, --quiet', 'disable console output')
    .option('--debug', 'Enable debug output')
}
