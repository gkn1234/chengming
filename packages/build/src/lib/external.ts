import { NormalizedReadResult } from 'read-pkg-up';

export function getExternal(pkg?: NormalizedReadResult) {
  if (!pkg) {
    return [];
  }

  const { packageJson } = pkg;
  const {
    dependencies = {},
    peerDependencies = {},
  } = packageJson;

  const defaultExternal: (string | RegExp)[] = [
    /^node:.*/,
  ];

  const toReg = (item: string) => new RegExp(`^${item}`);

  return defaultExternal.concat(
    Object.keys(dependencies).map(toReg),
    Object.keys(peerDependencies).map(toReg),
  );
}