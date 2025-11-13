import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

@Entity('trains')
export class Train {
    @PrimaryGeneratedColumn()
    train_id!: number;

    @Column({ type: 'varchar', length: 20, unique: true })
    @Index()
    train_code!: string; // G1, D123, K456

    @Column({ type: 'varchar', length: 10 })
    train_type!: string; // 高铁G, 动车D, 快速K

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
