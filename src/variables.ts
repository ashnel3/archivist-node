import { ArchivistRC, ArchivistTaskRC } from './types'

/** Default configuration */
export const DEFAULT_RC: Partial<ArchivistRC> = {
  hooks: true,
  tasks: [],
}

/** Default task configuration */
export const DEFAULT_TASK_RC: Partial<ArchivistTaskRC> = {
  enabled: true,
  interval: 24,
  run_count: 0,
  level: 5,
}

/** Archivist version */
export const VERSION = '0.1.0'
