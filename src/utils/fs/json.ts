import { readFile, readFileSync, writeFile, writeFileSync } from 'fs'
import { Logger } from '../logger'

/**
 * Write json
 * @param logger
 * @param path
 * @param data
 */
const writeJSONSync = (path: string, data: string): void => {
  writeFileSync(path, data)
}

/**
 * Write json
 * @param path
 * @param data
 * @returns
 */
export const writeJSON = async (path: string, data: string): Promise<void> => {
  return await new Promise((resolve, reject) => {
    writeFile(path, data, (error) => {
      if (error !== null) {
        reject(error)
      }
      resolve()
    })
  })
}
writeJSON.sync = writeJSONSync

/**
 * Read & parse json
 * @param path
 * @param def
 * @returns
 */
const readJSONSync = <T = any>(path: string, def: any = {}): T | undefined => {
  const data = readFileSync(path).toString()
  if (typeof data !== 'string') {
    throw new TypeError(`type: ${typeof data} is not parsable!`)
  }
  return JSON.parse(data)
}

/**
 * Read & parse json
 * @param logger
 * @param path
 * @param def
 * @returns
 */
export const readJSON = async <T = any>(path: string, encoding: BufferEncoding = 'utf-8'): Promise<T> => {
  return await new Promise((resolve, reject) => {
    readFile(path, encoding, (error, data) => {
      if (error !== null) {
        reject(error)
      }
      if (typeof data !== 'string') {
        reject(new TypeError(`type: ${typeof data} is not parsable!`))
      } else {
        resolve(JSON.parse(data))
      }
    })
  })
}
readJSON.sync = readJSONSync
