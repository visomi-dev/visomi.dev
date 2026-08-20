import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

import express, {
  static as serveStatic,
  type Express,
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from 'express';

type AstroRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;

type GatewayDeps = {
  apiHandler: RequestHandler;
  angularHandler: RequestHandler;
  astroClientFolder: string;
  astroRequestHandler: AstroRequestHandler;
  socialImagesHandler?: RequestHandler;
};

const MANY_TRAILING_SLASHES = /\/{2,}$/g;
const WITH_FILE_EXT = /\/[^/]+\.\w+$/;
const INTERNAL_PREFIXES = new Set(['/_', '/@', '/.', '//']);

const isInternalPath = (path: string) => INTERNAL_PREFIXES.has(path.slice(0, 2));
const hasFileExtension = (path: string) => WITH_FILE_EXT.test(path);

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

const contentTypeFor = (filePath: string) => {
  const ext = extname(filePath).toLowerCase();

  return CONTENT_TYPES[ext] ?? 'application/octet-stream';
};

const redirectTrailingSlash = (req: Request, res: Response, next: NextFunction) => {
  const pathname = req.path;

  if (pathname === '/' || isInternalPath(pathname)) {
    next();
    return;
  }

  const collapsed = pathname.replace(MANY_TRAILING_SLASHES, '/');
  if (collapsed !== pathname) {
    const status = req.method === 'GET' ? 301 : 308;
    res
      .status(status)
      .location(collapsed + req.url.slice(req.path.length))
      .end();
    return;
  }

  if (!collapsed.endsWith('/') && !hasFileExtension(collapsed)) {
    const status = req.method === 'GET' ? 301 : 308;
    res
      .status(status)
      .location(collapsed + '/' + req.url.slice(req.path.length))
      .end();
    return;
  }

  next();
};

const isPrerenderedHtml = (filePath: string) => /\.html?$/.test(filePath);

const buildWeakEtag = (mtimeMs: number, size: number) => `W/"${size.toString(36)}-${Math.floor(mtimeMs).toString(36)}"`;

const servePrerenderedAsset: RequestHandler = (req, res, next) => {
  const folder = (req as Request & { _astroFolder?: string })._astroFolder;

  if (!folder) {
    next();
    return;
  }

  const requestedPath = req.path === '/' ? '/index.html' : req.path;

  let resolvedPath = join(folder, requestedPath);

  if (!resolvedPath.endsWith('.html') && !hasFileExtension(resolvedPath)) {
    resolvedPath = join(resolvedPath, 'index.html');
  }

  const normalizedPath = normalize(resolvedPath);

  if (!normalizedPath.startsWith(folder)) {
    res.status(400).end();
    return;
  }

  let stats;

  try {
    stats = statSync(normalizedPath);
  } catch (_error) {
    next();
    return;
  }

  if (!stats.isFile()) {
    next();
    return;
  }

  const etag = buildWeakEtag(stats.mtimeMs, stats.size);
  const isHtml = isPrerenderedHtml(normalizedPath);

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  res.setHeader('ETag', etag);
  res.setHeader('Content-Length', stats.size.toString());
  res.setHeader('Content-Type', contentTypeFor(normalizedPath));

  if (isHtml) {
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }

  if (req.headers['if-none-match'] === etag) {
    res.status(304).end();
    return;
  }

  if (req.method === 'HEAD') {
    res.status(200).end();
    return;
  }

  createReadStream(normalizedPath).pipe(res);
};

const createGatewayApp = ({
  apiHandler,
  angularHandler,
  astroClientFolder,
  astroRequestHandler,
  socialImagesHandler,
}: GatewayDeps): Express => {
  const app = express();

  app.use(express.json());
  app.get('/healthz', (_req, res) => res.send({ status: 'ok' }));

  if (socialImagesHandler) {
    app.use('/api/internal/social-images', socialImagesHandler);
  }

  app.use('/api', apiHandler);
  app.use('/app', angularHandler);

  app.use((req, _res, next) => {
    (req as Request & { _astroFolder?: string })._astroFolder = astroClientFolder;
    next();
  });

  app.use(servePrerenderedAsset);

  app.use(
    serveStatic(astroClientFolder, {
      index: false,
      maxAge: '1y',
      redirect: false,
    }),
  );

  app.use(redirectTrailingSlash);
  app.use((req, res, next) => astroRequestHandler(req, res, next));

  return app;
};

export { createGatewayApp };
export type { GatewayDeps };
