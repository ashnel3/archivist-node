import fs, { access, constants } from 'fs'

/**
 * Check if a file exists
 * @param path
 * @returns
 */
const existsSync = (path: string): boolean => {
  return fs.existsSync(path)
}

/**
 * Check if a file exists
 * @param path
 * @returns
 */
export const exists = async (path: string): Promise<boolean> => {
  return await new Promise((resolve, reject) => {
    access(path, constants.F_OK, (error) => {
      if (error !== null) {
        resolve(false)
      }
      resolve(true)
    })
  })
}
exists.existsSync = existsSync
