import express, { Request, Response } from 'express';
import { Station } from '../entities/Station';

const router = express.Router();

// Mock数据库存储
const mockStations: Station[] = [];

interface StationSearchQuery {
    keyword?: string;
    limit?: string;
}

// GET /api/v1/stations/search
router.get('/search', async (req: Request, res: Response) => {
    try {
        const { keyword = '', limit = '10' } = req.query as StationSearchQuery;
        const limitNum = parseInt(limit, 10);

        // 如果没有关键词，返回所有车站
        if (!keyword || keyword.trim() === '') {
            const results = mockStations.slice(0, limitNum);
            return res.status(200).json({
                code: 0,
                message: '查询成功',
                data: {
                    stations: results,
                },
            });
        }

        // 搜索车站：支持站名、拼音、拼音简写（模糊匹配）
        const keywordLower = keyword.toLowerCase();
        const filtered = mockStations.filter((station) => {
            return (
                station.station_name.includes(keyword) ||
                station.pinyin.toLowerCase().includes(keywordLower) ||
                station.pinyin_abbr.toLowerCase().includes(keywordLower)
            );
        });

        const results = filtered.slice(0, limitNum);

        res.status(200).json({
            code: 0,
            message: '查询成功',
            data: {
                stations: results,
            },
        });
    } catch (error) {
        console.error('Station search error:', error);
        res.status(500).json({
            code: 500,
            message: '服务器内部错误',
        });
    }
});

// GET /api/v1/stations (获取所有车站)
router.get('/', async (req: Request, res: Response) => {
    try {
        res.status(200).json({
            code: 0,
            message: '查询成功',
            data: {
                stations: mockStations,
                total: mockStations.length,
            },
        });
    } catch (error) {
        console.error('Get stations error:', error);
        res.status(500).json({
            code: 500,
            message: '服务器内部错误',
        });
    }
});

export { router as stationsRouter, mockStations };
