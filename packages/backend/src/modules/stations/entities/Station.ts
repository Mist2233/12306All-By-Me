import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

@Entity('stations')
export class Station {
    @PrimaryGeneratedColumn()
    station_id!: number;

    @Column({ type: 'varchar', length: 10, unique: true })
    @Index()
    station_code!: string;

    @Column({ type: 'varchar', length: 50 })
    @Index()
    station_name!: string;

    @Column({ type: 'varchar', length: 100 })
    @Index()
    pinyin!: string;

    @Column({ type: 'varchar', length: 20 })
    @Index()
    pinyin_abbr!: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    province?: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    city?: string;

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
