import { Command } from 'commander'
import { createRunner } from '../runner'
import { ArchivistRC, ArchivistRunOptions } from '../types'
import { createLogger } from '../utils'

export const runTasks = async (names: string[], opts: Partial<ArchivistRunOptions>, rc: Partial<ArchivistRC>): Promise<void> => {
  const logger = createLogger(opts?.debug ?? rc?.debug, opts?.quiet ?? rc?.quiet)
  const runner = createRunner(rc, logger)
  const tasks = rc.tasks?.filter((t) => names.includes(t.name) || names.length < 1) ?? []
  logger('info', `Running "${tasks.length}" task(s)...`)
  await Promise.all(tasks.map(runner))
}

/**
 * Add run tasks command to commander
 * @param app Commander app
 * @returns   Configured app
 */
export const runTasksCommand = (app: Command): Command => {
  return app
    .command('run [task_name]')
    .description('run tasks')
    .option('-q, --quiet', 'disable console output')
    .option('--debug', 'Enable debug output')
}
