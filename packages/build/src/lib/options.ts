import { Options as InspectOptions } from 'vite-plugin-inspect';
import { PluginVisualizerOptions } from 'rollup-plugin-visualizer';
import { Options as VueOptions } from '@vitejs/plugin-vue';
import { BuildOptions } from 'vite';
import { PluginOptions as dtsOptions } from 'vite-plugin-dts';
import { RollupReplaceOptions } from '@rollup/plugin-replace';

export interface BuildLibOptions {
  /**
   * 构建入口
   * @default 'src/index.ts'
   */
  entry?: string;

  /**
   * 生成的文件名称，如果需要生成 umd 文件，全局变量名称则是驼峰化后的 fileName
   *
   * 默认情况下取 package 包名，转换为 kebab-case，如：@openx/request -> openx-request
   */
  fileName?: string;

  /**
   * 输出路径，
   * @default 'dist'
   */
  outDir?: string;

  /**
   * 是否调用 vite-plugin-dts 插件生成 dts 文件。
   * - false 不生成 dts 文件
   * - true 使用 vite-plugin-dts 默认配置
   * - default 使用本工程通用的 dts 插件配置
   * - Object 传给插件的自定义配置
   * @default true
   */
  dts?: boolean | 'default' | dtsOptions;

  /**
   * 是否打包出 es 文件。
   * @default true
   */
  es?: boolean;

  /**
   * 是否打包出 umd 文件。
   * @default true
  */
  umd?: boolean;

  /**
   * 是否打包出完整的文件(不排除外部依赖)。
   *
   * 打包完整文件时不会自动将产物路径写入 package.json。即使 writePkg 字段为 true。
   *
   * 文件的名称会带有 .full 后缀，产物举例如下：
   * - fileName 为 my-pkg
   * - esm 为 true
   * - umd 为 true
   * - 打包出文件：my-pkg.full.mjs、my-pkg.full.umd.js
   *
   * @default false
   */
  full?: boolean;

  /**
   * 生成对应的产物后，是否把产物路径写入 package.json 中的对应字段。writePkg 为 true 时会进行以下行为：
   * - dts 非空时的产物路径，自动写入 types 字段。
   * - esm 为 true 时的产物路径，自动写入 module、export['.']['import'] 字段。
   * - umd 为 true 时的产物路径，自动写入 main、export['.']['require'] 字段。
   *
   * @default true
   */
  writePkg?: boolean;

  /**
   * 是否压缩混淆产物，
   * @default false
   */
  minify?: BuildOptions['minify'];

  /**
   * 是否启用 rollup-plugin-visualizer 进行产物分析，
   * @default false
   */
  visualizer?: boolean | PluginVisualizerOptions;

  /**
   * 是否启用 vite-plugin-inspect 进行产物分析，
   * @default false
   */
  inspect?: boolean | InspectOptions;

  /**
   * 是否启用 @vitejs/plugin-vue 进行 vue 模板解析
   * @default false
   */
  vue?: boolean | VueOptions;

  /**
   * Options for using @rollup/plugin-replace
   * @default false
   */
  replace?: false | RollupReplaceOptions;
}

export function defaultBuildLibOptions(): Required<BuildLibOptions> {
  return {
    entry: 'src',
    fileName: '',
    outDir: 'dist',
    dts: true,
    es: true,
    umd: true,
    full: false,
    writePkg: true,
    minify: false,
    visualizer: false,
    inspect: false,
    vue: false,
    replace: false,
  };
}