import React, { useState, useEffect } from 'react'
import Header from '../components/Header/Header'
import StationSelect from '../components/StationSelect/StationSelect'
import { queryTickets, TicketResult } from '../services/tickets'
import './Tickets.css'

const TicketsPage: React.FC = () => {
    const [from, setFrom] = useState('')
    const [to, setTo] = useState('')
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [results, setResults] = useState<TicketResult[]>([])
    // filter state
    const [selectedTrainTypes, setSelectedTrainTypes] = useState<Record<string, boolean>>({ G: true, D: true, C: true, T: true, K: true, OTHER: true })
    const [selectedTimeRanges, setSelectedTimeRanges] = useState<Record<string, boolean>>({ '00-06': true, '06-12': true, '12-18': true, '18-24': true })
    const RECENT_KEY = 'tickets_recent_searches'
    const [recent, setRecent] = useState<Array<{ from: string; to: string; date: string }>>([])

    useEffect(() => {
        try {
            const raw = localStorage.getItem(RECENT_KEY)
            if (raw) setRecent(JSON.parse(raw))
        } catch (e) {
            setRecent([])
        }
    }, [])

    function pushRecent(item: { from: string; to: string; date: string }) {
        try {
            const merged = [item, ...recent.filter(r => !(r.from === item.from && r.to === item.to && r.date === item.date))]
            const sliced = merged.slice(0, 3)
            setRecent(sliced)
            localStorage.setItem(RECENT_KEY, JSON.stringify(sliced))
        } catch (e) {
            // ignore
        }
    }

    const onSearch = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!from || !to) {
            setError('请填写出发地与目的地')
            return
        }
        setError(null)
        setLoading(true)
        try {
            const data = await queryTickets(from, to, date)
            setResults(data)
            // save successful query to recent searches
            pushRecent({ from, to, date })
        } catch (err: any) {
            setError(err?.message || '查询失败')
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    function formatDateLabel(offset: number) {
        const d = new Date()
        d.setDate(d.getDate() + offset)
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const dd = String(d.getDate()).padStart(2, '0')
        if (offset === 0) return `今天 ${mm}-${dd}`
        if (offset === 1) return `明天 ${mm}-${dd}`
        return `后天 ${mm}-${dd}`
    }

    function pickRecent(r: { from: string; to: string; date: string }) {
        setFrom(r.from)
        setTo(r.to)
        setDate(r.date)
        // trigger search
        setTimeout(() => onSearch(), 0)
    }

    function detectTrainType(code: string) {
        if (!code) return 'OTHER'
        const c = code[0].toUpperCase()
        if (['G', 'D', 'C', 'T', 'K'].includes(c)) return c
        return 'OTHER'
    }

    function hourOf(t: string) {
        // expect HH:mm or similar
        const m = t.match(/(\d{1,2}):/)
        if (!m) return -1
        return parseInt(m[1], 10)
    }

    function inTimeRanges(hour: number) {
        if (hour < 0) return true
        if (hour >= 0 && hour < 6) return selectedTimeRanges['00-06']
        if (hour >= 6 && hour < 12) return selectedTimeRanges['06-12']
        if (hour >= 12 && hour < 18) return selectedTimeRanges['12-18']
        return selectedTimeRanges['18-24']
    }

    const filteredResults = React.useMemo(() => {
        return results.filter(r => {
            const t = detectTrainType(r.train_code)
            if (!selectedTrainTypes[t]) return false
            const h = hourOf(r.departure_time)
            if (!inTimeRanges(h)) return false
            return true
        })
    }, [results, selectedTrainTypes, selectedTimeRanges])

    function toggleTrainType(t: string) {
        setSelectedTrainTypes(prev => ({ ...prev, [t]: !prev[t] }))
    }

    function toggleTimeRange(rng: string) {
        setSelectedTimeRanges(prev => ({ ...prev, [rng]: !prev[rng] }))
    }

    function clearFilters() {
        setSelectedTrainTypes({ G: true, D: true, C: true, T: true, K: true, OTHER: true })
        setSelectedTimeRanges({ '00-06': true, '06-12': true, '12-18': true, '18-24': true })
    }

    return (
        <div>
            <Header />
            <main className="container tickets-page">
                <h2>车票查询（恢复中）</h2>

                <form className="search-bar" onSubmit={onSearch}>
                    <StationSelect value={from} placeholder="出发地/车站" onChange={setFrom} />
                    <StationSelect value={to} placeholder="目的地/车站" onChange={setTo} />
                    <input className="search-input date-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    <div className="date-tabs">
                        {[0, 1, 2].map(n => (
                            <button key={n} type="button" className={`date-tab ${date === new Date(Date.now() + n * 24 * 3600 * 1000).toISOString().slice(0, 10) ? 'active' : ''}`} onClick={() => { const d = new Date(); d.setDate(d.getDate() + n); setDate(d.toISOString().slice(0, 10)); if (from && to) onSearch() }}>
                                {formatDateLabel(n)}
                            </button>
                        ))}
                    </div>
                    <div className="search-actions">
                        <button className="btn primary" type="submit">{loading ? '查询中...' : '查询'}</button>
                    </div>
                </form>

                {recent.length > 0 && (
                    <div className="recent-searches">
                        <div className="recent-title">最近搜索</div>
                        <div className="recent-list">
                            {recent.map((r, idx) => (
                                <button key={idx} className="recent-item" onClick={() => pickRecent(r)}>{r.from} → {r.to} · {r.date}</button>
                            ))}
                        </div>
                    </div>
                )}

                {error && <div className="error">{error}</div>}

                <div className="filters-bar">
                    <div className="filter-group">
                        <strong>车次类型：</strong>
                        {['G', 'D', 'C', 'T', 'K', 'OTHER'].map(t => (
                            <button key={t} type="button" className={`filter-pill ${selectedTrainTypes[t] ? 'active' : ''}`} onClick={() => toggleTrainType(t)}>{t}</button>
                        ))}
                    </div>
                    <div className="filter-group">
                        <strong>出发时段：</strong>
                        {['00-06', '06-12', '12-18', '18-24'].map(rng => (
                            <button key={rng} type="button" className={`filter-pill ${selectedTimeRanges[rng] ? 'active' : ''}`} onClick={() => toggleTimeRange(rng)}>{rng}</button>
                        ))}
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                        <button type="button" className="btn" onClick={clearFilters}>清除筛选</button>
                    </div>
                </div>

                <section className="tickets-results">
                    <div className="results-header">
                        <div className="count">找到 {filteredResults.length} 个车次</div>
                        <div className="active">已应用筛选：
                            {Object.keys(selectedTrainTypes).filter(k => selectedTrainTypes[k]).join(', ')} · {Object.keys(selectedTimeRanges).filter(k => selectedTimeRanges[k]).join(', ')}
                        </div>
                    </div>
                    {!loading && filteredResults.length === 0 && <div className="empty">暂无查询结果</div>}
                    {filteredResults.map((r) => (
                        <div className="ticket-card" key={r.train_code}>
                            <div className="ticket-header">
                                <strong className="train-code">{r.train_code}</strong>
                                <span className="time">{r.departure_time} → {r.arrival_time}</span>
                            </div>
                            <div className="ticket-body">
                                <div className="stations">{r.from_station} → {r.to_station} · 历时 {r.duration}</div>
                                <div className="prices">
                                    <div>商务: {r.business_seat.available} 张 ¥{r.business_seat.price}</div>
                                    <div>一等: {r.first_class.available} 张 ¥{r.first_class.price}</div>
                                    <div>二等: {r.second_class.available} 张 ¥{r.second_class.price}</div>
                                </div>
                            </div>
                            <div className="ticket-actions">
                                <a className="btn" href={`/tickets/book?train=${encodeURIComponent(r.train_code)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`}>预订</a>
                            </div>
                        </div>
                    ))}
                </section>
            </main>
        </div>
    )
}

export default TicketsPage
