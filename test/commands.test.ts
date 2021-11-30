/* eslint-disable @typescript-eslint/no-floating-promises */

import { join } from 'path'
import { addTask, configTasks, removeTasks, runTasks } from '../src/commands'
import { exists, readRC } from '../src/utils'
import { DEFAULT_RC, DEFAULT_TASK_RC } from '../src/variables'
import { ArchivistRC, ArchivistTaskRC } from '../src/types'

if (typeof process.env.HOME === 'undefined') {
  throw new Error('Home environment variable is not set, failed to read configuration!')
}

const cwd = process.cwd()
const dir = join(cwd, 'test/.tmp')
const rc = DEFAULT_RC

/** Testing url */
const url = 'https://example.com'

/** Testing tasks */
const tasks = {
  ex1: {
    name: 'ex1',
    path: join(dir, 'ex1/ex1rc.json'),
  },
  ex2: {
    name: 'ex2',
    path: join(dir, 'ex2/ex2rc.json'),
  },
  config: {
    name: 'config',
    path: join(dir, 'config/configrc.json'),
  },
}

// Add command
describe('archivist add', () => {
  afterAll(() => {
    rc.tasks?.push(...Object.values(tasks))
  })

  test('Should create tasks', async () => {
    const res = await Promise.all(
      [tasks.ex1, tasks.ex2].map(async (t) => await addTask(dir, url, t.name, t.path, {}, rc)),
    )

    await expect(
      Promise.all(
        res.map(async (t) => {
          return typeof t?.path === 'string' ? await exists(t.path) : false
        }),
      ),
    ).resolves.toEqual(expect.not.arrayContaining([false]))
  })

  test('Should create a configured task', async () => {
    const { name, path } = tasks.config

    await addTask(dir, url, name, path, { interval: '50', level: '2' }, rc)

    // Check written config
    await expect(readRC<Partial<ArchivistTaskRC>>(path, null)).resolves.toStrictEqual({
      rc: {
        ...DEFAULT_TASK_RC,
        interval: 50,
        level: 2,
        name,
        url: url,
      },
      write: false,
    })
  })

  test.skip('Should fail if path is a file', () => {})

  test('Should fail if url is invalid', async () => {
    await expect(addTask(dir, 'htt://goog.', 'test-goog', undefined, {}, rc)).resolves.toBe(null)
  })

  test('Should fail if task exists', async () => {
    await expect(addTask(dir, url, tasks.ex1.name, tasks.ex1.path, {}, rc)).resolves.toBe(null)
  })
})
