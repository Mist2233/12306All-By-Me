import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { authRouter, mockUsers } from '../routes/auth.routes';
import { UserFactory } from '@/tests/factories/UserFactory';

// 创建测试应用
const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRouter);

describe('POST /api/v1/auth/login', () => {
  let user: any;

  beforeEach(async () => {
    // 清空mock数据
    mockUsers.length = 0;

    // 创建测试用户
    user = await UserFactory.create({
      username: 'test_user',
      password: 'Password123!',
      email: 'test@example.com',
      phone: '13800138000',
    });

    mockUsers.push(user);
  });

  afterEach(() => {
    mockUsers.length = 0;
  });

  it('用户名密码正确应该返回Token', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'test_user',
        password: 'Password123!',
        nc_token: 'mock_slide_verify_token',
      })
      .expect(200);

    expect(response.body.code).toBe(0);
    expect(response.body.data).toHaveProperty('access_token');
    expect(response.body.data).toHaveProperty('refresh_token');
    expect(response.body.data).toHaveProperty('expires_in');
    expect(response.body.data.user).toMatchObject({
      user_id: user.user_id,
      username: 'test_user',
      email: 'test@example.com',
    });
  });

  it('邮箱登录应该成功', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'test@example.com',
        password: 'Password123!',
        nc_token: 'mock_slide_verify_token',
      })
      .expect(200);

    expect(response.body.code).toBe(0);
    expect(response.body.data).toHaveProperty('access_token');
  });

  it('手机号登录应该成功', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: '13800138000',
        password: 'Password123!',
        nc_token: 'mock_slide_verify_token',
      })
      .expect(200);

    expect(response.body.code).toBe(0);
    expect(response.body.data).toHaveProperty('access_token');
  });

  it('密码错误应该返回401', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'test_user',
        password: 'WrongPassword',
        nc_token: 'mock_slide_verify_token',
      })
      .expect(401);

    expect(response.body.code).toBe(401);
    expect(response.body.message).toContain('密码错误');
  });

  it('用户不存在应该返回401', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'nonexistent_user',
        password: 'Password123!',
        nc_token: 'mock_slide_verify_token',
      })
      .expect(401);

    expect(response.body.code).toBe(401);
    expect(response.body.message).toContain('用户名或密码错误');
  });

  it('缺少必填字段应该返回400', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'test_user',
        // 缺少password和nc_token
      })
      .expect(400);

    expect(response.body.code).toBe(400);
  });

  it('账号被锁定应该返回403', async () => {
    user.status = 'locked';

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'test_user',
        password: 'Password123!',
        nc_token: 'mock_slide_verify_token',
      })
      .expect(403);

    expect(response.body.code).toBe(403);
    expect(response.body.message).toContain('锁定');
  });

  it('账号已删除应该返回404', async () => {
    user.status = 'deleted';

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'test_user',
        password: 'Password123!',
        nc_token: 'mock_slide_verify_token',
      })
      .expect(404);

    expect(response.body.code).toBe(404);
    expect(response.body.message).toContain('不存在');
  });
});
