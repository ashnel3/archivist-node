import { readRC } from './utils'
import { Logger } from './utils/logger'
import { ArchivistRC, ArchivistTaskRC } from './types'

// TODO: Task runner

export const taskRunner = async (tasks: ArchivistRC['tasks'], logger: Logger): Promise<void> => {
  const taskResults = await Promise.all(
    tasks.map(async ({ name, path }, i) => {
      const { rc } = await readRC<Partial<ArchivistTaskRC>>(path, null)

      if (rc === null) {
        throw new Error()
      }
      if (rc?.enabled === true) {
        return { i, name }
      }

      return { i, name }
    }),
  )
}
