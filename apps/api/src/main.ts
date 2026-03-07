import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import express from 'express';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

const isMainModule = () => {
  const entryPoint = process.argv[1];

  if (!entryPoint) {
    return false;
  }

  return fileURLToPath(import.meta.url) === resolve(entryPoint);
};

app.get('/', (_req, res) => {
  res.send({ message: 'Hello API' });
});

if (isMainModule()) {
  app.listen(port, host, () => {
    console.log(`[ ready ] http://${host}:${port}`);
  });
}

export { app };
