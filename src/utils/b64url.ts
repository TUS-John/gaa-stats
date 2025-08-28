export function b64urlEncode(obj: any) {
  const json = JSON.stringify(obj);
  const bytes = new TextEncoder().encode(json);
  let bin = ''; bytes.forEach(b => bin += String.fromCharCode(b));
  let out = btoa(bin);
  out = out.split('+').join('-').split('/').join('_').replace(/=+$/, '');
  return out;
}
export function b64urlDecode(str: string) {
  if (!str) return null as any;
  let b64 = str.split('-').join('+').split('_').join('/');
  while (b64.length % 4) b64 += '=';
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return JSON.parse(new TextDecoder().decode(bytes));
}
