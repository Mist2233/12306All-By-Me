import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert,
    BeforeUpdate,
} from 'typeorm';
import bcrypt from 'bcrypt';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    user_id!: string;

    @Column({ type: 'varchar', length: 50, unique: true })
    username!: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    email!: string;

    @Column({ type: 'varchar', length: 20, unique: true })
    phone!: string;

    @Column({ type: 'varchar', length: 255 })
    password_hash!: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    real_name?: string;

    @Column({ type: 'varchar', length: 18, nullable: true })
    id_card?: string;

    @Column({ type: 'enum', enum: ['active', 'locked', 'deleted'], default: 'active' })
    status!: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @Column({ type: 'datetime', nullable: true })
    deleted_at?: Date;

    // 临时字段，不保存到数据库
    password?: string;

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        if (this.password) {
            this.password_hash = await bcrypt.hash(this.password, 10);
            delete this.password;
        }
    }

    async comparePassword(plainPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, this.password_hash);
    }

    toJSON() {
        const { password_hash, password, deleted_at, ...rest } = this as any;
        return rest;
    }
}
