import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
export const transporter = nodemailer.createTransport({
    host: 'localhost',
    port: 1025,
    secure: false, // true for 465, false for other ports
});
