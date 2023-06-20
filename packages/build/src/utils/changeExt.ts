/**
 * 为文件名字符串更换后缀
 *
 * 只换最后一个 . 后面的内容，例如 m.md.txt，只会更换 .txt
 */
export function changeExt(dir: string, ext: string) {
  const arr = dir.split('.');
  if (arr.length > 1) {
    arr.pop();
  }
  arr.push(ext);
  return arr.join('.');
}
