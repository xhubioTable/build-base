import fs from 'node:fs/promises'
import path from 'node:path'
import type { typeFileHandling } from './interface/interfaceFileDefinition'

/**
 * Interface for the 'copyFile' function
 * @param templateFolder - The path to the folder containing all the template files
 * @param files - A list of file names to be copied
 * @param force - if true, then existing files will be overwritten
 */
export interface InterfaceCopyFiles {
  /** Path to the template folder */
  templateFolder: string

  /** Path to the target folder */
  targetFolder: string

  /** The list of files to be copied */
  files: typeFileHandling[]

  /** if force=true then existing files will be overwritten */
  force: boolean
}

/**
 * Copies the files from the templates folder in to the newly created modules root dir
 * @returns Promise<void>
 */
export async function copyFiles(params: InterfaceCopyFiles): Promise<void> {
  const { templateFolder, targetFolder, files, force } = params

  for (const file of files) {
    let src = file
    let dest = file
    if (typeof file === 'object') {
      src = file.src
      dest = file.dest
    }

    dest = path.join(targetFolder, dest as string)
    src = path.join(templateFolder, src as string)

    if (force) {
      // eslint-disable-next-line no-console
      console.log(
        `Copy file '${JSON.stringify(src, null, 2)}' to '${JSON.stringify(
          dest,
          null,
          2
        )}'`
      )
      await copyFileHelper({
        src,
        dest
      })
    } else {
      try {
        await fs.access(dest, fs.constants.F_OK)
        // If the file already exists, nothing needs to be done

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        // The file doesn't exist anymore, so we create it

        // eslint-disable-next-line no-console
        console.log(
          `Copy file '${JSON.stringify(src, null, 2)}' to '${JSON.stringify(
            dest,
            null,
            2
          )}'`
        )
        await copyFileHelper({
          src,
          dest
        })
      }
    }
  }
}

/**
 * Interface for the 'copyFile' function
 */
interface InterfaceCopyFileHelper {
  // The name of the source file
  src: string
  // The name of the destination file
  dest: string
}

/**
 * Der eigentliche Kopiervorgang
 * @param params - The params for this function
 * @returns Promise<void>
 */
export async function copyFileHelper(
  params: InterfaceCopyFileHelper
): Promise<void> {
  const { src, dest } = params

  const dir = path.dirname(dest)
  if (dir !== '.') {
    await fs.mkdir(dir, { recursive: true })
  }

  await fs.copyFile(src, dest)
}
