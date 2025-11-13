import request from 'supertest';
import express from 'express';
import ticketsRouter, { setMockTickets, clearMockTickets } from '../routes/tickets.routes';

const app = express();
app.use(express.json());
app.use('/api/v1/tickets', ticketsRouter);

describe('GET /api/v1/tickets/query - 车票查询API', () => {
    beforeEach(() => {
        clearMockTickets();
        // 添加测试数据
        setMockTickets([
            {
                train_code: 'G1',
                from_station: '北京',
                to_station: '上海',
                departure_time: '08:00',
                arrival_time: '13:00',
                duration: '5小时',
                business_seat: { price: 1750, available: 10 },
                first_class: { price: 933, available: 50 },
                second_class: { price: 553, available: 200 },
            },
            {
                train_code: 'D123',
                from_station: '北京',
                to_station: '上海',
                departure_time: '09:30',
                arrival_time: '16:00',
                duration: '6.5小时',
                business_seat: { price: 1500, available: 5 },
                first_class: { price: 800, available: 30 },
                second_class: { price: 500, available: 150 },
            },
            {
                train_code: 'G2',
                from_station: '上海',
                to_station: '广州',
                departure_time: '10:00',
                arrival_time: '18:00',
                duration: '8小时',
                business_seat: { price: 2000, available: 8 },
                first_class: { price: 1100, available: 40 },
                second_class: { price: 650, available: 180 },
            },
        ]);
    });

    afterEach(() => {
        clearMockTickets();
    });

    it('缺少必填参数应该返回400错误', async () => {
        const response = await request(app)
            .get('/api/v1/tickets/query')
            .query({ from: '北京' }); // 缺少to和date

        expect(response.status).toBe(400);
        expect(response.body.code).toBe(1);
        expect(response.body.message).toContain('必填参数');
    });

    it('日期格式错误应该返回400错误', async () => {
        const response = await request(app)
            .get('/api/v1/tickets/query')
            .query({ from: '北京', to: '上海', date: '2024/01/01' }); // 错误的日期格式

        expect(response.status).toBe(400);
        expect(response.body.code).toBe(1);
        expect(response.body.message).toContain('日期格式错误');
    });

    it('正确查询应该返回匹配的车票', async () => {
        const response = await request(app)
            .get('/api/v1/tickets/query')
            .query({ from: '北京', to: '上海', date: '2024-01-01' });

        expect(response.status).toBe(200);
        expect(response.body.code).toBe(0);
        expect(response.body.data.tickets).toHaveLength(2);
        expect(response.body.data.tickets[0].train_code).toBe('G1');
        expect(response.body.data.tickets[1].train_code).toBe('D123');
    });

    it('按车次类型筛选应该返回对应类型的车票', async () => {
        const response = await request(app)
            .get('/api/v1/tickets/query')
            .query({ from: '北京', to: '上海', date: '2024-01-01', train_type: 'G' });

        expect(response.status).toBe(200);
        expect(response.body.code).toBe(0);
        expect(response.body.data.tickets).toHaveLength(1);
        expect(response.body.data.tickets[0].train_code).toBe('G1');
    });
});
