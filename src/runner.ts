import assert from 'assert'
import { execa } from 'execa'
import { dirname } from 'path'
import { readRC } from './utils'
import { Logger } from './utils/logger'
import { ArchivistRC, ArchivistTaskRC } from './types'
import { ArchivistRCTask } from './types/rc'

export const createRunner = (rc: Partial<ArchivistRC>, logger: Logger) => {
  return async (task: Partial<ArchivistRCTask>): Promise<void> => {
    assert(typeof task?.path !== 'undefined', 'failed to find task config, "path" is undefined!')
    const { rc : taskRC } = await readRC<Partial<ArchivistTaskRC>>(task?.path, {})
    const child = await execa('wget', [], { cwd: dirname(task.path) })
  }
}
