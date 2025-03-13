**@tlink/build-base**

***

# @xhubio/e2e-tool-build-base

The @xhubio/e2e-tool-build-base module centralizes core functionality
needed by other base modules. As the number of base modules grew, it
became essential to consolidate common code into a single module.

## Functions

This module offers a variety of functions:

### xhubioCopyFiles

This function copies static files into the build folder. To enable this
functionality, add the following property to your `package.json` file:

    {
      "copyFiles": [
        {
          "baseFolder": "src/graphql",
          "destFolder": "dest/graphql",
          "fileTypes": [".graphql", ".csv"], 
          "replace": {                        
            "regExp": "(.*)spec\\.ts(.*)",
            "replacement": "$1.js$2"
          }
        },
        {
          "baseFolder": "src/csv",
          "destFolder": "dest/csv",
          "fileTypes": [".graphql", ".csv", ".json"]
        },
        {
          "baseFolder": "src",
          "destFolder": "dest",
          "fileGlobs": ["**/*.graphql"]      
        }
      ]
    }

-   Files with the specified types in the source folder are selected.

-   Provide a `replace` object if you need to modify file names. This
    object uses `string.replaceAll(regExp, replacement)` to perform the
    replacement.

-   A glob pattern is allowed for recursive searches; the matched files
    are copied while preserving their relative paths.

To run the copy process, add the following script to your project:

    npm run xhubioCopyFiles

### xhubioReplaceImageLinks

This script processes the generated `readme.md` file located in the
`docApi` directory by moving it to the root directory. During this
process, it adjusts image paths from `images/xyz` to `doc/images/xyz`.

### packageMaintenance

This function updates the package.json file.

### generalScriptExecuter

This function executes specified scripts.
