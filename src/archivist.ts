/* eslint-disable @typescript-eslint/no-var-requires */

import { join } from 'path'
import { Command } from 'commander'
import { addTask, configTask, removeTask } from './commands'
import { readRC, writeRC, writeRCSync } from './utils'
import { DEFAULT_RC, DEFAULT_TASK_RC } from './variables'
import { ArchivistListOptions, ArchivistRC } from './types'

/** Commander app */
const app = new Command('archivist')
const version = '0.1.0'

// Main
void (async () => {
  const { HOME } = process.env

  if (typeof HOME === 'undefined') {
    throw new Error('Home environment variable is not set, failed to read configuration!')
  }

  /** Archivist home directory */
  const dir = join(HOME, '.archivist')

  /** .archivistrc.json path */
  const path = join(dir, '.archivistrc.json')

  /** Configuration */
  let [doWriteRC, rc] = await readRC<ArchivistRC>(path, DEFAULT_RC)

  /**
   * Handle process events
   * @param event
   */
  const handleProcessEvent = (event: { type: 'exit'; code: number } | { type: 'error'; error: Error }): void => {
    switch (event.type) {
      case 'error': {
        throw event.error
      }
      case 'exit': {
        if (doWriteRC && event.code === 0) {
          writeRCSync(path, rc)
        }
      }
    }
  }

  // App Meta-data
  app
    .addHelpText(
      'beforeAll',
      () => require('cfonts').render('archivist +', { font: 'simple', gradient: ['red', 'blue'] }).string,
    )
    .description(`Archivist v${version} - download websites, ftp directories, executables & keep them updated.`)
    .version(version, '--version')

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
        doWriteRC = true
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
    .action(async (names, opts) => await configTask(names, opts, rc))

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
    .action(async (names, opts) => await removeTask(dir, names, opts, rc))

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
    .on('unhandledRejection', (error: Error, promise) => handleProcessEvent({ type: 'error', error }))

  // Parse arguments
  await app.parseAsync(process.argv)
})()
