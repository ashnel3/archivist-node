import { join } from 'path'
import { exists, readRC, remove, writeRC } from './utils'
import { createLogger, Logger } from './utils/logger'
import { DEFAULT_TASK_RC } from './variables'
import {
  ArchivistAddOptions,
  ArchivistConfigOptions,
  ArchivistOptions,
  ArchivistRC,
  ArchivistRemoveOptions,
  ArchivistTaskRC,
} from './types'

// TODO: list command

/**
 * Find tasks by name
 * @param names  - Array of task names
 * @param logger - Logger
 * @returns
 */
const getTasks = (names: string[], rc: Partial<ArchivistRC>, logger: Logger): ArchivistRC['tasks'] => {
  return names.reduce((acc: ArchivistRC['tasks'], n) => {
    const t = rc?.tasks?.find((t) => t.name === n)
    if (typeof t === 'undefined') {
      logger('error', `failed to find task - ${n}`)
      return acc
    }
    return [...acc, t]
  }, [])
}

/**
 * Extract task rc from command-line options
 * @param opts   - Command-line options
 * @param logger - Logger
 * @returns
 */
const parseTaskOptions = (opts: Partial<ArchivistOptions>, logger: Logger): Partial<ArchivistTaskRC> => {
  return Object.entries(opts).reduce((acc: Partial<ArchivistTaskRC>, [key, value]) => {
    switch (true) {
      case key === 'enable' || key === 'disable':
        return { ...acc, enabled: key === 'enable' }
      case key === 'accept' || key === 'reject' || key === 'exclude':
        return {
          ...acc,
          [key]: (value as string).split(',').filter((v) => v !== ''),
        }
      case key === 'interval' || key === 'level': {
        const int = parseInt(value as string, 10)
        if (isNaN(int)) {
          logger('error', `failed to parse integer: ${value as string}`)
          return acc
        }
        return { ...acc, [key]: int }
      }
      default:
        return acc
    }
  }, {})
}

/**
 * Add scheduled task
 * @param dir  - Archivist home directory
 * @param url  - Site url
 * @param name - Task name
 * @param path - Task location
 * @param opts - Command-line opts
 * @param rc   - Archivist rc
 * @returns    - Added task
 */
export const addTask = async (
  dir: string,
  url: string,
  name: string | undefined,
  path: string | undefined,
  opts: Partial<ArchivistAddOptions>,
  rc: Partial<ArchivistRC>,
): Promise<{ name: string; path: string } | null> => {
  const logger = createLogger(opts?.debug ?? rc?.debug, opts?.quiet ?? rc?.quiet)
  name = typeof name === 'undefined' ? new URL(url).hostname.replace(/[/\\?@&$!:|#]/, '').replace(/\..+/g, '') : name
  path = typeof path === 'undefined' ? join(dir, 'tasks', `.${name}rc.json`) : path

  // Check if url is valid
  if (
    !/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.test(url)
  ) {
    logger('error', `url: ${url} is invalid!`)
    return null
  }

  // Check if task exists
  if (await exists(path)) {
    logger('info', `found task - ${name}`)
    return null
  }

  // Write task
  logger('info', `adding task - ${name}`)
  await writeRC<Partial<ArchivistTaskRC>>(path, {
    ...DEFAULT_TASK_RC,
    ...parseTaskOptions(opts, logger),
    name,
    url,
  })

  return { name, path }
}

/**
 * Configure tasks
 * @param names - Task names
 * @param opts  - Command-line opts
 * @param rc    - Archivist rc
 */
export const configTasks = async (
  names: string[],
  opts: Partial<ArchivistConfigOptions>,
  rc: Partial<ArchivistRC>,
): Promise<void> => {
  const logger = createLogger(opts?.debug ?? rc?.debug, opts?.quiet ?? rc?.quiet)
  const optsRC = parseTaskOptions(opts, logger)
  const tasks = getTasks(names, rc, logger)

  if (Object.keys(optsRC).length > 0) {
    await Promise.all(
      tasks.map(async ({ name, path }) => {
        const { rc } = await readRC<Partial<ArchivistTaskRC>>(path, null)

        if (rc === null) {
          logger('error', `failed to find taskrc - ${path}`)
          return
        }

        logger('info', `configured - ${name}`)
        await writeRC<Partial<ArchivistTaskRC>>(path, {
          ...rc,
          ...optsRC,
        })
      }),
    )
  } else {
    logger('error', 'Config options must be specified!')
  }
}

/**
 * Remove tasks
 * @param dir   - Release directory
 * @param names - Task names
 * @param opts  - Command-line opts
 * @param rc    - Archivist rc
 */
export const removeTasks = async (
  dir: string,
  names: string[],
  opts: Partial<ArchivistRemoveOptions>,
  rc: Partial<ArchivistRC>,
): Promise<void> => {
  const logger = createLogger(opts?.debug ?? rc?.debug, opts?.quiet ?? rc?.quiet)
  const tasks = getTasks(names, rc, logger)
  await Promise.all(
    tasks.map(async ({ name, path }) => {
      logger('info', `removing task - ${name}`)
      await remove([path, ...(opts?.clean === true ? [join(dir, name)] : [])])
    }),
  )
}
