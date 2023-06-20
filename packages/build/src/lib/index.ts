import {
  build,
  UserConfigExport,
} from 'vite';
import mergeWith from 'lodash/mergeWith';
import {
  toPromise,
} from '../utils';
import { BuildLibOptions } from './options';
import { baseBuildLibConfig } from './base';

export interface MergeCustomizer {
  (value: any, srcValue: any, key: string, object: any, source: any): any
}

function defaultMergeCustomizer(target: any, src: any) {
  if (Array.isArray(target)) {
    return target.concat(src);
  }
  return undefined;
}

export async function defineBuildLibConfig(
  options?: BuildLibOptions,
  viteConfigInput: UserConfigExport = {},
  mergeCustomizer?: MergeCustomizer,
) {
  const baseConfig = await baseBuildLibConfig(options);

  const viteConfig = await toPromise(viteConfigInput);
  return mergeWith(
    baseConfig,
    viteConfig,
    mergeCustomizer || defaultMergeCustomizer,
  );
}

export async function buildLib(
  options?: BuildLibOptions,
  viteConfigInput: UserConfigExport = {},
  mergeCustomizer?: MergeCustomizer,
) {
  const config = await defineBuildLibConfig(options, viteConfigInput, mergeCustomizer);
  await build(config);
}

export * from './options';
export * from './base';
export * from './plugins';
export * from './external';
