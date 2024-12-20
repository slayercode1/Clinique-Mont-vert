import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { routes } from './router/index.js';
dotenv.config();
const fleet_service = express();
const port = process.env.PORT_SERVICE_FLEET;
fleet_service.use(helmet());
fleet_service.use(helmet.hsts({
    maxAge: 31536000, // 1 an
    includeSubDomains: true,
    preload: true,
}));
fleet_service.use(cors({
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200,
}));
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    message: 'Too many requests from this IP, please try again later.',
});
fleet_service.use(limiter);
fleet_service.use(express.json());
fleet_service.use(routes);
fleet_service.listen(port);
export default fleet_service;
