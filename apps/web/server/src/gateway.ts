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
