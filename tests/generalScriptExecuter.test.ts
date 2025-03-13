import path from 'path'
import { generalScriptExecuter } from '../src/index'

const scriptDirectory = path.join(
  __dirname,
  'fixtures',
  'generalScriptExecuter'
)
const validNames = ['myAScript', 'myBScript']

test('Invalid Script name', () => {
  const status = generalScriptExecuter({
    scriptDirectory,
    validNames,
    name: 'myCScript'
  })

  expect(status.stderr).toEqual("The script name 'myCScript' is unknown.")
})

test('Invalid scriptDirectory', () => {
  const status = generalScriptExecuter({
    scriptDirectory: 'gumbo/scripts',
    validNames,
    name: 'myAScript'
  })

  expect(status.stderr).toEqual(
    "Cannot find module 'gumbo/scripts/myAScript' from 'src/generalScriptExecuter.ts'"
  )
})

test('Valid Script name', () => {
  const status = generalScriptExecuter({
    scriptDirectory,
    validNames,
    name: 'myAScript'
  })

  expect(status.status).toEqual(0)
})
