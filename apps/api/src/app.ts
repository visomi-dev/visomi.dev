import express from 'express';

const app = express();

app.get('/', (_req, res) => {
  res.send({ message: 'Hello API' });
});

export { app };
