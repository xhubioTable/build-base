import { xhubioReplaceImageLinksRun } from './xhubioReplaceImageLinksScript'

xhubioReplaceImageLinksRun('docApi/README.md', 'README.md')
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Replace image links in README.md')
  })
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.log(e)
  })
