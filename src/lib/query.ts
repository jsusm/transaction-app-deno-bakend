export function toSnakeCase(str: string) {
  let out = "";
  for (const char of str) {
    if (char === char.toUpperCase()) {
      out = out.concat(`_${char.toLowerCase()}`);
      continue;
    }
    out = out.concat(char);
  }
  return out;
}
export function makeKeyPairSet(
  args: Record<string, number | string>,
  options?: { snakeCase?: boolean; prefix?: string; separator?: string },
) {
  return Object.keys(args).map((k) => {
    let key = k;
    if (options?.snakeCase) {
      key = toSnakeCase(k);
    }
    if (options?.prefix) {
      key = `${options.prefix}_${key}`;
    }
    return `${key}=$${k}`;
  }).join(options?.separator ?? ", ");
}
