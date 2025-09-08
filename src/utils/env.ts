import dotenv from 'dotenv';
dotenv.config();

export const env = {
  instance: process.env.USHUR_INSTANCE || '',
  email: process.env.USHUR_USER_EMAIL || '',
  password: process.env.USHUR_USER_PASSWORD || '',
};
