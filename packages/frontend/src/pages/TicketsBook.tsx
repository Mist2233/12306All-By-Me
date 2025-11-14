import React, { useState, useEffect } from 'react'
import Header from '../components/Header/Header'
import { useSearchParams } from 'react-router-dom'
import { bookTicket } from '../services/bookings'
import './Tickets.css'

const TicketsBook: React.FC = () => {
    const [searchParams] = useSearchParams()
    const train = searchParams.get('train') || ''
    const from = searchParams.get('from') || ''
    const to = searchParams.get('to') || ''
    const date = searchParams.get('date') || ''

    const [seatType, setSeatType] = useState<'business' | 'first' | 'second'>('second')
    const [name, setName] = useState('')
    const [pid, setPid] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [count, setCount] = useState<number>(1)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<string | null>(null)

    useEffect(() => {
        if (train) {
            // default seat preference can be derived from availability later
        }
    }, [train])

    const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
    const validatePhone = (v: string) => /^[0-9\-\+\s]{7,20}$/.test(v)

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage(null)

        if (!name) return setMessage('请输入乘客姓名')
        if (email && !validateEmail(email)) return setMessage('请输入有效的邮箱地址')
        if (phone && !validatePhone(phone)) return setMessage('请输入有效的联系电话')
        if (count < 1 || count > 10) return setMessage('购票数量范围 1-10')

        setLoading(true)
        try {
            const results: string[] = []
            for (let i = 0; i < count; i++) {
                // attempt booking sequentially
                // if any booking fails, throw and stop
                // eslint-disable-next-line no-await-in-loop
                const payload = await bookTicket({
                    train_code: train,
                    from,
                    to,
                    date,
                    seat_type: seatType,
                    passenger_name: name,
                    passenger_id: pid || undefined,
                })
                results.push(payload.booking_id)
            }

            if (results.length === 1) {
                setMessage(`预订成功，订单号：${results[0]}`)
            } else {
                setMessage(`批量预订成功，共 ${results.length} 张，订单号示例：${results[0]}`)
            }
        } catch (err: any) {
            setMessage(err.message || '预订失败')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <Header />
            <main className="container tickets-page">
                <h2>预订车票</h2>
                <div className="booking-summary">
                    <div><strong>车次：</strong>{train}</div>
                    <div><strong>区间：</strong>{from} → {to}</div>
                    <div><strong>日期：</strong>{date}</div>
                </div>

                <form onSubmit={onSubmit} className="booking-form">
                    <label>座席类型</label>
                    <div>
                        <label><input type="radio" checked={seatType === 'business'} onChange={() => setSeatType('business')} /> 商务</label>
                        <label style={{ marginLeft: 12 }}><input type="radio" checked={seatType === 'first'} onChange={() => setSeatType('first')} /> 一等</label>
                        <label style={{ marginLeft: 12 }}><input type="radio" checked={seatType === 'second'} onChange={() => setSeatType('second')} /> 二等</label>
                    </div>

                    <label>乘客姓名</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} />

                    <label>证件号（选填）</label>
                    <input value={pid} onChange={(e) => setPid(e.target.value)} />

                    <label>联系人手机号（选填）</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />

                    <label>联系人邮箱（选填）</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

                    <label>购票数量</label>
                    <div className="inline">
                        <input type="number" min={1} max={10} value={count} onChange={(e) => setCount(Number(e.target.value))} />
                        <div style={{ fontSize: 12, color: '#666' }}>（最多一次可购 10 张）</div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <button className="btn primary" disabled={loading}>{loading ? '提交中…' : '确认预订'}</button>
                    </div>
                </form>

                {message && <div className="notice" style={{ marginTop: 12 }}>{message}</div>}
            </main>
        </div>
    )
}

export default TicketsBook
