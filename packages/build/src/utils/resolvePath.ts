import { resolve, relative } from 'node:path';

export function absFromCwd(...paths: string[]) {
  return resolvePath(resolve(process.cwd(), ...paths));
}

export function relativeFromCwd(absPath: string, prefix: boolean = true) {
  const relativePath = resolvePath(relative(process.cwd(), absPath));
  if (relativePath.slice(0, 2) === '..') {
    return relativePath;
  }
  return prefix ? `./${relativePath}` : relativePath;
}

export function resolvePath(dir: string) {
  return dir.replace(/\\/g, '/');
}
