import React from 'react'
import Header from '../components/Header/Header'
import './Tickets.css'

const TicketsPageSimple: React.FC = () => {
    return (
        <div>
            <Header />
            <main className="container tickets-page">
                <h2>车票查询（临时）</h2>
                <p>此为临时页面，用于替代损坏的 `Tickets.tsx`，以便开发服务器恢复。</p>
            </main>
        </div>
    )
}

export default TicketsPageSimple
