import { UserConfig } from 'vite';
import { readPackageUp } from 'read-pkg-up';
import kebabCase from 'lodash/kebabCase';
import {
  defaultBuildLibOptions,
  BuildLibOptions,
} from './options';
import { getCommonPlugins } from './plugins';
import { getExternal } from './external';
import { getLib } from './lib';

export async function baseBuildLibConfig(options?: BuildLibOptions) {
  const curOptions = {
    ...defaultBuildLibOptions(),
    ...options,
  };

  const pkg = await readPackageUp();

  curOptions.fileName = curOptions.fileName || kebabCase(pkg?.packageJson.name);
  const result: UserConfig = {
    plugins: getCommonPlugins(curOptions, pkg),
    build: {
      lib: getLib(curOptions),
      minify: curOptions.minify,
      outDir: curOptions.outDir,
      rollupOptions: {
        external: curOptions.full ? [] : getExternal(pkg),
      },
    },
  };

  return result;
}