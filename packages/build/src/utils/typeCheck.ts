export const { isArray } = Array;

export function isObject(val: unknown): val is Record<any, any> {
  return isObjectLike(val) && !isArray(val);
}

export function isObjectLike(val: unknown): val is Record<any, any> {
  return val !== null && typeof val === 'object';
}

export function isPromise<T = any>(val: unknown): val is Promise<T> {
  return isObject(val) && isFunction(val.then) && isFunction(val.catch);
}

export function isFunction(val: unknown): val is Function {
  return typeof val === 'function';
}
