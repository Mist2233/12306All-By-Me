import React from 'react'
import Header from '../components/Header/Header'
import './HomePage.css'

const FeatureCard: React.FC<{ title: string, desc?: string }> = ({ title, desc }) => (
    <div className="feature-card">
        <div className="feature-icon">🔷</div>
        <div className="feature-body">
            <div className="feature-title">{title}</div>
            {desc && <div className="feature-desc">{desc}</div>}
        </div>
    </div>
)

const HomePage: React.FC = () => {
    return (
        <div>
            <Header />
            <main>
                <section className="hero">
                    <div className="container hero-inner">
                        <div className="hero-left">
                            <h1>12306铁路购票系统</h1>
                            <p>直刷乘车，出行乐无忧</p>
                        </div>
                        <div className="hero-card">
                            <SearchForm />
                        </div>
                    </div>
                </section>

                <section className="features container">
                    <FeatureCard title="常用查询" desc="车次/余票/价格" />
                    <FeatureCard title="会员服务" desc="积分与权益" />
                    <FeatureCard title="站点服务" desc="站内导览" />
                    <FeatureCard title="订单管理" desc="查看与取消" />
                </section>

                <section className="news container">
                    <h3>最新发布</h3>
                    <ul>
                        <li>公告：2025-11-14 系统维护通知</li>
                        <li>公告：关于车票退改流程调整</li>
                        <li>公告：票务服务升级</li>
                    </ul>
                </section>
            </main>
        </div>
    )
}

export default HomePage

const SearchForm: React.FC = () => {
    const navigate = (window as any).___navigate || ((p: string) => { window.location.href = p })
    // Using react-router's useNavigate isn't possible here without moving SearchForm inside component scope
    // so we'll use a simple inline form handler that builds the query and navigates to /tickets
    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const form = e.target as HTMLFormElement
        const from = (form.elements[0] as HTMLInputElement).value.trim()
        const to = (form.elements[1] as HTMLInputElement).value.trim()
        const date = (form.elements[2] as HTMLInputElement).value
        if (!from || !to || !date) {
            alert('请填写出发地、目的地和日期')
            return
        }
        const url = `/tickets?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`
        window.location.href = url
    }

    return (
        <form className="search-form" onSubmit={onSubmit}>
            <div className="form-row">
                <input placeholder="出发地/车站" />
                <input placeholder="目的地/车站" />
            </div>
            <div className="form-row">
                <input type="date" />
                <button className="btn primary">查询</button>
            </div>
        </form>
    )
}
