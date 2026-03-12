import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config({ quiet: true });
export const transporter: ReturnType<typeof nodemailer.createTransport> =
  nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });
