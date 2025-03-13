import fs from 'fs'
import path from 'path'
import { xhubioReplaceImageLinksRun } from '../../src/index'

const FIXTURES = path.join(
  __dirname,
  '..',
  'fixtures',
  'script',
  'xhubioReplaceImageLinks'
)
const VOLATILE = path.join(
  __dirname,
  '..',
  'volatile',
  'script',
  'xhubioReplaceImageLinks'
)

beforeAll(async () => {
  await fs.promises.rm(VOLATILE, { recursive: true, force: true })
  await fs.promises.mkdir(VOLATILE, { recursive: true })
})

test('xhubioCopyFiles', async () => {
  const expected = path.join(FIXTURES, 'expected', 'readme.md')
  const source = path.join(FIXTURES, 'files', 'readme.md')
  const target = path.join(VOLATILE, 'readme.md')
  await xhubioReplaceImageLinksRun(source, target)

  const expectedData = await fs.promises.readFile(expected, 'utf8')
  const actualData = await fs.promises.readFile(target, 'utf8')

  expect(actualData).toEqual(expectedData)
})
