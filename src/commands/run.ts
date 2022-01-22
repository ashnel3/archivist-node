// TODO: Run command

import { Command } from 'commander'

export const runTasks = async (): Promise<void> => {}

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
