import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../entities/User';

const router = express.Router();

// Mock数据库存储 (实际应该用TypeORM Repository)
const mockUsers: User[] = [];

interface LoginRequest {
    username: string;
    password: string;
    nc_token: string;
}

interface LoginResponse {
    code: number;
    message: string;
    data?: {
        access_token: string;
        refresh_token: string;
        expires_in: number;
        user: {
            user_id: string;
            username: string;
            email: string;
            phone: string;
        };
    };
}

// POST /api/v1/auth/login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password, nc_token } = req.body as LoginRequest;

        // 验证必填字段
        if (!username || !password || !nc_token) {
            return res.status(400).json({
                code: 400,
                message: '用户名、密码和滑动验证token不能为空',
            } as LoginResponse);
        }

        // 查找用户 (支持用户名/邮箱/手机号登录)
        const user = mockUsers.find(
            (u) =>
                u.username === username || u.email === username || u.phone === username
        );

        if (!user) {
            return res.status(401).json({
                code: 401,
                message: '用户名或密码错误',
            } as LoginResponse);
        }

        // 验证密码
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                code: 401,
                message: '用户名或密码错误',
            } as LoginResponse);
        }

        // 检查用户状态
        if (user.status === 'locked') {
            return res.status(403).json({
                code: 403,
                message: '账号已被锁定，请联系管理员',
            } as LoginResponse);
        }

        if (user.status === 'deleted') {
            return res.status(404).json({
                code: 404,
                message: '用户不存在',
            } as LoginResponse);
        }

        // 生成JWT Token
        const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-12306';
        const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

        const access_token = jwt.sign(
            {
                user_id: user.user_id,
                username: user.username,
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
        );

        const refresh_token = jwt.sign(
            {
                user_id: user.user_id,
                type: 'refresh',
            },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        // 返回成功响应
        res.status(200).json({
            code: 0,
            message: '登录成功',
            data: {
                access_token,
                refresh_token,
                expires_in: 7 * 24 * 60 * 60, // 7天（秒）
                user: {
                    user_id: user.user_id,
                    username: user.username,
                    email: user.email,
                    phone: user.phone,
                },
            },
        } as LoginResponse);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            code: 500,
            message: '服务器内部错误',
        } as LoginResponse);
    }
});

// 导出router和mockUsers供测试使用
export { router as authRouter, mockUsers };
