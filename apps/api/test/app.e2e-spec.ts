import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { describe, it, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import cookieParser from 'cookie-parser';

describe('Auth API with HttpOnly Cookies (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same setup as main.ts
    // BigInt serialization
    (BigInt.prototype as any).toJSON = function () {
      return this.toString();
    };

    app.use(cookieParser());
    app.setGlobalPrefix('api');
    app.enableCors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3001',
      credentials: true,
    });

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/auth/login', () => {
    it('should set refreshToken as HttpOnly cookie and return accessToken in body', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'kim@emotion.co.kr',
          password: 'password123',
        });

      // Verify HTTP status
      expect(response.status).toBe(200);

      // Verify response body contains accessToken but NOT refreshToken
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).not.toHaveProperty('refreshToken');

      // Verify refreshToken cookie is set
      const cookies = response.headers['set-cookie'] as unknown as string[] | undefined;
      expect(cookies).toBeDefined();
      expect(Array.isArray(cookies)).toBe(true);

      const refreshTokenCookie = cookies?.find((cookie) =>
        cookie.startsWith('refreshToken=')
      );
      expect(refreshTokenCookie).toBeDefined();

      // Verify cookie attributes
      expect(refreshTokenCookie).toContain('HttpOnly');
      expect(refreshTokenCookie).toContain('Path=/api/auth/refresh');
      expect(refreshTokenCookie).toContain('SameSite=Strict');
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'invalid@emotion.co.kr',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);

      // No cookie should be set on failed login
      const cookies = response.headers['set-cookie'] as unknown as string[] | undefined;
      const refreshTokenCookie = cookies?.find((cookie) =>
        cookie.startsWith('refreshToken=')
      );
      expect(refreshTokenCookie).toBeUndefined();
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should accept refreshToken from cookie and return new accessToken', async () => {
      // Step 1: Login to get initial cookie
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'kim@emotion.co.kr',
          password: 'password123',
        });

      const cookies = loginResponse.headers['set-cookie'] as unknown as string[] | undefined;
      const refreshTokenCookie = cookies?.find((cookie) =>
        cookie.startsWith('refreshToken=')
      );

      expect(refreshTokenCookie).toBeDefined();

      // Step 2: Use refresh endpoint with cookie
      const refreshResponse = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Cookie', refreshTokenCookie!)
        .send({}); // Empty body

      // Verify response
      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.body.data).toHaveProperty('accessToken');
      expect(refreshResponse.body.data).toHaveProperty('user');
      expect(refreshResponse.body.data).not.toHaveProperty('refreshToken');

      // Verify new cookie is set
      const newCookies = refreshResponse.headers['set-cookie'] as unknown as string[] | undefined;
      const newRefreshTokenCookie = newCookies?.find((cookie) =>
        cookie.startsWith('refreshToken=')
      );
      expect(newRefreshTokenCookie).toBeDefined();
      expect(newRefreshTokenCookie).toContain('HttpOnly');
    });

    it('should return 401 without cookie', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({});

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear refreshToken cookie on logout', async () => {
      // Step 1: Login
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'kim@emotion.co.kr',
          password: 'password123',
        });

      const accessToken = loginResponse.body.data.accessToken;

      // Step 2: Logout
      const logoutResponse = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send();

      expect(logoutResponse.status).toBe(200);

      // Verify cookie is cleared
      const cookies = logoutResponse.headers['set-cookie'] as unknown as string[] | undefined;
      const clearedCookie = cookies?.find((cookie) =>
        cookie.startsWith('refreshToken=')
      );

      expect(clearedCookie).toBeDefined();
      // Cleared cookie should have empty value or Max-Age=0
      expect(
        clearedCookie?.includes('Max-Age=0') ||
        clearedCookie?.includes('Expires=Thu, 01 Jan 1970')
      ).toBe(true);
    });
  });
});
