import { dirname } from 'path'
import mkdirp from 'mkdirp'
import rimraf from 'rimraf'
import { writeJSON, readJSON } from './json'
import { readFileSync } from 'fs'

/**
 * Read & parse configuration
 * @param path
 * @param defaultRC
 * @returns
 */
const readRCSync = <T>(path: string, def: any): { write: boolean; rc: T } => {
  try {
    const data = readFileSync(path).toString()
    if (typeof data === 'string') {
      return { write: false, rc: JSON.parse(data) }
    } else {
      console.log(new Error(`failed to parse configuration: ${path}`))
      return { write: false, rc: def }
    }
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      return { write: true, rc: def }
    }
    return { write: false, rc: def }
  }
}

/**
 * Read & parse configuration
 * @param path
 * @param defaultRC
 * @returns
 */
export const readRC = async <T = any>(
  path: string,
  def: any,
): Promise<{ write: boolean; rc: T }> => {
  // TODO: Type fs error
  try {
    return { write: false, rc: await readJSON<T>(path) }
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      // Archivist directory doesn't exist
      return { write: true, rc: def }
    }
    // Dont overwrite on failure
    console.log((error as Error).message)
    return { write: false, rc: def }
  }
}
readRC.sync = readRCSync

/** Remove files
 * @param paths - Path globs
 * @param opts  - Rimraf options
 */
export const remove = async (paths: string[], opts: rimraf.Options = {}): Promise<void> => {
  const rimrafAsync = async (p: string): Promise<void> => {
    return await new Promise((resolve, reject) => {
      rimraf(p, opts, (error) => {
        if (typeof error !== 'undefined' && error !== null) {
          reject(error)
        }
        resolve()
      })
    })
  }
  // TODO: delet this
  for (const p of paths) {
    await rimrafAsync(p)
  }
}

/**
 * Write configuration
 * @param path
 * @param rc
 */
const writeRCSync = (path: string, data: any): void => {
  try {
    mkdirp.sync(dirname(path))
    writeJSON.sync(path, JSON.stringify(data, null, 4))
  } catch (error) {
    console.log((error as Error).message)
  }
}

/**
 * Write configuration
 * @param path
 * @param rc
 */
export const writeRC = async <T = any>(path: string, data: T): Promise<void> => {
  try {
    await mkdirp(dirname(path))
    await writeJSON(path, JSON.stringify(data, null, 4))
  } catch (error) {
    console.log((error as Error).message)
  }
}
writeRC.sync = writeRCSync
