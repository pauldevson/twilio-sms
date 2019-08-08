import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import './config';
import phonesRouter from './routes/phones';

const app = express();

const port = process.env.PORT || 3000;

const { ENV, CONNECTION_STRING } = process.env;

if (ENV === 'Test') console.log('This is a test');
else console.log('This is for real!');

// console.log(CONNECTION_STRING);

const db = mongoose.connect(CONNECTION_STRING, {
  useNewUrlParser: true,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api/phones', phonesRouter);

app.get('/', (req, res) => {
  res.json({
    verify: `http${req.secure ? 's' : ''}://${
      req.headers.host
    }/api/phones/%2B{CountryCode}{10 Digits}`,
  });
});

app.server = app.listen(port, () => {
  console.log(`Running on port ${port}`);
});

export default app;
