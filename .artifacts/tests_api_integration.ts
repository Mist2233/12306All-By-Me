# 12306系统后端API集成测试用例

生成日期: 2025 - 11 - 13
TestGenerator Agent: Backend Test Engineer
测试框架: Jest + Supertest + TypeORM

---

## 1. 认证接口测试

### 1.1 用户登录接口
    ```typescript
// src/modules/auth/__tests__/login.test.ts
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import request from 'supertest'
import { app } from '@/app'
import { UserFactory } from '@/tests/factories/UserFactory'
import { getConnection } from 'typeorm'

describe('POST /api/v1/auth/login', () => {
  let user: any

  beforeEach(async () => {
    // 清空数据库
    await getConnection().synchronize(true)
    
    // 创建测试用户
    user = await UserFactory.create({
      username: 'test_user',
      password: 'Password123!', // 会被BCrypt加密
      email: 'test@example.com',
      phone: '13800138000',
    })
  })

  afterEach(async () => {
    await getConnection().query('DELETE FROM users')
    await getConnection().query('DELETE FROM user_sessions')
  })

  it('用户名密码正确应该返回Token', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'test_user',
        password: 'Password123!',
        nc_token: 'mock_slide_verify_token',
      })
      .expect(200)

    expect(response.body.code).toBe(0)
    expect(response.body.data).toHaveProperty('access_token')
    expect(response.body.data).toHaveProperty('refresh_token')
    expect(response.body.data).toHaveProperty('expires_in')
    expect(response.body.data.user).toMatchObject({
      user_id: user.user_id,
      username: 'test_user',
      email: 'test@example.com',
    })
    
    // 验证session已创建
    const sessions = await getConnection().query(
      'SELECT * FROM user_sessions WHERE user_id = ?',
      [user.user_id]
    )
    expect(sessions).toHaveLength(1)
  })

  it('邮箱登录应该成功', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'test@example.com', // 使用邮箱
        password: 'Password123!',
        nc_token: 'mock_slide_verify_token',
      })
      .expect(200)

    expect(response.body.code).toBe(0)
    expect(response.body.data).toHaveProperty('access_token')
  })

  it('手机号登录应该成功', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: '13800138000', // 使用手机号
        password: 'Password123!',
        nc_token: 'mock_slide_verify_token',
      })
      .expect(200)

    expect(response.body.code).toBe(0)
    expect(response.body.data).toHaveProperty('access_token')
  })

  it('密码错误应该返回401', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'test_user',
        password: 'WrongPassword',
        nc_token: 'mock_slide_verify_token',
      })
      .expect(401)

    expect(response.body.code).toBe(401)
    expect(response.body.message).toBe('用户名或密码输入错误')
    
    // 验证登录失败记录
    const loginLogs = await getConnection().query(
      'SELECT * FROM login_logs WHERE user_id = ? AND status = ?',
      [user.user_id, 'failed']
    )
    expect(loginLogs).toHaveLength(1)
  })

  it('用户不存在应该返回401', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'nonexistent_user',
        password: 'Password123!',
        nc_token: 'mock_slide_verify_token',
      })
      .expect(401)

    expect(response.body.code).toBe(401)
    expect(response.body.message).toBe('用户名或密码输入错误')
  })

  it('缺少滑动验证Token应该返回400', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'test_user',
        password: 'Password123!',
        // 缺少nc_token
      })
      .expect(400)

    expect(response.body.code).toBe(400)
    expect(response.body.message).toContain('nc_token')
  })

  it('参数校验失败应该返回错误', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: '', // 空用户名
        password: '123', // 密码太短
        nc_token: 'mock_token',
      })
      .expect(400)

    expect(response.body.code).toBe(400)
    expect(response.body.message).toContain('参数校验失败')
  })

  it('连续5次登录失败应该锁定账户', async () => {
    // 模拟5次失败登录
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          username: 'test_user',
          password: 'WrongPassword',
          nc_token: 'mock_token',
        })
        .expect(401)
    }

    // 第6次应该提示账户锁定
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'test_user',
        password: 'Password123!', // 正确密码
        nc_token: 'mock_token',
      })
      .expect(423)

    expect(response.body.code).toBe(423)
    expect(response.body.message).toContain('账户已锁定')
  })
})
```

### 1.2 短信验证码接口
    ```typescript
// src/modules/auth/__tests__/sms.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals'
import request from 'supertest'
import { app } from '@/app'
import { UserFactory } from '@/tests/factories/UserFactory'
import { getConnection } from 'typeorm'

describe('POST /api/v1/auth/sms/send', () => {
  let user: any

  beforeEach(async () => {
    await getConnection().synchronize(true)
    user = await UserFactory.create({
      phone: '13800138000',
      id_last_four: '1234',
    })
  })

  it('证件号后4位正确应该发送验证码', async () => {
    const response = await request(app)
      .post('/api/v1/auth/sms/send')
      .send({
        phone: '13800138000',
        id_last_four: '1234',
        nc_token: 'mock_slide_verify_token',
      })
      .expect(200)

    expect(response.body.code).toBe(0)
    expect(response.body.data).toHaveProperty('verification_id')
    
    // 验证验证码已存储
    const codes = await getConnection().query(
      'SELECT * FROM verification_codes WHERE phone = ? AND type = ?',
      ['13800138000', 'login']
    )
    expect(codes).toHaveLength(1)
    expect(codes[0].code).toMatch(/^\d{6}$/) // 6位数字
  })

  it('证件号后4位错误应该返回400', async () => {
    const response = await request(app)
      .post('/api/v1/auth/sms/send')
      .send({
        phone: '13800138000',
        id_last_four: '9999', // 错误的证件号
        nc_token: 'mock_token',
      })
      .expect(400)

    expect(response.body.code).toBe(400)
    expect(response.body.message).toContain('证件号后4位')
  })

  it('手机号不存在应该返回404', async () => {
    const response = await request(app)
      .post('/api/v1/auth/sms/send')
      .send({
        phone: '15900000000',
        id_last_four: '1234',
        nc_token: 'mock_token',
      })
      .expect(404)

    expect(response.body.code).toBe(404)
    expect(response.body.message).toContain('手机号未注册')
  })

  it('60秒内重复请求应该返回429', async () => {
    // 第一次请求
    await request(app)
      .post('/api/v1/auth/sms/send')
      .send({
        phone: '13800138000',
        id_last_four: '1234',
        nc_token: 'mock_token_1',
      })
      .expect(200)

    // 立即再次请求
    const response = await request(app)
      .post('/api/v1/auth/sms/send')
      .send({
        phone: '13800138000',
        id_last_four: '1234',
        nc_token: 'mock_token_2',
      })
      .expect(429)

    expect(response.body.code).toBe(429)
    expect(response.body.message).toContain('60秒后重试')
  })
})

describe('POST /api/v1/auth/sms/verify', () => {
  it('验证码正确应该返回Token', async () => {
    // 先发送验证码
    const sendResponse = await request(app)
      .post('/api/v1/auth/sms/send')
      .send({
        phone: '13800138000',
        id_last_four: '1234',
        nc_token: 'mock_token',
      })

    const { verification_id } = sendResponse.body.data
    
    // 从数据库获取验证码
    const codes = await getConnection().query(
      'SELECT code FROM verification_codes WHERE verification_id = ?',
      [verification_id]
    )
    const code = codes[0].code

    // 验证验证码
    const response = await request(app)
      .post('/api/v1/auth/sms/verify')
      .send({
        verification_id,
        code,
      })
      .expect(200)

    expect(response.body.code).toBe(0)
    expect(response.body.data).toHaveProperty('access_token')
  })

  it('验证码错误应该返回400', async () => {
    const sendResponse = await request(app)
      .post('/api/v1/auth/sms/send')
      .send({
        phone: '13800138000',
        id_last_four: '1234',
        nc_token: 'mock_token',
      })

    const { verification_id } = sendResponse.body.data

    const response = await request(app)
      .post('/api/v1/auth/sms/verify')
      .send({
        verification_id,
        code: '000000', // 错误验证码
      })
      .expect(400)

    expect(response.body.code).toBe(400)
    expect(response.body.message).toContain('验证码错误')
  })

  it('验证码过期应该返回400', async () => {
    // 创建过期验证码
    await getConnection().query(
      `INSERT INTO verification_codes(verification_id, phone, code, type, expires_at)
VALUES(?, ?, ?, ?, ?)`,
      ['expired_id', '13800138000', '123456', 'login', new Date(Date.now() - 1000)]
    )

    const response = await request(app)
      .post('/api/v1/auth/sms/verify')
      .send({
        verification_id: 'expired_id',
        code: '123456',
      })
      .expect(400)

    expect(response.body.code).toBe(400)
    expect(response.body.message).toContain('已过期')
  })
})
```

### 1.3 二维码登录接口
    ```typescript
// src/modules/auth/__tests__/qrcode.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals'
import request from 'supertest'
import { app } from '@/app'
import { getConnection } from 'typeorm'

describe('POST /api/v1/auth/qrcode/generate', () => {
  it('应该生成二维码', async () => {
    const response = await request(app)
      .post('/api/v1/auth/qrcode/generate')
      .expect(200)

    expect(response.body.code).toBe(0)
    expect(response.body.data).toHaveProperty('qrcode_id')
    expect(response.body.data).toHaveProperty('qrcode_url')
    expect(response.body.data).toHaveProperty('expires_in', 120)
    
    // 验证二维码Base64格式
    expect(response.body.data.qrcode_url).toMatch(/^data:image\/png;base64,/)
  })
})

describe('GET /api/v1/auth/qrcode/status', () => {
  it('未扫描状态应该返回pending', async () => {
    // 生成二维码
    const genResponse = await request(app)
      .post('/api/v1/auth/qrcode/generate')
    
    const { qrcode_id } = genResponse.body.data

    // 检查状态
    const response = await request(app)
      .get(`/ api / v1 / auth / qrcode / status ? qrcode_id = ${ qrcode_id } `)
      .expect(200)

    expect(response.body.code).toBe(0)
    expect(response.body.data.status).toBe('pending')
  })

  it('二维码过期应该返回expired', async () => {
    // 插入过期二维码
    await getConnection().query(
      `INSERT INTO qrcode_login(qrcode_id, status, expires_at)
VALUES(?, ?, ?)`,
      ['expired_qr', 'pending', new Date(Date.now() - 1000)]
    )

    const response = await request(app)
      .get('/api/v1/auth/qrcode/status?qrcode_id=expired_qr')
      .expect(200)

    expect(response.body.code).toBe(0)
    expect(response.body.data.status).toBe('expired')
  })
})
```

---

## 2. 车站车次接口测试

### 2.1 车站查询接口
    ```typescript
// src/modules/stations/__tests__/search.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals'
import request from 'supertest'
import { app } from '@/app'
import { StationFactory } from '@/tests/factories/StationFactory'
import { getConnection } from 'typeorm'

describe('GET /api/v1/stations/search', () => {
  beforeEach(async () => {
    await getConnection().synchronize(true)
    
    // 创建测试车站
    await StationFactory.createBeijing()
    await StationFactory.createShanghai()
    await StationFactory.create({
      station_name: '蚌埠',
      pinyin: 'bengbu',
      pinyin_abbr: 'bb',
    })
  })

  it('拼音搜索应该返回匹配车站', async () => {
    const response = await request(app)
      .get('/api/v1/stations/search?keyword=bei')
      .expect(200)

    expect(response.body.code).toBe(0)
    expect(response.body.data.stations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ station_name: '北京' }),
        expect.objectContaining({ station_name: '蚌埠' }),
      ])
    )
    expect(response.body.data.stations).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ station_name: '上海' }),
      ])
    )
  })

  it('拼音简写搜索应该返回匹配车站', async () => {
    const response = await request(app)
      .get('/api/v1/stations/search?keyword=sh')
      .expect(200)

    expect(response.body.code).toBe(0)
    expect(response.body.data.stations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ station_name: '上海' }),
      ])
    )
  })

  it('汉字搜索应该返回匹配车站', async () => {
    const response = await request(app)
      .get('/api/v1/stations/search?keyword=北')
      .expect(200)

    expect(response.body.code).toBe(0)
    expect(response.body.data.stations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ station_name: '北京' }),
      ])
    )
  })

  it('空关键词应该返回所有车站', async () => {
    const response = await request(app)
      .get('/api/v1/stations/search?keyword=')
      .expect(200)

    expect(response.body.code).toBe(0)
    expect(response.body.data.stations.length).toBeGreaterThanOrEqual(3)
  })

  it('limit参数应该限制返回数量', async () => {
    const response = await request(app)
      .get('/api/v1/stations/search?keyword=&limit=2')
      .expect(200)

    expect(response.body.code).toBe(0)
    expect(response.body.data.stations).toHaveLength(2)
  })
})
```

### 2.2 车票查询接口
    ```typescript
// src/modules/tickets/__tests__/query.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals'
import request from 'supertest'
import { app } from '@/app'
import { StationFactory, TrainFactory } from '@/tests/factories'
import { getConnection } from 'typeorm'

describe('GET /api/v1/tickets/query', () => {
  let beijingStation: any
  let shanghaiStation: any

  beforeEach(async () => {
    await getConnection().synchronize(true)
    
    // 创建车站
    beijingStation = await StationFactory.createBeijing()
    shanghaiStation = await StationFactory.createShanghai()
    
    // 创建车次
    await TrainFactory.createG1({
      from_station_id: beijingStation.station_id,
      to_station_id: shanghaiStation.station_id,
    })
  })

  it('查询车票应该返回车次列表', async () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const dateStr = tomorrow.toISOString().split('T')[0]

    const response = await request(app)
      .get('/api/v1/tickets/query')
      .query({
        from_station: beijingStation.station_code,
        to_station: shanghaiStation.station_code,
        train_date: dateStr,
      })
      .expect(200)

    expect(response.body.code).toBe(0)
    expect(response.body.data.trains).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          train_code: 'G1',
          from_station_name: '北京南',
          to_station_name: '上海虹桥',
        }),
      ])
    )
  })

  it('今天之前的日期应该返回400', async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const dateStr = yesterday.toISOString().split('T')[0]

    const response = await request(app)
      .get('/api/v1/tickets/query')
      .query({
        from_station: beijingStation.station_code,
        to_station: shanghaiStation.station_code,
        train_date: dateStr,
      })
      .expect(400)

    expect(response.body.code).toBe(400)
    expect(response.body.message).toContain('日期不能早于今天')
  })

  it('出发地和到达地相同应该返回400', async () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const dateStr = tomorrow.toISOString().split('T')[0]

    const response = await request(app)
      .get('/api/v1/tickets/query')
      .query({
        from_station: beijingStation.station_code,
        to_station: beijingStation.station_code, // 相同车站
        train_date: dateStr,
      })
      .expect(400)

    expect(response.body.code).toBe(400)
    expect(response.body.message).toContain('出发地和到达地不能相同')
  })

  it('座位类型筛选应该工作', async () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const dateStr = tomorrow.toISOString().split('T')[0]

    const response = await request(app)
      .get('/api/v1/tickets/query')
      .query({
        from_station: beijingStation.station_code,
        to_station: shanghaiStation.station_code,
        train_date: dateStr,
        seat_type: 'business', // 商务座
      })
      .expect(200)

    expect(response.body.code).toBe(0)
    // 只返回有商务座的车次
    response.body.data.trains.forEach((train: any) => {
      expect(train.seats).toHaveProperty('business')
    })
  })
})
```

---

## 3. 订单接口测试

### 3.1 创建订单接口
    ```typescript
// src/modules/orders/__tests__/create.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals'
import request from 'supertest'
import { app } from '@/app'
import { UserFactory, StationFactory, TrainFactory } from '@/tests/factories'
import { getConnection } from 'typeorm'

describe('POST /api/v1/orders/create', () => {
  let accessToken: string
  let user: any
  let train: any

  beforeEach(async () => {
    await getConnection().synchronize(true)
    
    // 创建用户并登录
    user = await UserFactory.create()
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: user.username,
        password: 'Password123!',
        nc_token: 'mock_token',
      })
    accessToken = loginResponse.body.data.access_token
    
    // 创建车次
    const beijingStation = await StationFactory.createBeijing()
    const shanghaiStation = await StationFactory.createShanghai()
    train = await TrainFactory.createG1({
      from_station_id: beijingStation.station_id,
      to_station_id: shanghaiStation.station_id,
    })
  })

  it('创建订单应该成功', async () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const response = await request(app)
      .post('/api/v1/orders/create')
      .set('Authorization', `Bearer ${ accessToken } `)
      .send({
        train_schedule_id: train.train_schedule_id,
        train_date: tomorrow.toISOString().split('T')[0],
        passengers: [
          {
            name: '张三',
            id_type: 'ID_CARD',
            id_number: '110101199001011234',
            seat_type: 'second_class',
          },
        ],
      })
      .expect(200)

    expect(response.body.code).toBe(0)
    expect(response.body.data).toHaveProperty('order_id')
    expect(response.body.data.status).toBe('pending_payment')
    expect(response.body.data.total_price).toBeGreaterThan(0)
    
    // 验证库存已扣减
    const inventory = await getConnection().query(
      'SELECT * FROM ticket_inventory WHERE train_schedule_id = ? AND seat_type = ?',
      [train.train_schedule_id, 'second_class']
    )
    expect(inventory[0].available_count).toBeLessThan(inventory[0].total_count)
  })

  it('未登录应该返回401', async () => {
    const response = await request(app)
      .post('/api/v1/orders/create')
      .send({
        train_schedule_id: train.train_schedule_id,
        train_date: '2025-12-01',
        passengers: [],
      })
      .expect(401)

    expect(response.body.code).toBe(401)
    expect(response.body.message).toContain('未登录')
  })

  it('乘客信息不完整应该返回400', async () => {
    const response = await request(app)
      .post('/api/v1/orders/create')
      .set('Authorization', `Bearer ${ accessToken } `)
      .send({
        train_schedule_id: train.train_schedule_id,
        train_date: '2025-12-01',
        passengers: [
          {
            name: '张三',
            // 缺少id_type, id_number, seat_type
          },
        ],
      })
      .expect(400)

    expect(response.body.code).toBe(400)
    expect(response.body.message).toContain('参数校验失败')
  })

  it('余票不足应该返回409', async () => {
    // 将库存设置为0
    await getConnection().query(
      'UPDATE ticket_inventory SET available_count = 0 WHERE train_schedule_id = ?',
      [train.train_schedule_id]
    )

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const response = await request(app)
      .post('/api/v1/orders/create')
      .set('Authorization', `Bearer ${ accessToken } `)
      .send({
        train_schedule_id: train.train_schedule_id,
        train_date: tomorrow.toISOString().split('T')[0],
        passengers: [
          {
            name: '张三',
            id_type: 'ID_CARD',
            id_number: '110101199001011234',
            seat_type: 'second_class',
          },
        ],
      })
      .expect(409)

    expect(response.body.code).toBe(409)
    expect(response.body.message).toContain('余票不足')
  })
})
```

### 3.2 支付订单接口
    ```typescript
// src/modules/orders/__tests__/pay.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals'
import request from 'supertest'
import { app } from '@/app'
import { UserFactory, OrderFactory } from '@/tests/factories'
import { getConnection } from 'typeorm'

describe('POST /api/v1/orders/:order_id/pay', () => {
  let accessToken: string
  let user: any
  let order: any

  beforeEach(async () => {
    await getConnection().synchronize(true)
    
    // 创建用户并登录
    user = await UserFactory.create()
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: user.username,
        password: 'Password123!',
        nc_token: 'mock_token',
      })
    accessToken = loginResponse.body.data.access_token
    
    // 创建订单
    order = await OrderFactory.create({ user_id: user.user_id })
  })

  it('支付订单应该成功', async () => {
    const response = await request(app)
      .post(`/ api / v1 / orders / ${ order.order_id }/pay`)
      .set('Authorization', `Bearer ${accessToken}`)
    .send({
        payment_method: 'alipay',
    })
    .expect(200)

expect(response.body.code).toBe(0)
expect(response.body.data).toHaveProperty('payment_url')

// 验证订单状态更新
const updatedOrder = await getConnection().query(
    'SELECT * FROM orders WHERE order_id = ?',
    [order.order_id]
)
expect(updatedOrder[0].status).toBe('paid')
  })

it('支付他人订单应该返回403', async () => {
    // 创建另一个用户的订单
    const otherUser = await UserFactory.create()
    const otherOrder = await OrderFactory.create({ user_id: otherUser.user_id })

    const response = await request(app)
        .post(`/api/v1/orders/${otherOrder.order_id}/pay`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
            payment_method: 'alipay',
        })
        .expect(403)

    expect(response.body.code).toBe(403)
    expect(response.body.message).toContain('无权操作')
})

it('订单已支付应该返回400', async () => {
    const paidOrder = await OrderFactory.createPaid({ user_id: user.user_id })

    const response = await request(app)
        .post(`/api/v1/orders/${paidOrder.order_id}/pay`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
            payment_method: 'alipay',
        })
        .expect(400)

    expect(response.body.code).toBe(400)
    expect(response.body.message).toContain('订单已支付')
})
})
```

---

## 4. 用户中心接口测试

### 4.1 用户资料接口
```typescript
// src/modules/users/__tests__/profile.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals'
import request from 'supertest'
import { app } from '@/app'
import { UserFactory } from '@/tests/factories'

describe('GET /api/v1/user/profile', () => {
    let accessToken: string
    let user: any

    beforeEach(async () => {
        user = await UserFactory.create()
        const loginResponse = await request(app)
            .post('/api/v1/auth/login')
            .send({
                username: user.username,
                password: 'Password123!',
                nc_token: 'mock_token',
            })
        accessToken = loginResponse.body.data.access_token
    })

    it('获取用户资料应该成功', async () => {
        const response = await request(app)
            .get('/api/v1/user/profile')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200)

        expect(response.body.code).toBe(0)
        expect(response.body.data).toMatchObject({
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            phone: user.phone,
        })
        // 密码不应该返回
        expect(response.body.data).not.toHaveProperty('password')
    })
})

describe('PUT /api/v1/user/profile', () => {
    it('更新用户资料应该成功', async () => {
        const response = await request(app)
            .put('/api/v1/user/profile')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                nickname: '新昵称',
                email: 'newemail@example.com',
            })
            .expect(200)

        expect(response.body.code).toBe(0)
        expect(response.body.data.nickname).toBe('新昵称')
        expect(response.body.data.email).toBe('newemail@example.com')
    })
})
    ```

---

下一步: E2E端到端测试 (tests_e2e_scenarios.ts)
