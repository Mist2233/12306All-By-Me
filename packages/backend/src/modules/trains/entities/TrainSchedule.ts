import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

@Entity('train_schedules')
export class TrainSchedule {
    @PrimaryGeneratedColumn()
    schedule_id!: number;

    @Column({ type: 'int' })
    @Index()
    train_id!: number;

    @Column({ type: 'int' })
    @Index()
    from_station_id!: number;

    @Column({ type: 'int' })
    @Index()
    to_station_id!: number;

    @Column({ type: 'time' })
    departure_time!: string; // HH:mm:ss

    @Column({ type: 'time' })
    arrival_time!: string;

    @Column({ type: 'int' })
    duration_minutes!: number; // 运行时长(分钟)

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    business_seat_price!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    first_class_price!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    second_class_price!: number;

    @Column({ type: 'int', default: 0 })
    business_seat_available!: number;

    @Column({ type: 'int', default: 0 })
    first_class_available!: number;

    @Column({ type: 'int', default: 0 })
    second_class_available!: number;

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
