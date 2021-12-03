import { join, parse } from 'path'
import { command, createLogger, exists, writeRC } from '../utils'
import { DEFAULT_TASK_RC } from '../variables'
import { ArchivistAddOptions, ArchivistRC, ArchivistTaskRC } from '../types'

// FIXME: path should be a folder

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
  name =
    typeof name === 'undefined'
      ? new URL(url).hostname.replace(/[/\\?@&$!:|#]/, '').replace(/\..+/g, '')
      : name
  const rcPath =
    typeof path === 'undefined'
      ? join(dir, 'tasks', name, '.taskrc.json')
      : join(path, '.taskrc.json')
  const logger = createLogger(opts?.debug ?? rc?.debug, opts?.quiet ?? rc?.quiet)

  // Check if url is valid
  if (
    !/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.test(
      url,
    )
  ) {
    logger('error', `url: ${url} is invalid!`)
    return null
  }

  // Check if path is a directory
  if (typeof path !== 'undefined' && parse(path).ext !== '') {
    logger('error', `task path must be a directory! - ${path}`)
    return null
  }

  // Check if task exists
  if (await exists(rcPath)) {
    logger('error', `found task - ${name}`)
    return null
  }

  // Write task
  logger('info', `adding task - ${name}`)
  await writeRC<Partial<ArchivistTaskRC>>(rcPath, {
    ...DEFAULT_TASK_RC,
    ...command.parseTaskOptions(opts, logger),
    name,
    url,
  })

  return { name, path: rcPath }
}
