import { dirname } from 'path'
import mkdirp from 'mkdirp'
import rimraf from 'rimraf'
import { writeJSON, readJSON } from './json'

/**
 * Read & parse configuration
 * @param path
 * @param defaultRC
 * @returns
 */
export const readRC = async <T = any>(path: string, def: any): Promise<[boolean, T]> => {
  try {
    return [false, await readJSON<T>(path)]
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      // Archivist directory doesn't exist
      return [true, def]
    }
    // Dont overwrite on failure
    console.log((error as Error).message)
    return [false, def]
  }
}

/** Remove files */
export const remove = async (paths: string[]): Promise<void> => {
  const r = async (p: string): Promise<void> =>
    await new Promise((resolve, reject) => {
      rimraf(p, (error) => {
        if (typeof error !== 'undefined' && error !== null) {
          reject(error)
        }
        resolve()
      })
    })
  for (const p of paths) {
    await r(p)
  }
}

/**
 * Write configuration
 * @param path
 * @param rc
 */
export const writeRCSync = (path: string, data: any): void => {
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
