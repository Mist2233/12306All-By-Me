import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { stationsRouter, mockStations } from '../routes/stations.routes';
import { StationFactory } from '@/tests/factories/StationFactory';

// 创建测试应用
const app = express();
app.use(express.json());
app.use('/api/v1/stations', stationsRouter);

describe('GET /api/v1/stations/search', () => {
    beforeEach(async () => {
        // 清空mock数据
        mockStations.length = 0;

        // 创建测试车站
        const beijing = await StationFactory.createBeijing();
        const shanghai = await StationFactory.createShanghai();
        const bengbu = await StationFactory.create({
            station_name: '蚌埠',
            station_code: 'BBH',
            pinyin: 'bengbu',
            pinyin_abbr: 'bb',
        });

        mockStations.push(beijing, shanghai, bengbu);
    });

    afterEach(() => {
        mockStations.length = 0;
    });

    it('拼音搜索应该返回匹配车站', async () => {
        const response = await request(app)
            .get('/api/v1/stations/search?keyword=bei')
            .expect(200);

        expect(response.body.code).toBe(0);
        const stationNames = response.body.data.stations.map((s: any) => s.station_name);
        expect(stationNames).toContain('北京'); // bei匹配beijing
        expect(stationNames).not.toContain('蚌埠'); // bei不匹配bengbu
        expect(stationNames).not.toContain('上海'); // bei不匹配shanghai
    });

    it('拼音简写搜索应该返回匹配车站', async () => {
        const response = await request(app)
            .get('/api/v1/stations/search?keyword=sh')
            .expect(200);

        expect(response.body.code).toBe(0);
        expect(response.body.data.stations).toEqual(
            expect.arrayContaining([expect.objectContaining({ station_name: '上海' })])
        );
    });

    it('汉字搜索应该返回匹配车站', async () => {
        const response = await request(app)
            .get('/api/v1/stations/search')
            .query({ keyword: '北' })
            .expect(200);

        expect(response.body.code).toBe(0);
        expect(response.body.data.stations).toEqual(
            expect.arrayContaining([expect.objectContaining({ station_name: '北京' })])
        );
    });

    it('空关键词应该返回所有车站', async () => {
        const response = await request(app)
            .get('/api/v1/stations/search?keyword=')
            .expect(200);

        expect(response.body.code).toBe(0);
        expect(response.body.data.stations.length).toBeGreaterThanOrEqual(3);
    });

    it('limit参数应该限制返回数量', async () => {
        const response = await request(app)
            .get('/api/v1/stations/search?keyword=&limit=2')
            .expect(200);

        expect(response.body.code).toBe(0);
        expect(response.body.data.stations).toHaveLength(2);
    });
});
