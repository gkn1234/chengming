/**
 * @openx/build 包不能依赖工程中其他 monorepo 包
 *
 * 因此需要维护自己使用的公用方法，或者引用外部的依赖。
 */

export * from './toPromise';
export * from './typeCheck';
export * from './changeExt';
export * from './resolvePath';
