import { join } from 'path'
import { addTask, configTasks, removeTasks, runTasks } from '../commands'
import { exists, readRC } from '../utils'
import { DEFAULT_RC, DEFAULT_TASK_RC } from '../variables'
import { ArchivistRC, ArchivistTaskRC } from '../types'

export interface TestingTasks {
  [key: string]: {
    name: string
    path: string
    task_rc?: Partial<ArchivistTaskRC>
  }
}

const cwd = process.cwd()
const dir = join(cwd, 'test/.tmp')
const rc = DEFAULT_RC
const url = 'https://example.com'

const tasks: TestingTasks = {
  ex: {
    name: 'ex',
    path: join(dir, 'ex').toString(),
    task_rc: {
      ...DEFAULT_TASK_RC,
      name: 'ex',
      url,
    },
  },
  config: {
    name: 'config',
    path: join(dir, 'config'),
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
    const { name, path } = tasks.ex
    await addTask(dir, url, name, path, {}, rc)
    await expect(exists(path)).resolves.toBe(true)
  })

  test('Should create a configured task', async () => {
    const { name, path, task_rc } = tasks.config
    await addTask(dir, url, name, path, { accept: 'html,css', interval: '50' }, rc)

    // Check written config
    await expect(
      readRC<Partial<ArchivistTaskRC>>(join(path, '.taskrc.json'), null),
    ).resolves.toStrictEqual({
      rc: {
        ...task_rc,
        accept: ['html', 'css'],
        interval: 50,
      },
      write: false,
    })
  })

  test('Should fail if path is a file', async () => {
    await expect(addTask(dir, url, 'bad-path', join(dir, 'bad-path.zip'), {}, rc)).resolves.toBe(
      null,
    )
  })

  test('Should fail if url is invalid', async () => {
    await expect(addTask(dir, 'htt://goog.', 'test-goog', undefined, {}, rc)).resolves.toBe(null)
    await expect(console.error).toHaveBeenCalled()
  })

  test('Should fail if task exists', async () => {
    await expect(addTask(dir, url, tasks.ex.name, tasks.ex.path, {}, rc)).resolves.toBe(null)
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
    const { path, task_rc } = tasks.ex
    await expect(configTasks(['ex'], { disable: true }, rc)).resolves.toStrictEqual(['ex'])
    await expect(
      readRC<Partial<ArchivistTaskRC>>(join(path, '.taskrc.json'), null),
    ).resolves.toStrictEqual({
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
