import { LibraryOptions, LibraryFormats, BuildOptions } from 'vite';
import { camelCase } from 'lodash-es';
import { BuildLibOptions } from './options';

export function getLib(options: Required<BuildLibOptions>): LibraryOptions {
  const {
    entry,
    fileName,
    es,
    umd,
    full,
    minify,
  } = options;

  const result: LibraryOptions = {
    entry,
    formats: [],
    name: camelCase(fileName),
    fileName: (format) => getOutputName(fileName, format as LibraryFormats, full, minify),
  };

  if (es) {
    result.formats?.push('es');
  }
  if (umd) {
    result.formats?.push('umd');
  }

  return result;
}

export function getOutputName(
  fileName: string,
  format: LibraryFormats = 'es',
  full: boolean = false,
  minify: BuildOptions['minify'] = false,
) {
  const fullTxt = full ? '.full' : '';
  const minTxt = minify ? '.min' : '';
  if (format === 'es') {
    return `${fileName}${fullTxt}${minTxt}.mjs`;
  }
  return `${fileName}${fullTxt}${minTxt}.umd.js`;
}