import { join } from 'path'
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
  const logger = createLogger(opts?.debug ?? rc?.debug, opts?.quiet ?? rc?.quiet)
  name =
    typeof name === 'undefined'
      ? new URL(url).hostname.replace(/[/\\?@&$!:|#]/, '').replace(/\..+/g, '')
      : name
  path = typeof path === 'undefined' ? join(dir, 'tasks', name, `.${name}rc.json`) : path

  // Check if url is valid
  if (
    !/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.test(
      url,
    )
  ) {
    logger('error', `url: ${url} is invalid!`)
    return null
  }

  // Check if task exists
  if (await exists(path)) {
    logger('error', `found task - ${name}`)
    return null
  }

  // Write task
  logger('info', `adding task - ${name}`)
  await writeRC<Partial<ArchivistTaskRC>>(path, {
    ...DEFAULT_TASK_RC,
    ...command.parseTaskOptions(opts, logger),
    name,
    url,
  })

  return { name, path }
}
