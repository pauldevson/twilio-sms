import express from 'express';
import bodyParser from 'body-parser';
import './config';
import verifyRouter from './routes/verify';

const app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api/verify', verifyRouter);

app.get('/', (req, res) => {
  res.json({
    verify: `http${req.secure ? 's' : ''}://${
      req.headers.host
    }/api/verify?phoneNumber=%2B{CountryCode}{10 Digits}&channel=sms`,
  });
});

app.server = app.listen(port, () => {
  console.log(`Running on port ${port}`);
});

export default app;
