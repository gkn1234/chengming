import { visualizer } from 'rollup-plugin-visualizer';
import inspect from 'vite-plugin-inspect';
import vue from '@vitejs/plugin-vue';
import rollupReplace from '@rollup/plugin-replace';
import { PluginOption } from 'vite';
import { NormalizedReadResult } from 'read-pkg-up';
import { isObjectLike } from '../utils';
import { BuildLibOptions } from './options';
import {
  setDtsPlugin,
  setPkgPlugin,
} from './pluginDts';

export function getCommonPlugins(options: Required<BuildLibOptions>, pkg?: NormalizedReadResult) {
  const {
    vue: vueOpt,
    visualizer: visualizerOpt,
    inspect: inspectOpt,
    replace: rollupReplaceOpt,
    dts: dtsOpt,
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

  /**
   * 若使用了 dts 插件，在其中的 afterBuild 钩子中设置 package.json
   *
   * 若没使用，在单独的插件中设置 package.json
   */
  if (dtsOpt) {
    result.push(setDtsPlugin(options, pkg));
  } else {
    result.push(setPkgPlugin(options, pkg));
  }

  return result;
}
