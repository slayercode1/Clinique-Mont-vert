import nodemailer, { Transporter } from 'nodemailer';
import dotenv from 'dotenv';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
dotenv.config();
export const transporter: Transporter<SMTPTransport.SentMessageInfo> =
  nodemailer.createTransport({
    host: 'localhost',
    port: 1025,
    secure: false, // true for 465, false for other ports
  });
