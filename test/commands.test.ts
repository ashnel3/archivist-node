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
    task_rc: {
      ...DEFAULT_TASK_RC,
      name: 'ex1',
      url,
    },
  },
  ex2: {
    name: 'ex2',
    path: join(dir, 'ex2/ex2rc.json'),
  },
  config: {
    name: 'config',
    path: join(dir, 'config/configrc.json'),
    task_rc: {
      ...DEFAULT_TASK_RC,
      name: 'config',
      url,
    },
  },
  'non-existent': {
    name: 'non-existent',
    path: '',
  },
}

// Add command
describe('archivist add', () => {
  beforeEach(() => {
    console.log = jest.fn()
    console.error = jest.fn()
  })

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
    const { name, path, task_rc } = tasks.config

    await addTask(dir, url, name, path, { accept: 'html,css', interval: '50' }, rc)

    // Check written config
    await expect(readRC<Partial<ArchivistTaskRC>>(path, null)).resolves.toStrictEqual({
      rc: {
        ...task_rc,
        accept: ['html', 'css'],
        interval: 50,
      },
      write: false,
    })
  })

  test.skip('Should fail if path is a file', () => {})

  test('Should fail if url is invalid', async () => {
    await expect(addTask(dir, 'htt://goog.', 'test-goog', undefined, {}, rc)).resolves.toBe(null)
    await expect(console.error).toHaveBeenCalled()
  })

  test('Should fail if task exists', async () => {
    await expect(addTask(dir, url, tasks.ex1.name, tasks.ex1.path, {}, rc)).resolves.toBe(null)
    await expect(console.error).toHaveBeenCalled()
  })
})

// Config command
describe('archivist config', () => {
  beforeEach(() => {
    console.log = jest.fn()
    console.error = jest.fn()
  })

  test('should configure tasks', async () => {
    const { path, task_rc } = tasks.ex1
    await configTasks(['config'], { disable: true }, rc)
    await expect(readRC<Partial<ArchivistTaskRC>>(path, null)).resolves.toStrictEqual({
      rc: {
        ...task_rc,
        enabled: false,
      },
      write: false,
    })
  })

  test('should fail when no options are specified', async () => {
    const tasks = await configTasks(['config'], {}, rc)

    await expect(tasks).toStrictEqual([])
    await expect(console.error).toHaveBeenCalled()
  })

  test("should error when task doesn't exist in rc", async () => {
    await expect(configTasks(['config', 'non-existent'], { level: '2' }, rc)).rejects.toThrow()
  })
})
