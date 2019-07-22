# webpack-unused-modules-plugin

compare src dir and webpack modules, output the unused src files

## install

```
npm install webpack-unused-modules-plugin --save-dev
```

## how to use

```
const path = require('path)
const UnusedModulesPlugin = require('webpack-unused-modules-plugin')

plugins: [
  new UnusedModulesPlugin({
    sourceDir: path.join(__dirname, 'src'),
    compilationExclude: compilation => /html-webpack-plugin/.test(compilation.name),
    output: path.join(__dirname, 'tmp/unusedModules.json'),
    exclude: [
      /\.spec\.js$/
    ]
  })
]
```
