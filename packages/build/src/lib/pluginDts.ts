import dts, { PluginOptions as DtsOptions } from 'vite-plugin-dts';
import { PluginOption } from 'vite';
import {
  resolve,
  join,
  basename,
} from 'node:path';
import { statSync } from 'node:fs';
import { NormalizedReadResult } from 'read-pkg-up';
import { writePackage } from 'write-pkg';
import { BuildLibOptions } from './options';
import {
  changeExt,
  isObjectLike,
  isFunction,
  absFromCwd,
  relativeFromCwd,
} from '../utils';
import { getOutputName } from './lib';

/** 临时保存 d.ts 入口文件 */
let dtsEntryPath: string | null = null;

// eslint-disable-next-line max-lines-per-function
export function setDtsPlugin(
  options: Required<BuildLibOptions>,
  pkg?: NormalizedReadResult,
): PluginOption {
  const {
    dts: dtsOpt,
    outDir,
    entry,
  } = options;

  if (!dtsOpt) {
    return null;
  }

  /** 入口绝对路径 */
  const absEntry = absFromCwd(entry);

  /** 输出目录绝对路径 */
  const absOutDir = absFromCwd(outDir);

  /** 入口是否为文件 */
  const isEntryFile = statSync(absEntry).isFile();

  /** 入口文件 d.ts 产物名称 */
  const dtsEntryFile = isEntryFile ? changeExt(basename(entry), 'd.ts') : 'index.d.ts';

  /** 入口文件 d.ts 产物的绝对路径 */
  const dtsEntryPathExpect = `${absOutDir}/${dtsEntryFile}`;

  /** 入口文件所在目录的绝对路径 */
  const absEntryFolder = isEntryFile ? join(absEntry, '..').replace(/\\/g, '/') : absEntry;

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
      // 当 dts 插件存在时，将在 afterBuild 钩子中完成 package.json 更新
      await setPackageJson(options, pkg);
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
      root: absFromCwd('../../'),
      entryRoot: absEntryFolder,
      outputDir: absOutDir,
      tsConfigFilePath: absFromCwd('../../tsconfig.lib.json'),
      skipDiagnostics: false,
      // 此处需要 glob 参数，windows 注意路径修复
      include: [absEntryFolder],
      compilerOptions: {
        skipLibCheck: true,
      },
      ...publicDtsOptions,
    });
  }

  return dts({ ...publicDtsOptions });
}

export async function setPackageJson(
  options: Required<BuildLibOptions>,
  pkg?: NormalizedReadResult,
) {
  const {
    outDir,
    writePkg,
    es,
    umd,
    fileName,
  } = options;

  if (!pkg || !writePkg) {
    return;
  }

  const absOutDir = absFromCwd(outDir);

  // 将 types main module 产物路径写入 package.json
  const exportsData: Record<string, any> = {};
  const { path: pkgPath, packageJson } = pkg;

  if (!isObjectLike(packageJson.exports)) {
    packageJson.exports = {};
  }

  if (umd) {
    const filePath = relativeFromCwd(resolve(absOutDir, getOutputName(fileName, 'umd')));
    packageJson.main = filePath;
    exportsData.require = filePath;
  }
  if (es) {
    const filePath = relativeFromCwd(resolve(absOutDir, getOutputName(fileName, 'es')));
    packageJson.module = filePath;
    exportsData.import = filePath;
  }
  if (dtsEntryPath) {
    const filePath = relativeFromCwd(resolve(absOutDir, dtsEntryPath));
    packageJson.types = filePath;
    exportsData.types = filePath;
  }

  Object.assign(packageJson.exports, { '.': exportsData });
  await writePackage(pkgPath, packageJson);
}

export function setPkgPlugin(
  options: Required<BuildLibOptions>,
  pkg?: NormalizedReadResult,
): PluginOption {
  if (!pkg || !options.writePkg) {
    return null;
  }

  return {
    name: 'set-package-json',
    apply: 'build',
    async closeBundle() {
      await setPackageJson(options, pkg);
    },
  };
}
