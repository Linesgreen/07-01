/* eslint-disable @typescript-eslint/ban-ts-comment,no-underscore-dangle */
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';

// Определяем среду выполнения
const environment = 'development'; //process.env.NODE_ENV || 'development';
// Загружаем соответствующий файл .env
config({ path: `.env.${environment}` });

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  public ensureValues(keys: string[]): ConfigService {
    keys.forEach((k) => this._getValue(k));
    return this;
  }

  public getPort(): string {
    return this._getValue('PORT');
  }

  public isProduction(): boolean {
    const mode = environment;
    // @ts-ignore
    return mode === 'production';
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this._getValue('POSTGRES_HOST'),
      port: parseInt(this._getValue('POSTGRES_PORT')),
      username: this._getValue('POSTGRES_USER'),
      password: this._getValue('POSTGRES_PASSWORD'),
      database: this._getValue('POSTGRES_DATABASE'),
      autoLoadEntities: !this.isProduction(),
      synchronize: !this.isProduction(),
      logging: true,
      ssl: this.isProduction(),
    };
  }

  public getGmailUser(): string {
    return this._getValue('GMAIL_USER');
  }

  public getGmailPass(): string {
    return this._getValue('GMAIL_PASS');
  }

  public getTokenExp(): string {
    return this._getValue('TOKEN_EXP');
  }

  public getRefreshTokenExp(): string {
    return this._getValue('REFRESH_TOKEN_EXP');
  }

  private _getValue(key: string): string {
    const value = this.env[key];
    if (!value) {
      throw new Error(`config error - missing env.${key}`);
    }

    return value;
  }
}

const configService = new ConfigService(process.env).ensureValues([
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DATABASE',
  'PORT',
  'GMAIL_USER',
  'GMAIL_PASS',
  'TOKEN_EXP',
  'REFRESH_TOKEN_EXP',
]);

export { configService };
