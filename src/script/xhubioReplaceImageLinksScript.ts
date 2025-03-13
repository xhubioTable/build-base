import fs from 'fs'
import util from 'util'

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

/**
 * This function replaces the image links in the gerenated markdown
 * in the root folder.
 * @param sourceFile - The Readme file in the docApi folder 'docApi/README.md'
 * @param targetFile - The Readme file in the root folder 'README.md'
 */
export async function xhubioReplaceImageLinksRun(
  sourceFile: string,
  targetFile: string
): Promise<void> {
  // read the file from the docApi directory
  let fileContent = await readFile(sourceFile, 'utf8')
  fileContent = fileContent.replaceAll('(images/', '(doc/images/')
  fileContent = fileContent.replaceAll('"images/', '"doc/images/')
  fileContent = fileContent.replaceAll('(modules.md)', '(docApi/modules.md)')
  fileContent = fileContent.replaceAll('(globals.md)', '(docApi/globals.md)')
  await writeFile(targetFile, fileContent)
}
