export function encode(str: string): string {
  return str.replace(/[a-zA-Z]/g, function(c) {
    const code = c.charCodeAt(0);
    const base = c <= 'Z' ? 65 : 97; // 'A' is 65, 'a' is 97
    return String.fromCharCode(base + (code - base + 13) % 26);
  });
}

export function decode(str: string): string {
  return encode(str); // ROT13 is symmetric, so encode = decode
}