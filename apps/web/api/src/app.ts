import express from 'express';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.send({ status: 'ok' });
});

app.get('/', (_req, res) => {
  res.send({ message: 'Hello API' });
});

export { app };
