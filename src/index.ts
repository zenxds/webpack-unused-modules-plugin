// https://webpack.js.org/api/compiler-hooks/
// https://webpack.js.org/api/compilation-hooks/
import fs from 'fs'
import path from 'path'
import { Compiler, compilation } from 'webpack'

const PluginName = 'UnusedModulesPlugin'

interface Options {
  sourceDir: string
  compilationExclude?: (compilation: compilation.Compilation) => boolean
  output?: string
  exclude?: RegExp[]
}

interface GenericMap<T> {
  [key: string]: T
}

class UnusedModulesPlugin {
  options: Required<Options>

  constructor(options: Options) {
    this.options = Object.assign({
      sourceDir: '',
      compilationExclude: (compilation: compilation.Compilation) => false,
      output: 'unusedModules.json',
      exclude: []
    }, options)
  }

  apply(compiler: Compiler) {
    const { sourceDir, compilationExclude, output } = this.options

    compiler.hooks.compilation.tap(PluginName, (compilation: compilation.Compilation) => {

      if (compilationExclude(compilation)) {
        return
      }

      compilation.hooks.afterOptimizeChunkAssets.tap(PluginName, chunks => {
        const modules: GenericMap<number> = {}

        chunks.forEach(chunk => {
          chunk.getModules().map(module => {
            const src = module.resource || ''

            if (!src || src.indexOf(sourceDir) === -1) {
              return
            }

            modules[src] = 1
          })
        })

        const list = this.diff(walk(sourceDir), modules)
        fs.writeFileSync(output, JSON.stringify(list, null, 2))
      })
    })
  }

  diff(files: GenericMap<number>, modules: GenericMap<number>): string[] {
    const { exclude, sourceDir } = this.options
    const ret = []

    for (let i in files) {
      if (isExclude(exclude, i)) {
        continue
      }

      if (!modules[i]) {
        ret.push(i)
      }
    }

    return ret.map(item => path.relative(sourceDir, item))
  }
}

function walk(dir: string, ret?: GenericMap<number>): GenericMap<number> {
  if (!ret) {
    ret = {}
  }

  const files = fs.readdirSync(dir)

  for (let file of files) {
    const p = path.join(dir, file)
    const stat = fs.statSync(p)

    if (stat.isDirectory()) {
      walk(p, ret)
      continue
    }

    ret[p] = 1
  }

  return ret
}

function isExclude(exclude: RegExp[], src: string): boolean {
  return exclude.some(item => {
    if (item.test(src)) {
      return true
    }

    return false
  })
}

export = UnusedModulesPlugin
