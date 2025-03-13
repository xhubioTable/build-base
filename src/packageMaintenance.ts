import fs from 'fs'
import util from 'util'
import { enumMode } from './interface/enumMode'

const writeFile = util.promisify(fs.writeFile)
const readFile = util.promisify(fs.readFile)

/**
 *  Declares the interface for the loaded package.json data
 */
type InterfacePackageJson = Record<
  string,
  string | number | string[] | object | undefined
>

/**
 * @param packageFile - The file name of the package.json to be updated
 * @param template - The template used to update the package.json
 * @param mode - The mode to use when updating the package.json
 */
interface InterfacePackageInsertUpdateEntries {
  packageFile: string
  template: InterfacePackageJson
  mode?: enumMode
}

/**
 * This function compares the template data and the package.json
 * file of the target repo. Then it will insert or update the key-values
 * in the target json
 * @param params - The parameter for this function
 * @returns Promise<void>
 */
export async function packageInsertUpdateEntries(
  params: InterfacePackageInsertUpdateEntries
): Promise<void> {
  const { packageFile, template, mode = enumMode.default } = params
  const targetJson = await loadPackageFile(packageFile)

  // Die Properties aus dem template json setzen
  for (const propertyName of Object.keys(template)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const value = template[propertyName]!
    if (typeof value === 'string') {
      // es handelt sich um eine einfache Property
      setStringProperty({ targetJson, propertyName, value, mode })
    } else if (Array.isArray(value)) {
      // Die Property ist ein Array
      setArrayProperty({ targetJson, propertyName, value, mode })
    } else {
      // Die Property ist ein Object
      setObjectProperty({ targetJson, propertyName, value, mode })
    }
  }

  updatePackageName(targetJson)
  updateUrl(targetJson)

  await writeFile(packageFile, JSON.stringify(targetJson, null, 2))
}

/**
 * This function compares the template data and the package.json
 * file of the target repo. Then it will remove all the entries form the
 * template in the target json
 * @param params - The parameter for this function
 * @returns Promise<void>
 */
export async function packageRemoveEntries(
  params: InterfacePackageInsertUpdateEntries
): Promise<void> {
  const { packageFile, template } = params

  const targetJson = await loadPackageFile(packageFile)

  for (const propName of Object.keys(template)) {
    const valuesToDelete = template[propName] as string[]
    const values = targetJson[propName]
    if (values !== undefined) {
      if (Array.isArray(values)) {
        // Delete array values
        removeEntriesArray({ targetJson, propName, valuesToDelete })
      } else if (typeof values === 'object') {
        // es handelt sich um ein Object
        removeEntriesObject({ targetJson, propName, valuesToDelete })
      } else {
        // es handelt sich um eine einfache String Property
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete targetJson[propName]
      }
    }
  }

  await writeFile(packageFile, JSON.stringify(targetJson, null, 2))
}

/**
 * Loads the package.json file and returns the json object
 * @param packageFile - The name of the package.json to load
 *
 * @returns  data The Json objct
 */
async function loadPackageFile(
  packageFile: string
): Promise<InterfacePackageJson> {
  const targetRaw = await readFile(packageFile, 'utf8')
  return JSON.parse(targetRaw)
}
/**
 * @param targetJson - The JSON where to delete the values from
 * @param propName - The property name of the array element
 * @param valuesToDelete - A list of values to be deleted
 */
interface InterfaceRemoveEntries {
  targetJson: InterfacePackageJson
  propName: string
  valuesToDelete: string[]
}

/**
 * Deletes all the given values from an array
 * @param params - The params as defined in the interface
 * @returns void
 */
function removeEntriesArray(params: InterfaceRemoveEntries): void {
  const { targetJson, propName, valuesToDelete } = params
  const valueSet = new Set(valuesToDelete)

  // Speichert die Daten die NICHT gelöscht werden
  const newData = []

  for (const oldVal of targetJson[propName] as string[]) {
    if (!valueSet.has(oldVal)) {
      newData.push(oldVal)
    }
  }
  targetJson[propName] = newData
}

/**
 * Deletes keys from the target package.json
 * @param params -  The params as defined in the interface
 * @returns void
 */
function removeEntriesObject(params: InterfaceRemoveEntries): void {
  const { targetJson, propName, valuesToDelete } = params
  for (const keyName of valuesToDelete) {
    const tmp = targetJson[propName] as unknown as InterfacePackageJson
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete tmp[keyName]
  }
}

/**
 * @param targetJson - The target package.json object
 * @param propertyName - The name of the property to be updated
 * @param value - The value to be updated (insert,update,delete)
 * @param mode -  (default,force,clean) Refers to the 'scripts' property
 *                      default: Es werden nur fehlende Werte ergänzt
 *                      force: Für ein Array nicht relavant
 *                      clean: Alle Einträge werden gelöscht und mit den neuen ersetzt
 */
interface InterfaceSetProperty {
  targetJson: InterfacePackageJson
  propertyName: string
  value: string | number | string[] | object
  mode: enumMode
}

/**
 * Updates or overwrites a single property
 * @param params - The parameter as defined in the interface
 * @returns void
 */
function setStringProperty(params: InterfaceSetProperty): void {
  const { targetJson, propertyName, value, mode } = params
  if (
    mode === enumMode.force ||
    mode === enumMode.clean ||
    targetJson[propertyName] === undefined
  ) {
    targetJson[propertyName] = value
  }
}

/**
 * Updates or overwrites an array property
 * @param params - The parameter as defined in the interface
 * @returns void
 */
function setArrayProperty(params: InterfaceSetProperty): void {
  const { targetJson, propertyName, value, mode } = params
  if (targetJson[propertyName] === undefined || mode === enumMode.clean) {
    targetJson[propertyName] = value
  } else {
    const targetArray = targetJson[propertyName] as string[]
    // fehlende Werte hinzufügen
    for (const val of value as string[]) {
      if (!targetArray.includes(val)) {
        targetArray.push(val)
      }
    }
  }
}

/**
 * Updates or inserts an array property
 * @param params - The parameter as defined in the interface
 * @returns void
 */
function setObjectProperty(params: InterfaceSetProperty): void {
  const { targetJson, propertyName, value, mode } = params
  if (mode === enumMode.force) {
    // add the scripts
    targetJson[propertyName] = {
      ...(targetJson[propertyName] as object),
      ...(value as string[])
    }
  } else if (mode === enumMode.clean) {
    // alle Einträge löschen und nur die Standard Einträge schreiben
    targetJson[propertyName] = {
      ...(value as string[])
    }
  } else {
    // add the scriptstargetJson[propertyName]targetJson.scripts = {
    targetJson[propertyName] = {
      ...(value as string[]),
      ...(targetJson[propertyName] as object)
    }
  }

  // sort the elements
  const newObj: InterfacePackageJson = {}
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  for (const key of Object.keys(targetJson[propertyName]!).sort()) {
    newObj[key] = (targetJson[propertyName] as InterfacePackageJson)[key]
  }
  targetJson[propertyName] = newObj
}

/**
 * This function adds the '\@xhubio' prefix to the package name if it does not
 * already exists
 * @param targetJson - The package content
 */
function updatePackageName(targetJson: InterfacePackageJson) {
  if (!(targetJson.name as string).startsWith('@')) {
    targetJson.name = `@xhubio/${targetJson.name}`
  }
}

/**
 * This function converts the ssh URL to an https url if necessary
 * @param targetJson - The package content
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function updateUrl(targetJson: any) {
  if (targetJson.repository?.url !== undefined) {
    let url = targetJson.repository.url as string
    if (!url.startsWith('https://')) {
      url = url.replace('git@ssh.', 'https://')
      url = url.replace('rz.db.de:', 'rz.db.de/')
    }
    targetJson.repository.url = url
  }
}
