/* eslint-disable @typescript-eslint/ban-ts-comment */
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';

// Определяем среду выполнения
const environment = 'development'; //process.env.NODE_ENV || 'development';
// Загружаем соответствующий файл .env
config({ path: `.env.${environment}` });

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  public ensureValues(keys: string[]): ConfigService {
    keys.forEach((k) => this.getValue(k));
    return this;
  }

  public getPort(): string {
    return this.getValue('PORT');
  }

  public isProduction(): boolean {
    const mode = environment;
    // @ts-ignore
    return mode === 'production';
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.getValue('POSTGRES_HOST'),
      port: parseInt(this.getValue('POSTGRES_PORT')),
      username: this.getValue('POSTGRES_USER'),
      password: this.getValue('POSTGRES_PASSWORD'),
      database: this.getValue('POSTGRES_DATABASE'),
      autoLoadEntities: !this.isProduction(),
      synchronize: !this.isProduction(),
      ssl: this.isProduction(),
    };
  }

  public getGmailUser(): string {
    return this.getValue('GMAIL_USER');
  }

  public getGmailPass(): string {
    return this.getValue('GMAIL_PASS');
  }

  public getTokenExp(): string {
    return this.getValue('TOKEN_EXP');
  }

  public getRefreshTokenExp(): string {
    return this.getValue('REFRESH_TOKEN_EXP');
  }

  private getValue(key: string): string {
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
