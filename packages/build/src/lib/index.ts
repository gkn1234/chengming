import {
  build,
  UserConfigExport,
} from 'vite';
import {
  toPromise,
  mergeOptions,
  MergeOptionsSettings,
} from '@openxui/shared';
import { BuildLibOptions } from './options';
import { baseBuildLibConfig } from './base';

export async function defineBuildLibConfig(
  options?: BuildLibOptions,
  viteConfigInput: UserConfigExport = {},
  settings?: MergeOptionsSettings,
) {
  const baseConfig = await baseBuildLibConfig(options);

  const viteConfig = await toPromise(viteConfigInput);
  return mergeOptions(
    baseConfig,
    viteConfig,
    settings,
  );
}

export async function buildLib(
  options?: BuildLibOptions,
  viteConfigInput: UserConfigExport = {},
  settings?: MergeOptionsSettings,
) {
  const config = await defineBuildLibConfig(options, viteConfigInput, settings);
  await build(config);
}

export * from './options';
export * from './base';
export * from './plugins';
export * from './external';