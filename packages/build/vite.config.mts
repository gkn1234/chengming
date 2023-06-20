import { defineConfig } from 'vite';
import { defineBuildLibConfig } from './src';

export default defineConfig(({ mode }) => defineBuildLibConfig({
  dts: mode === 'development' ? false : 'default',
}));
