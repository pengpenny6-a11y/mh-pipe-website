// The SPA routes are independent of the directory that serves the build.
const mount = import.meta.env.BASE_URL.replace(/\/$/, '');

export function routePathname(pathname = location.pathname) {
  const path = mount && (pathname === mount || pathname.startsWith(mount + '/'))
    ? pathname.slice(mount.length)
    : pathname;
  return path.replace(/\/index\.html$/, '').replace(/\/$/, '') || '/';
}

export function routeHref(destination, language) {
  const url = new URL(destination, location.origin);
  const route = routePathname(url.pathname);
  // Pages publishes each route as a directory containing index.html.
  const path = mount && route !== '/' ? mount + route + '/' : mount + route;
  if (language) url.searchParams.set('lang', language);
  return path + url.search + url.hash;
}
