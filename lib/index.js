"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const PluginName = 'UnusedModulesPlugin';
class UnusedModulesPlugin {
    constructor(options) {
        this.options = Object.assign({
            sourceDir: '',
            compilationExclude: (compilation) => false,
            output: 'unusedModules.json',
            exclude: []
        }, options);
    }
    apply(compiler) {
        const { sourceDir, compilationExclude, output } = this.options;
        compiler.hooks.compilation.tap(PluginName, (compilation) => {
            if (compilationExclude(compilation)) {
                return;
            }
            compilation.hooks.afterOptimizeChunkAssets.tap(PluginName, chunks => {
                const modules = {};
                chunks.forEach(chunk => {
                    chunk.getModules().map(module => {
                        const src = module.resource || '';
                        if (!src || src.indexOf(sourceDir) === -1) {
                            return;
                        }
                        modules[src] = 1;
                    });
                });
                const list = this.diff(walk(sourceDir), modules);
                fs_1.default.writeFileSync(output, JSON.stringify(list, null, 2));
            });
        });
    }
    diff(files, modules) {
        const { exclude, sourceDir } = this.options;
        const ret = [];
        for (let i in files) {
            if (isExclude(exclude, i)) {
                continue;
            }
            if (!modules[i]) {
                ret.push(i);
            }
        }
        return ret.map(item => path_1.default.relative(sourceDir, item));
    }
}
function walk(dir, ret) {
    if (!ret) {
        ret = {};
    }
    const files = fs_1.default.readdirSync(dir);
    for (let file of files) {
        const p = path_1.default.join(dir, file);
        const stat = fs_1.default.statSync(p);
        if (stat.isDirectory()) {
            walk(p, ret);
            continue;
        }
        ret[p] = 1;
    }
    return ret;
}
function isExclude(exclude, src) {
    return exclude.some(item => {
        if (item.test(src)) {
            return true;
        }
        return false;
    });
}
module.exports = UnusedModulesPlugin;
