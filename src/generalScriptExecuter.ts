import childProcess from 'node:child_process'
import path from 'node:path'

/**
 * @param scriptDirectory - The directory in wich the scripts are located
 * @param validNames - An array with all the valid script names
 * @param name - The name of the script to be executed
 * @param args - Additional parameter for the script
 */
export interface InterfaceGeneralScriptExecuter {
  scriptDirectory: string
  validNames: string[]
  name?: string
  args?: string
}

/**
 * @param status - The return status
 * @param stderr - The text from the StandarError stream
 * @param signal - The signal 'SIGTERM' if there was one
 */
export interface InterfaceGeneralScriptExecuterResult {
  status: number
  stderr?: string
  signal?: string
}

/**
 *
 * @param params - The parameter for this function
 * @returns result - The result of the script execution
 */
export function generalScriptExecuter(
  params: InterfaceGeneralScriptExecuter
): InterfaceGeneralScriptExecuterResult {
  const { scriptDirectory, validNames, name, args = '' } = params
  let result: InterfaceGeneralScriptExecuterResult = { status: -1 }

  const nameSet = new Set(validNames)
  if (name === undefined) {
    result = { status: 1, stderr: 'The script name was not given' }
  } else if (!nameSet.has(name)) {
    result = { status: 1, stderr: `The script name '${name}' is unknown.` }
  } else {
    // Run the given script
    // Path for the Script is required for the call
    const scriptPath = path.join(scriptDirectory, name)

    try {
      result = childProcess.spawnSync(
        'node',
        [require.resolve(scriptPath)].concat(args),
        {
          stdio: 'inherit'
        }
      ) as unknown as InterfaceGeneralScriptExecuterResult
      if (result.signal) {
        if (result.signal === 'SIGKILL') {
          result.stderr =
            'The build failed because the process exited too early. ' +
            'This probably means the system ran out of memory or someone called ' +
            '`kill -9` on the process.'
        } else if (result.signal === 'SIGTERM') {
          result.stderr =
            'The build failed because the process exited too early. ' +
            'Someone might have called `kill` or `killall`, or the system could ' +
            'be shutting down.'
        }
      }
    } catch (e) {
      result.stderr = (e as Error).message
      result.status = 1
    }
  }
  return result
}
