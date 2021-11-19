/** Archivist main configuration */
export interface ArchivistRC {
  debug: boolean
  quiet: boolean
  hooks: boolean
  tasks: ArchivistRCTask[]
}

/** Archivist main configuration task */
export interface ArchivistRCTask {
  name: string
  path: string
}

/** Archivist task configuration */
export interface ArchivistTaskRC {
  name: string
  enabled: boolean
  accept: string[]
  reject: string[]
  exclude: string[]
  hooks: {
    before: string
    'before-all': string
    after: string
    'before-after': string
  }
  interval: number
  level: number
  run_count: number
  run_size: number
  run_last: [boolean, Date]
  run_history: Array<[boolean, Date]>
  url: string
}
