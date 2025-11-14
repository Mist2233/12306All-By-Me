import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

export interface TicketQueryResult {
    train_code: string
    from_station: string
    to_station: string
    departure_time: string
    arrival_time: string
    duration: string
    business_seat: {
        price: number
        available: number
    }
    first_class: {
        price: number
        available: number
    }
    second_class: {
        price: number
        available: number
    }
}

type ScheduleRecord = {
    id: string
    train_code: string
    from_station: string
    to_station: string
    departure_time: string // HH:mm
    arrival_time: string
    duration_minutes: number
    business_price: number
    first_price: number
    second_price: number
    business_available: number
    first_available: number
    second_available: number
}

type DBShape = {
    schedules: ScheduleRecord[]
    orders?: any[]
}

// __dirname is not defined in ESM; derive directory from import.meta.url
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.resolve(__dirname, '../../data')
const DB_FILE = path.join(DATA_DIR, 'tickets_db.json')

class SimpleDB {
    private data: DBShape = { schedules: [] }

    constructor() {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true })
        }

        if (!fs.existsSync(DB_FILE)) {
            this.seedSample().catch(() => { })
        } else {
            this.load()
        }
    }

    private load() {
        try {
            const raw = fs.readFileSync(DB_FILE, 'utf-8')
            this.data = JSON.parse(raw) as DBShape
        } catch (err) {
            console.warn('Failed to load tickets DB, seeding sample data', err)
            this.seedSample().catch(() => { })
        }
    }

    private async seedSample() {
        // seed with a few sample schedules
        this.data = {
            schedules: [
                {
                    id: 'G101-1',
                    train_code: 'G101',
                    from_station: 'Beijing',
                    to_station: 'Shanghai',
                    departure_time: '08:00',
                    arrival_time: '12:30',
                    duration_minutes: 270,
                    business_price: 1200.0,
                    first_price: 800.0,
                    second_price: 400.0,
                    business_available: 5,
                    first_available: 20,
                    second_available: 120,
                },
                {
                    id: 'D202-1',
                    train_code: 'D202',
                    from_station: 'Beijing',
                    to_station: 'Tianjin',
                    departure_time: '09:15',
                    arrival_time: '10:10',
                    duration_minutes: 55,
                    business_price: 200.0,
                    first_price: 120.0,
                    second_price: 60.0,
                    business_available: 2,
                    first_available: 10,
                    second_available: 200,
                },
                {
                    id: 'K333-1',
                    train_code: 'K333',
                    from_station: 'Guangzhou',
                    to_station: 'Shenzhen',
                    departure_time: '14:00',
                    arrival_time: '18:00',
                    duration_minutes: 240,
                    business_price: 300.0,
                    first_price: 180.0,
                    second_price: 90.0,
                    business_available: 0,
                    first_available: 5,
                    second_available: 80,
                },
            ],
            orders: [],
        }

        await this.persist()
    }

    private async persist() {
        return fs.promises.writeFile(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8')
    }

    public async queryTickets(
        from: string,
        to: string,
        _date: string,
        train_type?: string
    ): Promise<TicketQueryResult[]> {
        const matches = this.data.schedules.filter((s) => s.from_station === from && s.to_station === to)

        const filtered = train_type ? matches.filter((s) => s.train_code.startsWith(train_type)) : matches

        return filtered.map((s) => ({
            train_code: s.train_code,
            from_station: s.from_station,
            to_station: s.to_station,
            departure_time: s.departure_time,
            arrival_time: s.arrival_time,
            duration: `${Math.floor(s.duration_minutes / 60)}h ${s.duration_minutes % 60}m`,
            business_seat: { price: s.business_price, available: s.business_available },
            first_class: { price: s.first_price, available: s.first_available },
            second_class: { price: s.second_price, available: s.second_available },
        }))
    }

    // helper to add schedules (used by admin/seed)
    public async addSchedule(rec: ScheduleRecord) {
        this.data.schedules.push(rec)
        await this.persist()
    }

    public async clear() {
        this.data.schedules = []
        await this.persist()
    }

    // Create an order: reserve a seat and persist order record
    public async createOrder(opts: {
        train_code: string
        from: string
        to: string
        date: string
        seat_type: 'business' | 'first' | 'second'
        passenger_name: string
        passenger_id?: string
    }) {
        const { train_code, seat_type, passenger_name, passenger_id, from, to, date } = opts

        // reserve seat (will persist availability)
        const bookingId = await this.reserveSeat(train_code, seat_type)

        const orderId = `ORD-${Date.now()}`
        const rec = {
            order_id: orderId,
            booking_id: bookingId,
            train_code,
            from,
            to,
            date,
            seat_type,
            passenger_name,
            passenger_id: passenger_id || null,
            status: 'active',
            created_at: new Date().toISOString(),
        }

        if (!this.data.orders) this.data.orders = []
        this.data.orders.push(rec)
        await this.persist()

        return rec
    }

    public async getOrder(order_id: string) {
        if (!this.data.orders) return null
        return this.data.orders.find((o) => o.order_id === order_id) || null
    }

    public async listOrders(filter?: { passenger_name?: string }) {
        if (!this.data.orders) return []
        if (filter?.passenger_name) {
            return this.data.orders.filter((o) => o.passenger_name === filter.passenger_name)
        }
        return this.data.orders
    }

    // Increase availability back when cancelling
    public async unreserveSeat(train_code: string, seat_type: 'business' | 'first' | 'second') {
        const idx = this.data.schedules.findIndex((s) => s.train_code === train_code)
        if (idx === -1) throw new Error('Train not found')
        const rec = this.data.schedules[idx]
        if (seat_type === 'business') {
            rec.business_available = (rec.business_available || 0) + 1
        } else if (seat_type === 'first') {
            rec.first_available = (rec.first_available || 0) + 1
        } else {
            rec.second_available = (rec.second_available || 0) + 1
        }
        await this.persist()
    }

    public async cancelOrder(order_id: string) {
        if (!this.data.orders) throw new Error('No orders')
        const idx = this.data.orders.findIndex((o) => o.order_id === order_id)
        if (idx === -1) throw new Error('Order not found')
        const ord = this.data.orders[idx]
        if (ord.status !== 'active') throw new Error('Order is not active')

        // unreserve seat
        await this.unreserveSeat(ord.train_code, ord.seat_type)

        ord.status = 'cancelled'
        ord.cancelled_at = new Date().toISOString()
        await this.persist()
        return ord
    }

    /**
     * Reserve a seat of the given type on a train. Returns a booking id on success.
     */
    public async reserveSeat(train_code: string, seat_type: 'business' | 'first' | 'second') {
        const idx = this.data.schedules.findIndex((s) => s.train_code === train_code)
        if (idx === -1) throw new Error('Train not found')
        const rec = this.data.schedules[idx]

        if (seat_type === 'business') {
            if (rec.business_available <= 0) throw new Error('无可用商务座')
            rec.business_available = Math.max(0, rec.business_available - 1)
        } else if (seat_type === 'first') {
            if (rec.first_available <= 0) throw new Error('无可用一等座')
            rec.first_available = Math.max(0, rec.first_available - 1)
        } else {
            if (rec.second_available <= 0) throw new Error('无可用二等座')
            rec.second_available = Math.max(0, rec.second_available - 1)
        }

        await this.persist()

        // simple booking id
        return `${train_code}-${Date.now()}`
    }
}

const db = new SimpleDB()
export default db
