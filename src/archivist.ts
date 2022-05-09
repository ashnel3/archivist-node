/* eslint-disable @typescript-eslint/no-var-requires */

import { join } from 'path'
import { Command } from 'commander'
import {
  addTask,
  addTaskCommand,
  configTasks,
  configTasksCommand,
  listTasks,
  listTasksCommand,
  removeTasks,
  removeTasksCommand,
  runTasks,
  runTasksCommand,
} from './commands'
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

  // Add app commands
  addTaskCommand(app).action(async (url, name, path, opts) => {
    const task = await addTask(dir, url, name, path, opts, rc)
    if (task !== null) {
      __write_rc = true
      rc.tasks.push(task)
    }
  })

  configTasksCommand(app).action(async (names, opts) => {
    const tasks = await configTasks(names, opts, rc)
  })

  listTasksCommand(app).action(async (names: string[], opts: Partial<ArchivistListOptions>) => {
    console.log(names, opts)
  })

  removeTasksCommand(app).action(async (names, opts) => {
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

  runTasksCommand(app).action(async (names, opts) => {
    await runTasks(names ?? [], opts, rc)
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
