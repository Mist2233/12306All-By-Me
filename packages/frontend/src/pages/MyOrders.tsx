import React, { useEffect, useState } from 'react'
import { listOrders, cancelOrder, OrderItem } from '../services/orders'
import './MyOrders.css'

const MyOrders: React.FC = () => {
    const [orders, setOrders] = useState<OrderItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchOrders()
    }, [])

    async function fetchOrders() {
        setLoading(true)
        setError(null)
        try {
            const data = await listOrders()
            setOrders(data)
        } catch (e: any) {
            setError(e.message || '加载订单失败')
        } finally {
            setLoading(false)
        }
    }

    async function handleCancel(id: string) {
        if (!confirm('确定要取消此订单吗？')) return
        try {
            await cancelOrder(id)
            // refresh
            fetchOrders()
        } catch (e: any) {
            alert(e.message || '取消失败')
        }
    }

    return (
        <div className="orders-page container">
            <h2>我的订单</h2>
            {loading && <p>加载中...</p>}
            {error && <p className="error">{error}</p>}
            {!loading && orders.length === 0 && <p>暂无订单。</p>}
            <div className="orders-list">
                {orders.map((o) => (
                    <div className="order-card" key={o.id}>
                        <div className="order-row">
                            <div className="order-train">{o.trainNo} · {o.seatType} · x{o.count}</div>
                            <div className="order-status">{o.status || '已预订'}</div>
                        </div>
                        <div className="order-info">
                            <div>{o.from} → {o.to} · {o.date}</div>
                            <div>乘客：{o.passengerName} ({o.passengerId})</div>
                            <div>联系方式：{o.phone || '-'} / {o.email || '-'}</div>
                        </div>
                        <div className="order-actions">
                            <button className="btn btn-cancel" onClick={() => handleCancel(o.id)}>取消订单</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default MyOrders
