import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard } from '@nestjs/throttler';
import { MailerService } from '@nestjs-modules/mailer';
import * as mockdate from 'mockdate';
import request from 'supertest';
import crypto from 'crypto';

import { AppModule } from '../../src/app.module';
import { RecoveryCodeIsValidConstraint } from '../../src/infrastructure/decorators/validate/password-recovery-code.decorator';
import { appSettings } from '../../src/settings/aplly-app-setting';
import { AuthTestManager } from '../common/authTestManager';

const userLoginData = {
  login: 'test',
  email: 'test@mail.ru',
  password: 'testTest',
};

const mockedUUID = '29c2ea4b-f9a8-4f65-b006-b4fdd816dd25';

describe('Auth e2e test', () => {
  let app: INestApplication;
  let httpServer: string;
  let authTestManager: AuthTestManager;
  let jestSpyEmail;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }) //Мокаем ддос защиту для того что бы она не мешала
      .overrideGuard(ThrottlerGuard)
      .useValue({
        canActivate: () => {
          return true;
        },
      })
      .compile();
    app = moduleFixture.createNestApplication();
    appSettings(app);
    await app.init();
    httpServer = app.getHttpServer();

    //connect managers for testing
    authTestManager = new AuthTestManager(app);
    //clean the database before the tests
    await request(httpServer).delete('/testing/all-data').expect(204);
  });
  beforeEach(async () => {
    //disable email sending
    jestSpyEmail = jest.spyOn(MailerService.prototype, 'sendMail').mockImplementation(() => Promise.resolve(true));
  });

  afterAll(async () => {
    await app.close();
  });

  describe('registration flow', () => {
    it('registration user', async () => {
      await authTestManager.registration(userLoginData, 204);
      //check that there was a call to the Email Service
      expect(jestSpyEmail).toBeCalled();
      //clear the call counter for the following tests
      jest.clearAllMocks();
    });

    it('should not be able to register a user with the same username and email address.', async () => {
      await authTestManager.registration(userLoginData, 400);
      expect(jestSpyEmail).not.toBeCalled();
    });

    it('should not be able to register a user with the same username and email address.', async () => {
      const response = await authTestManager.registration(
        { ...userLoginData, login: '', password: '', email: '' },
        400,
      );
      expect(response.body.errorsMessages.length).toEqual(3);
      expect(response.body.errorsMessages[0].field).toEqual('login');
      expect(response.body.errorsMessages[1].field).toEqual('password');
      expect(response.body.errorsMessages[2].field).toEqual('email');

      expect(jestSpyEmail).not.toBeCalled();
    });

    it('clear bd', async () => {
      await request(httpServer).delete('/testing/all-data').expect(204);
    });
  });

  describe('registration confirmation', () => {
    afterAll(async () => {
      await request(httpServer).delete('/testing/all-data').expect(204);
      jest.clearAllMocks();
      mockdate.reset();
    });
    it('registration user with mocked code', async () => {
      //Mock code
      jest.spyOn(crypto, 'randomUUID').mockImplementation(() => mockedUUID);
      expect.setState({ code: mockedUUID });
      await authTestManager.registration(userLoginData, 204);
      //check that there was a call to the Email Service
      expect(jestSpyEmail).toBeCalled();
      //clear the call counter for the following tests
      jest.clearAllMocks();
    });

    it('confirm account using the code', async () => {
      const { code } = expect.getState();
      await request(httpServer).post('/auth/registration-confirmation').send({ code }).expect(204);
    });
    it('shouldn"t confirm already confirm account', async () => {
      const { code } = expect.getState();
      const repspone = await request(httpServer).post('/auth/registration-confirmation').send({ code }).expect(400);
      expect(repspone.body.errorsMessages[0].field).toEqual('code');

      await request(httpServer).delete('/testing/all-data').expect(204);
    });

    it('registration user with mocked old date', async () => {
      //Mock date
      mockdate.set(new Date(Date.now() - 9999999999));
      //Moc code
      jest.spyOn(crypto, 'randomUUID').mockImplementation(() => mockedUUID);

      await authTestManager.registration(userLoginData, 204);
      //clear the call counter for the following tests
      jest.clearAllMocks();
      mockdate.reset();
    });

    it('shouldn"t confirm old confirm code', async () => {
      const { code } = expect.getState();
      const repspone = await request(httpServer).post('/auth/registration-confirmation').send({ code }).expect(400);
      expect(repspone.body.errorsMessages[0].field).toEqual('code');
    });
  });

  describe('registration-email-resending', () => {
    beforeAll(async () => {
      await request(httpServer).delete('/testing/all-data').expect(204);
      jest.clearAllMocks();
      mockdate.reset();
    });

    it('registration user', async () => {
      await authTestManager.registration(userLoginData, 204);
      //check that there was a call to the Email Service
      expect(jestSpyEmail).toBeCalled();
      //clear the call counter for the following tests
      mockdate.reset();
    });
    it('email resending', async () => {
      //const { code } = expect.getState();
      //Moc code
      jest.spyOn(crypto, 'randomUUID').mockImplementation(() => mockedUUID);

      await request(httpServer)
        .post('/auth/registration-email-resending')
        .send({ email: userLoginData.email })
        .expect(204);
      expect(jestSpyEmail).toBeCalled();
    });
    it('confirm account using the code', async () => {
      const { code } = expect.getState();
      await request(httpServer).post('/auth/registration-confirmation').send({ code }).expect(204);
    });
    it("shouldn't send an email to an already confirmed account", async () => {
      //const { code } = expect.getState();
      //Moc code
      jest.spyOn(crypto, 'randomUUID').mockImplementation(() => mockedUUID);

      const response = await request(httpServer)
        .post('/auth/registration-email-resending')
        .send({ email: userLoginData.email })
        .expect(400);

      expect(response.body.errorsMessages[0].field).toBe('email');
      expect(jestSpyEmail).toBeCalled();
    });
  });

  describe('login', () => {
    beforeAll(async () => {
      jest.clearAllMocks();
      mockdate.reset();
    });
    it('login user with good data', async () => {
      const repspone = await authTestManager.login(userLoginData.email, userLoginData.password, 200);
      //regEx for JWT token [\w-]*\.[\w-]*\.[\w-]*/g
      expect(repspone.body.accessToken).toMatch(/^[\w-]*\.[\w-]*\.[\w-]*/);
    });
    it('cant login user with incorrect pass | email', async () => {
      await authTestManager.login(userLoginData.email, '123456', 401);
      await authTestManager.login('ugaChagaUga@bebe.com', userLoginData.password, 401);
    });
  });

  describe('password recovery', () => {
    beforeAll(async () => {
      jest.clearAllMocks();
      mockdate.reset();
    });
    it('shloudn"t send new password recovery code with incorrect email', async () => {
      await request(httpServer).post('/auth/password-recovery').send({ email: '123@mail.ru' }).expect(204);

      expect(jestSpyEmail).not.toBeCalled();
    });
    it('send new password recovery code', async () => {
      await request(httpServer).post('/auth/password-recovery').send({ email: userLoginData.email }).expect(204);

      expect(jestSpyEmail).toBeCalled();
    });

    it('should change user password', async () => {
      //Мок на проверку jwt
      jest
        .spyOn(RecoveryCodeIsValidConstraint.prototype, 'validate')
        .mockImplementation(async () => Promise.resolve(true));
      //Мок на доставание емэйла из jwt
      jest.spyOn(JwtService.prototype, 'decode').mockImplementation(() => ({ email: userLoginData.email }));

      await request(httpServer)
        .post('/auth/new-password')
        .send({
          newPassword: '111111',
          recoveryCode: '123132',
        })
        .expect(204);
    });
    it('should login with new password', async () => {
      const repsponse = await authTestManager.login(userLoginData.email, '111111', 200);
      //regEx for JWT token [\w-]*\.[\w-]*\.[\w-]*/g
      expect(repsponse.body.accessToken).toMatch(/^[\w-]*\.[\w-]*\.[\w-]*/);
    });
  });
  describe('about me', () => {
    it('should"nt return user information (jwt token no valid)', async () => {
      await request(httpServer).get('/auth/me').set('Authorization', `Bearer sdasd`).expect(401);
    });
    it('get about me', async () => {
      const repsponse = await authTestManager.login(userLoginData.email, '111111', 200);

      const aboutMeResponse = await request(httpServer)
        .get('/auth/me')
        .set('Authorization', `Bearer ${repsponse.body.accessToken}`)
        .expect(200);
      expect(aboutMeResponse.body.email).toEqual(userLoginData.email);
      expect(aboutMeResponse.body.login).toEqual(userLoginData.login);
      expect(aboutMeResponse.body.userId).toEqual(expect.any(String));
    });
  });
});
