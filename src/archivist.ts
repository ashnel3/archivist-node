/* eslint-disable @typescript-eslint/no-var-requires */

import { join } from 'path'
import { Command } from 'commander'
import { addTask, configTasks, removeTasks } from './commands'
import { readRC, writeRC } from './utils'
import { DEFAULT_RC, DEFAULT_TASK_RC, VERSION } from './variables'
import { ArchivistListOptions, ArchivistRC } from './types'

export type ArchivistProcessEvent = { type: 'exit'; code: number } | { type: 'error'; error: Error }

const { HOME } = process.env

/** Commander app */
const app = new Command('archivist')

if (typeof HOME === 'undefined') {
  throw new Error('Home environment variable is not set, failed to read configuration!')
}

const dir = join(HOME, '.archivist')
const rcPath = join(dir, '.archivistrc.json')

// Main
void (async () => {
  let { rc, write: __write_rc } = await readRC<ArchivistRC>(rcPath, DEFAULT_RC)

  /**
   * Handle process events
   * @param event - Process event
   */
  const handleProcessEvent = (event: ArchivistProcessEvent): void => {
    switch (event.type) {
      case 'error': {
        throw event.error
      }
      case 'exit': {
        if (__write_rc && event.code === 0) {
          writeRC.sync(rcPath, rc)
        }
      }
    }
  }

  // App Meta-data
  app
    .addHelpText(
      'beforeAll',
      () =>
        require('cfonts').render('archivist +', { font: 'simple', gradient: ['red', 'blue'] })
          .string,
    )
    .description(
      `Archivist v${VERSION} - download websites, ftp directories, executables & keep them updated.`,
    )
    .version(VERSION, '--version')

  // Add task command
  app
    .command('add <url> [name] [path]')
    .description('add scheduled task')
    .option('-i, --interval <int>', 'update interval in hours', '24')
    .option('-a, --accept <files>', 'accepted files')
    .option('-r, --reject <files>', 'rejected files')
    .option('-x, --exclude <dirs>', 'excluded directories')
    .option('-l, --level', 'maximum recursion depth')
    .option('-q, --quiet', 'disable console output')
    .option('--debug', 'Enable debug output')
    .action(async (url, name, path, opts) => {
      const task = await addTask(dir, url, name, path, opts, rc)
      if (task !== null) {
        __write_rc = true
        rc.tasks.push(task)
      }
    })

  // Config task command
  app
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
    .action(async (names, opts) => {
      const tasks = await configTasks(names, opts, rc)
    })

  // List task command
  app
    .command('list [task_names...]')
    .alias('ls')
    .description('List task stats')
    .option('--debug', 'Enable debug output')
    .action(async (names: string[], opts: Partial<ArchivistListOptions>) => {
      console.log(names, opts)
    })

  // Remove task command
  app
    .command('remove <task_names...>')
    .alias('rm')
    .description('remove tasks')
    .option('-c, --clean', 'Remove all downloaded files')
    .option('-q, --quiet', 'disable console output')
    .option('--debug', 'Enable debug output')
    .action(async (names, opts) => {
      const removedTasks = await removeTasks(names, opts, rc)

      // Remove tasks from main rc
      if (removeTasks.length > 1) {
        __write_rc = true
        removedTasks.forEach((n) => {
          const i = rc?.tasks.findIndex((v) => v.name === n)
          if (i > -1) rc.tasks.splice(i, 1)
        })
      }
    })

  // Run task command
  app
    .command('run [task_name]')
    .description('run tasks')
    .option('-q, --quiet', 'disable console output')
    .option('--debug', 'Enable debug output')
    .action(async (names, opts) => {
      console.log(names, opts)
    })

  // Handle process events
  process
    .on('exit', (code) => handleProcessEvent({ type: 'exit', code }))
    .on('unhandledRejection', (error: Error, promise) =>
      handleProcessEvent({ type: 'error', error }),
    )

  // Parse arguments
  await app.parseAsync(process.argv)
})()
