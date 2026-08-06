export function parsePath(pathname, basePath) {
  if (!pathname.startsWith(basePath)) return { segments: [], first: '' };
  const rest = pathname.slice(basePath.length).replace(/^\/+/, '');
  const segments = rest ? rest.split('/').filter(Boolean) : [];
  return { segments, first: segments[0] || '' };
}
