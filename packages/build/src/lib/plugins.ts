import { visualizer } from 'rollup-plugin-visualizer';
import inspect from 'vite-plugin-inspect';
import {
  changeExt,
  isObjectLike,
  isFunction,
} from '@openxui/shared';
import vue from '@vitejs/plugin-vue';
import dts, { PluginOptions as DtsOptions } from 'vite-plugin-dts';
import rollupReplace from '@rollup/plugin-replace';
import { PluginOption } from 'vite';
import { NormalizedReadResult } from 'read-pkg-up';
import { writePackage } from 'write-pkg';
import {
  resolve,
  join,
  relative,
  basename,
} from 'node:path';
import { statSync } from 'node:fs';
import { BuildLibOptions } from './options';
import { getOutputName } from './lib';

export function getCommonPlugins(options: Required<BuildLibOptions>, pkg?: NormalizedReadResult) {
  const {
    vue: vueOpt,
    visualizer: visualizerOpt,
    inspect: inspectOpt,
    replace: rollupReplaceOpt,
  } = options;

  const result: PluginOption[] = [];
  if (vueOpt) {
    result.push(isObjectLike(vueOpt) ? vue(vueOpt) : vue());
  }
  if (visualizerOpt) {
    result.push(isObjectLike(visualizerOpt) ? visualizer(visualizerOpt) : visualizer());
  }
  if (inspectOpt) {
    result.push(isObjectLike(inspectOpt) ? inspect(inspectOpt) : inspect());
  }
  if (rollupReplaceOpt) {
    result.push(rollupReplace({
      preventAssignment: true,
      ...rollupReplaceOpt,
    }));
  }
  result.push(setDtsPlugin(options, pkg));

  return result;
}

function setDtsPlugin(
  options: Required<BuildLibOptions>,
  pkg?: NormalizedReadResult,
): PluginOption {
  const {
    dts: dtsOpt,
    writePkg,
    es,
    umd,
    outDir,
    fileName,
    entry,
  } = options;

  if (!dtsOpt) {
    return null;
  }

  /** 根据 project 根目录计算其他文件的绝对路径 */
  const resolvePath = (...paths: string[]) => resolve(process.cwd(), ...paths).replace(/\\/g, '/');

  /** 入口绝对路径 */
  const entryAbsolute = resolvePath(entry);

  /** 输出目录绝对路径 */
  const outDirAbsolute = resolvePath(outDir);

  /** 获取产物相对于根目录的路径 */
  const outDirRelative = (target: string) => {
    const relativePath = relative(process.cwd(), resolve(outDirAbsolute, target)).replace(/\\/g, '/');
    return relativePath[0] === '.' ? relativePath : `./${relativePath}`;
  };

  /** 入口 dts 文件路径 */
  let dtsEntryPath: string;

  /** 入口是否为文件 */
  const isEntryFile = statSync(entryAbsolute).isFile();

  /** 入口文件 d.ts 产物名称 */
  const dtsEntryFile = isEntryFile ? changeExt(basename(entry), 'd.ts') : 'index.d.ts';

  /** 入口文件 d.ts 产物的绝对路径 */
  const dtsEntryPathExpect = join(outDirAbsolute, dtsEntryFile).replace(/\\/g, '/');

  /** 入口文件所在目录的绝对路径 */
  const entryAbsoluteDir = isEntryFile ? join(entryAbsolute, '..') : entryAbsolute;

  /** dts 插件公共配置 */
  const publicDtsOptions: DtsOptions = {
    beforeWriteFile: (filePath, content) => {
      if (filePath === dtsEntryPathExpect && !dtsEntryPath) {
        dtsEntryPath = filePath;
      }

      const next = isObjectLike(dtsOpt) && isFunction(dtsOpt.beforeWriteFile) ?
        dtsOpt.beforeWriteFile : () => {};
      return next(filePath, content);
    },
    afterBuild: async () => {
      if (!pkg || !writePkg) {
        return;
      }

      // 将 types main module 产物路径写入 package.json
      const exportsData: Record<string, any> = {};
      const { path: pkgPath, packageJson } = pkg;
      if (umd) {
        const filePath = outDirRelative(getOutputName(fileName, 'umd'));
        packageJson.main = filePath;
        exportsData.require = filePath;
      }
      if (es) {
        const filePath = outDirRelative(getOutputName(fileName, 'es'));
        packageJson.module = filePath;
        exportsData.module = filePath;
      }
      if (dtsOpt) {
        const filePath = outDirRelative(dtsEntryPath);
        packageJson.types = filePath;
        exportsData.types = filePath;
      }

      if (!isObjectLike(packageJson.exports)) {
        packageJson.exports = {};
      }
      Object.assign(packageJson.exports, { '.': exportsData });
      await writePackage(pkgPath, packageJson);

      if (isObjectLike(dtsOpt) && isFunction(dtsOpt.afterBuild)) {
        await dtsOpt.afterBuild();
      }
    },
  };

  if (isObjectLike(dtsOpt)) {
    return dts({ ...dtsOpt, ...publicDtsOptions });
  }

  if (dtsOpt === 'default') {
    return dts({
      root: resolvePath('../../'),
      entryRoot: entryAbsoluteDir,
      outputDir: outDirAbsolute,
      tsConfigFilePath: resolvePath('../../tsconfig.src.json'),
      skipDiagnostics: false,
      // 此处需要 glob 参数，windows 注意路径修复
      include: [entryAbsoluteDir.replace(/\\/g, '/')],
      ...publicDtsOptions,
    });
  }
  return dts({ ...publicDtsOptions });
}