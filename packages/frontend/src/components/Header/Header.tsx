import React from 'react'
import { Link } from 'react-router-dom'
import './Header.css'

const Header: React.FC = () => {
    return (
        <header className="site-header">
            <div className="container header-inner">
                <div className="logo">12306</div>
                <nav className="main-nav">
                    <Link to="/">首页</Link>
                    <Link to="/tickets">车票</Link>
                    <Link to="/orders">我的订单</Link>
                    <a href="#">服务</a>
                    <a href="#">出行指南</a>
                    <Link to="/login">登录</Link>
                    <Link to="/signup">注册</Link>
                </nav>
            </div>
        </header>
    )
}

export default Header
