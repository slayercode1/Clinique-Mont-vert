import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { routes } from './router/index.js';
dotenv.config();
const it_service = express();
const port = process.env.PORT_SERVICE_IT;
it_service.use(helmet());
it_service.use(helmet.hsts({
    maxAge: 31536000, // 1 an
    includeSubDomains: true,
    preload: true,
}));
it_service.use(cors({
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200,
}));
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    message: 'Too many requests from this IP, please try again later.',
});
it_service.use(limiter);
it_service.use(express.json());
it_service.use(routes);
it_service.listen(port);
export default it_service;
