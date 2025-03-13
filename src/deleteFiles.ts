import fs from 'node:fs/promises'
import path from 'node:path'

/**
 * Deletes a list of given files. The files are relative to the given targetDir
 * @param targetDir - The directory where the files are located
 * @param files - an array of files which should be deleted
 * @returns Promise<void>
 */
export async function deleteFiles(
  targetDir: string,
  files: string[]
): Promise<void> {
  for (const file of files) {
    if (!path.isAbsolute(file) || !path.isAbsolute(targetDir)) {
      // Because of security reasons absolute pathes are ignored
      try {
        const filePath = path.join(targetDir, file)
        await fs.unlink(filePath)
        // eslint-disable-next-line no-console
        console.log(`Deleted the file: '${filePath}'`)
      } catch (e) {
        // When it tries to remove a non existing file, no error should be thrown
        if (
          !(e as Error).message.startsWith('ENOENT: no such file or directory')
        ) {
          throw e
        }
      }
    } else {
      // eslint-disable-next-line no-console
      console.log(
        `Absolute paths could not be deleted: '${targetDir} or ${file}'`
      )
    }
  }
}
