/**
 * Checks that the copying of the files works. Also the overwriting or
 * create new directories
 */
import fs from 'fs'
import path from 'path'
import util from 'util'
import { copyFiles } from '../src/copyFiles'
import { InterfaceCopyFiles } from '../src/copyFiles'

const readFile = util.promisify(fs.readFile)
const fsAccess = util.promisify(fs.access)

const TEMPLATE_FOLDER = path.join(
  __dirname,
  'fixtures',
  'copyFiles',
  'templates'
)

const FIXTURES = path.join(__dirname, 'fixtures', 'copyFiles')
const VOLATILE = path.join(__dirname, 'volatile', 'copyFiles')
const VOLATILE_FORCE = path.join(__dirname, 'volatile', 'copyFilesForce')

// Emulate the copy of the files to an existing struture
const INITIAL = path.join(FIXTURES, 'forVolatile')

beforeAll(async () => {
  await fs.promises.rm(VOLATILE, { recursive: true, force: true })
  await fs.promises.mkdir(VOLATILE, { recursive: true })

  await fs.promises.rm(VOLATILE_FORCE, { recursive: true, force: true })
  await fs.promises.mkdir(VOLATILE_FORCE, { recursive: true })

  // Copy the data from fixtures to the Volatile directory
  await fs.promises.cp(INITIAL, VOLATILE, { recursive: true, force: true })
  await fs.promises.cp(INITIAL, VOLATILE_FORCE, {
    recursive: true,
    force: true
  })
})

/*
 * Checks that copying the zip file from the included folder works.
 * Existing files should NOT be overwritten
 */
const fileName = '.gumboStay.txt'
test('copyFiles force=false', async () => {
  const params: InterfaceCopyFiles = {
    templateFolder: TEMPLATE_FOLDER,
    targetFolder: VOLATILE,
    files: [
      fileName,
      {
        src: path.join('_src', 'script.js'),
        dest: path.join('src', 'script.js')
      }
    ],
    force: false
  }

  await copyFiles(params)

  // jetzt prüfen das die entsprechenden Dateien existieren
  await expect(fsAccess(path.join(VOLATILE, fileName))).resolves.toBeUndefined()
  await expect(
    fsAccess(path.join(VOLATILE, 'src', 'script.js'))
  ).resolves.toBeUndefined()

  // prüfen das der Inhalt der '.gumboStay.txt' nicht überschrieben wurde
  const data = await readFile(path.join(VOLATILE, fileName), 'utf8')
  expect(data).toEqual('Diese Datei soll beibehalten werden.\n')
})

/*
 * Checks that copying the zip file from the included folder works.
 * Existing files should be overwritten
 */
test('copyFiles force=true', async () => {
  const params = {
    templateFolder: TEMPLATE_FOLDER,
    targetFolder: VOLATILE_FORCE,
    files: [
      '.gumboForce.txt',
      {
        src: path.join('_src', 'script.js'),
        dest: path.join('src', 'script.js')
      }
    ],
    force: true
  }

  await copyFiles(params)

  // jetzt prüfen das die entsprechenden Dateien existieren
  await expect(
    fsAccess(path.join(VOLATILE_FORCE, fileName))
  ).resolves.toBeUndefined()
  await expect(
    fsAccess(path.join(VOLATILE_FORCE, 'src', 'script.js'))
  ).resolves.toBeUndefined()

  // prüfen das der Inhalt der '.gumboStay.txt' nicht überschrieben wurde
  const data = await readFile(path.join(VOLATILE_FORCE, fileName), 'utf8')
  expect(data).toEqual('Diese Datei soll beibehalten werden.\n')

  // prüfen das der Inhalt der '.gumboStay.txt' nicht überschrieben wurde
  const dataForce = await readFile(
    path.join(VOLATILE_FORCE, '.gumboForce.txt'),
    'utf8'
  )
  expect(dataForce).toEqual('Diese Datei soll überschrieben werden.\n')
})
