import express, { Request, Response } from 'express';

const router = express.Router();

// Mock data for tickets query
interface TicketQueryResult {
    train_code: string;
    from_station: string;
    to_station: string;
    departure_time: string;
    arrival_time: string;
    duration: string;
    business_seat: {
        price: number;
        available: number;
    };
    first_class: {
        price: number;
        available: number;
    };
    second_class: {
        price: number;
        available: number;
    };
}

let mockTickets: TicketQueryResult[] = [];

/**
 * GET /api/v1/tickets/query
 * 查询车票信息
 * Query Parameters:
 * - from: 出发站(必填)
 * - to: 到达站(必填)
 * - date: 出发日期 YYYY-MM-DD(必填)
 * - train_type: 车次类型(可选, G/D/K等)
 */
router.get('/query', (req: Request, res: Response) => {
    const { from, to, date, train_type } = req.query;

    // 参数验证
    if (!from || !to || !date) {
        return res.status(400).json({
            code: 1,
            message: '出发站、到达站和日期为必填参数',
            data: null,
        });
    }

    // 日期格式验证
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date as string)) {
        return res.status(400).json({
            code: 1,
            message: '日期格式错误，应为YYYY-MM-DD',
            data: null,
        });
    }

    // 筛选车票
    let results = mockTickets.filter(
        (ticket) =>
            ticket.from_station === from && ticket.to_station === to
    );

    // 按车次类型筛选
    if (train_type) {
        results = results.filter((ticket) =>
            ticket.train_code.startsWith(train_type as string)
        );
    }

    return res.json({
        code: 0,
        message: '查询成功',
        data: {
            tickets: results,
            query_date: date,
        },
    });
});

// 测试辅助函数 - 仅用于测试环境
export function setMockTickets(tickets: TicketQueryResult[]) {
    mockTickets = tickets;
}

export function clearMockTickets() {
    mockTickets = [];
}

export default router;
