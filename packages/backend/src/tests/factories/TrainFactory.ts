import { Train } from '../../modules/trains/entities/Train';
import { TrainSchedule } from '../../modules/trains/entities/TrainSchedule';

export class TrainFactory {
    static async createG1(scheduleData: Partial<TrainSchedule> = {}): Promise<{ train: Train; schedule: TrainSchedule }> {
        const train = new Train();
        train.train_code = 'G1';
        train.train_type = '高铁';
        train.is_active = true;
        train.created_at = new Date();
        train.updated_at = new Date();

        const schedule = new TrainSchedule();
        schedule.train_id = train.train_id || 1;
        schedule.from_station_id = scheduleData.from_station_id || 1;
        schedule.to_station_id = scheduleData.to_station_id || 2;
        schedule.departure_time = scheduleData.departure_time || '08:00:00';
        schedule.arrival_time = scheduleData.arrival_time || '13:00:00';
        schedule.duration_minutes = scheduleData.duration_minutes || 300;
        schedule.business_seat_price = scheduleData.business_seat_price || 1750.0;
        schedule.first_class_price = scheduleData.first_class_price || 933.0;
        schedule.second_class_price = scheduleData.second_class_price || 553.0;
        schedule.business_seat_available = scheduleData.business_seat_available || 10;
        schedule.first_class_available = scheduleData.first_class_available || 50;
        schedule.second_class_available = scheduleData.second_class_available || 200;
        schedule.is_active = true;
        schedule.created_at = new Date();
        schedule.updated_at = new Date();

        return { train, schedule };
    }

    static async create(data: Partial<Train> = {}, scheduleData: Partial<TrainSchedule> = {}): Promise<{ train: Train; schedule: TrainSchedule }> {
        const train = new Train();
        train.train_code = data.train_code || `T${Date.now()}`;
        train.train_type = data.train_type || '普通';
        train.is_active = data.is_active !== undefined ? data.is_active : true;
        train.created_at = data.created_at || new Date();
        train.updated_at = data.updated_at || new Date();

        const schedule = new TrainSchedule();
        schedule.train_id = train.train_id || Date.now();
        schedule.from_station_id = scheduleData.from_station_id || 1;
        schedule.to_station_id = scheduleData.to_station_id || 2;
        schedule.departure_time = scheduleData.departure_time || '08:00:00';
        schedule.arrival_time = scheduleData.arrival_time || '12:00:00';
        schedule.duration_minutes = scheduleData.duration_minutes || 240;
        schedule.business_seat_price = scheduleData.business_seat_price || 500.0;
        schedule.first_class_price = scheduleData.first_class_price || 300.0;
        schedule.second_class_price = scheduleData.second_class_price || 180.0;
        schedule.business_seat_available = scheduleData.business_seat_available || 5;
        schedule.first_class_available = scheduleData.first_class_available || 20;
        schedule.second_class_available = scheduleData.second_class_available || 100;
        schedule.is_active = true;
        schedule.created_at = scheduleData.created_at || new Date();
        schedule.updated_at = scheduleData.updated_at || new Date();

        return { train, schedule };
    }
}
