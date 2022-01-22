import { Command } from 'commander'

export const listTasks = async (): Promise<void> => {}

/**
 * Add list tasks command to commander
 * @param app Commander app
 * @returns   Configured app
 */
export const listTasksCommand = (app: Command): Command => {
  return app
    .command('list [task_names...]')
    .alias('ls')
    .description('List task stats')
    .option('--debug', 'Enable debug output')
}
