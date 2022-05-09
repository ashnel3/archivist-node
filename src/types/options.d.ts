export type ArchivistOptions =
  | ArchivistAddOptions
  | ArchivistConfigOptions
  | ArchivistListOptions
  | ArchivistRemoveOptions
  | ArchivistRunOptions

export interface ArchivistBaseOptions {
  quiet: boolean
  debug: boolean
}

export interface ArchivistAddOptions extends ArchivistBaseOptions {
  interval: string
  accept: string
  reject: string
  exclude: string
  level: string
}

export interface ArchivistConfigOptions extends ArchivistBaseOptions {
  interval: string
  accept: string
  reject: string
  exclude: string
  level: string
  enable: boolean
  disable: boolean
}

export interface ArchivistListOptions {
  debug: boolean
}

export interface ArchivistRemoveOptions extends ArchivistBaseOptions {
  clean: boolean
}

export interface ArchivistRunOptions extends ArchivistBaseOptions {}
