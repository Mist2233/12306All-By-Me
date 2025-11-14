import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Deconstructed from './pages/Deconstructed'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import SignupPage from './pages/SignupPage'
import TicketsPage from './pages/Tickets'
import TicketsBook from './pages/TicketsBook'
import MyOrders from './pages/MyOrders'

function App() {
    return (
        <Router>
            <div className="app">
                <h1>12306铁路购票系统</h1>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/tickets" element={<TicketsPage />} />
                    <Route path="/tickets/book" element={<TicketsBook />} />
                    <Route path="/orders" element={<MyOrders />} />
                    <Route path="/deconstructed" element={<Deconstructed />} />
                </Routes>
            </div>
        </Router>
    )
}

export default App
