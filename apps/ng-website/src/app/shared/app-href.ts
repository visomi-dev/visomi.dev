const FALLBACK_ORIGIN = 'http://localhost';
const SPANISH_LOCALE = 'es';

function ensureLeadingSlash(pathname: string) {
  return pathname ? (pathname.startsWith('/') ? pathname : `/${pathname}`) : '/';
}

function ensureTrailingSlash(pathname: string) {
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

function trimTrailingSlash(pathname: string) {
  if (pathname === '/') {
    return pathname;
  }

  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

function stripLocaleSuffix(pathname: string) {
  const normalizedPathname = trimTrailingSlash(ensureLeadingSlash(pathname));

  if (normalizedPathname === `/${SPANISH_LOCALE}`) {
    return '/';
  }

  const localeSuffix = `/${SPANISH_LOCALE}`;

  return normalizedPathname.endsWith(localeSuffix)
    ? (normalizedPathname.slice(0, -localeSuffix.length) || '/')
    : normalizedPathname;
}

function stripLocalePrefix(pathname: string) {
  const normalizedPathname = ensureLeadingSlash(pathname);
  const localePrefix = `/${SPANISH_LOCALE}`;

  if (normalizedPathname === localePrefix || normalizedPathname === `${localePrefix}/`) {
    return '/';
  }

  return normalizedPathname.startsWith(`${localePrefix}/`)
    ? normalizedPathname.slice(localePrefix.length)
    : normalizedPathname;
}

export function getDeploymentBasePath(documentBaseUri: string) {
  const pathname = new URL(documentBaseUri, FALLBACK_ORIGIN).pathname;

  return ensureTrailingSlash(stripLocaleSuffix(pathname));
}

export function getAppHref(documentBaseUri: string, appPath: string) {
  const basePath = getDeploymentBasePath(documentBaseUri);
  const normalizedAppPath = ensureLeadingSlash(appPath);

  if (normalizedAppPath === '/') {
    return basePath;
  }

  return `${basePath}${normalizedAppPath.slice(1)}`;
}

export function getLocaleHref(documentBaseUri: string, currentPath: string, target: 'en' | 'es') {
  const currentUrl = new URL(currentPath || '/', FALLBACK_ORIGIN);
  const pathname = stripLocalePrefix(currentUrl.pathname);
  const localizedPath = target === 'es' ? (pathname === '/' ? '/es/' : `/es${pathname}`) : pathname;

  return `${getAppHref(documentBaseUri, localizedPath)}${currentUrl.search}${currentUrl.hash}`;
}
