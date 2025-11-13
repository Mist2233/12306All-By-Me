import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
    return (
        <Router>
            <div className="app">
                <h1>12306铁路购票系统</h1>
                <Routes>
                    <Route path="/" element={<div>首页</div>} />
                    <Route path="/login" element={<div>登录</div>} />
                </Routes>
            </div>
        </Router>
    )
}

export default App
