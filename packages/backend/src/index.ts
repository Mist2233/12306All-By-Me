import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { authRouter, mockUsers } from './modules/auth/routes/auth.routes'
import ticketsRouter from './modules/trains/routes/tickets.routes'
import db from './lib/db'
import bcrypt from 'bcrypt'
import { User } from './modules/auth/entities/User'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// 中间件
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API路由
app.get('/api/v1', (req, res) => {
    res.json({ message: '12306 Railway System API v1' })
})

// mount auth router
app.use('/api/v1/auth', authRouter)

// mount tickets router
app.use('/api/v1/tickets', ticketsRouter)

    // seed a demo user into mockUsers if empty
    ; (async () => {
        try {
            if (mockUsers.length === 0) {
                const demoPassword = process.env.DEMO_USER_PASSWORD || 'Password123!'
                const hash = await bcrypt.hash(demoPassword, 10)
                const demoUser = new User()
                demoUser.user_id = 'demo-user-1'
                demoUser.username = 'demo'
                demoUser.email = 'demo@example.com'
                demoUser.phone = '13800000000'
                demoUser.password_hash = hash
                demoUser.status = 'active'
                mockUsers.push(demoUser)
                console.log('Seeded demo user: demo /', demoPassword)
            }
        } catch (err) {
            console.error('Failed to seed demo user', err)
        }
    })()

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`)
    console.log(`📍 http://localhost:${PORT}`)
})

export default app
