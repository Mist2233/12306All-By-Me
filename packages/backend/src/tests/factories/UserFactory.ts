import { User } from '../../modules/auth/entities/User';

let userIdCounter = 1;

export class UserFactory {
    static async create(data: Partial<User> = {}): Promise<User> {
        const user = new User();
        user.user_id = data.user_id || `test-user-${userIdCounter++}`;
        user.username = data.username || `testuser${Date.now()}`;
        user.email = data.email || `test${Date.now()}@example.com`;
        user.phone = data.phone || `1380013${String(Date.now()).slice(-4)}`;
        user.password = data.password || 'Password123!';
        user.real_name = data.real_name;
        user.id_card = data.id_card;
        user.status = data.status || 'active';
        user.created_at = data.created_at || new Date();
        user.updated_at = data.updated_at || new Date();

        // 手动执行密码哈希
        await user.hashPassword();

        return user;
    }
}
