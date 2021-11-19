export type ArchivistOptions =
  | ArchivistAddOptions
  | ArchivistConfigOptions
  | ArchivistListOptions
  | ArchivistRemoveOptions
  | ArchivistRunOptions

export interface ArchivistAddOptions {
  quiet: boolean
  debug: boolean
  interval: string
  accept: string
  reject: string
  exclude: string
  level: string
}

export interface ArchivistConfigOptions {
  quiet: boolean
  debug: boolean
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

export interface ArchivistRemoveOptions {
  clean: boolean
  quiet: boolean
  debug: boolean
}

export interface ArchivistRunOptions {
  quiet: boolean
  debug: boolean
}
