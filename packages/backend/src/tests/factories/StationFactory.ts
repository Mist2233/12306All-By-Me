import { Station } from '../../modules/stations/entities/Station';

export class StationFactory {
    static async createBeijing(): Promise<Station> {
        const station = new Station();
        station.station_code = 'BJP';
        station.station_name = '北京';
        station.pinyin = 'beijing';
        station.pinyin_abbr = 'bj';
        station.province = '北京';
        station.city = '北京';
        station.is_active = true;
        station.created_at = new Date();
        station.updated_at = new Date();
        return station;
    }

    static async createShanghai(): Promise<Station> {
        const station = new Station();
        station.station_code = 'SHH';
        station.station_name = '上海';
        station.pinyin = 'shanghai';
        station.pinyin_abbr = 'sh';
        station.province = '上海';
        station.city = '上海';
        station.is_active = true;
        station.created_at = new Date();
        station.updated_at = new Date();
        return station;
    }

    static async create(data: Partial<Station> = {}): Promise<Station> {
        const station = new Station();
        station.station_code = data.station_code || `STN${Date.now()}`;
        station.station_name = data.station_name || '测试车站';
        station.pinyin = data.pinyin || 'test';
        station.pinyin_abbr = data.pinyin_abbr || 'test';
        station.province = data.province;
        station.city = data.city;
        station.is_active = data.is_active !== undefined ? data.is_active : true;
        station.created_at = data.created_at || new Date();
        station.updated_at = data.updated_at || new Date();
        return station;
    }
}
