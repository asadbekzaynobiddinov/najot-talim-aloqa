import * as dotenv from 'dotenv';
dotenv.config();

export type ConfigType = {
  PORT: number;
  BOT_TOKEN: string;
  DB_TYPE: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_BAZE: string;
};

export const config: ConfigType = {
  PORT: Number(process.env.PORT) as number,
  BOT_TOKEN: process.env.BOT_TOKEN,
  DB_TYPE: process.env.DB_TYPE,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: Number(process.env.DB_PORT),
  DB_BAZE: process.env.DB_BAZE,
};
