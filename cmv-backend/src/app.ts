import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { proxy } from './middlewares/proxy/proxy.js';

dotenv.config();

const gateway = express();
const port = process.env.PORT_GATEWAY;
//gateway.use(helmet());
// gateway.use( (req, res, next) => logger(req, res, next))
gateway.use(
  helmet.hsts({
    maxAge: 31536000, // 1 an
    includeSubDomains: true,
    preload: true,
  })
);
gateway.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    optionsSuccessStatus: 200,
  })
);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  message: 'Too many requests from this IP, please try again later.',
});
gateway.use(limiter);
gateway.use(express.json());

gateway.use('/:service', proxy);

if (process.env.NODE_ENV !== 'test') {
  console.log(port);
  gateway.listen(port);
}

export default gateway;
