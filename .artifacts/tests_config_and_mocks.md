# 12306系统测试生成文档

生成日期: 2025-11-13
TestGenerator Agent: Test Automation Engineer
输入文件: .artifacts/bdd_requirements.md, .artifacts/design_*.yml

---

## 测试策略

### 测试金字塔
```
        /\
       /E2E\        <- 5%  (关键路径)
      /------\
     /集成测试 \     <- 15% (API集成)
    /----------\
   / 单元测试   \    <- 80% (组件/函数)
  /--------------\
```

### 测试覆盖率目标
- 单元测试: 80%+
- 集成测试: 70%+
- E2E测试: 核心路径100%

---

## 1. 前端测试配置

### 1.1 Vitest配置
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/',
      ],
      threshold: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### 1.2 测试环境配置
```typescript
// src/tests/setup.ts
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// 每个测试后自动清理
afterEach(() => {
  cleanup()
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock as any

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.sessionStorage = sessionStorageMock as any

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
```

---

## 2. 后端测试配置

### 2.1 Jest配置 (Node.js)
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/types/**',
    '!src/tests/**',
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}
```

### 2.2 测试数据库配置
```typescript
// tests/setup.ts
import { DataSource } from 'typeorm'
import { createDatabase, dropDatabase } from 'pg-god'

let testDataSource: DataSource

beforeAll(async () => {
  // 创建测试数据库
  await createDatabase({ databaseName: 'test_12306' })
  
  // 初始化数据源
  testDataSource = new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'test',
    password: 'test',
    database: 'test_12306',
    entities: ['src/entities/**/*.ts'],
    synchronize: true,
    dropSchema: true,
  })
  
  await testDataSource.initialize()
})

afterAll(async () => {
  await testDataSource.destroy()
  await dropDatabase({ databaseName: 'test_12306' })
})

beforeEach(async () => {
  // 清空所有表
  const entities = testDataSource.entityMetadatas
  for (const entity of entities) {
    const repository = testDataSource.getRepository(entity.name)
    await repository.clear()
  }
})

export { testDataSource }
```

---

## 3. Mock数据工厂

### 3.1 用户数据工厂
```typescript
// tests/factories/user.factory.ts
import { faker } from '@faker-js/faker/locale/zh_CN'
import { User } from '@/entities/User'

export class UserFactory {
  static create(overrides?: Partial<User>): User {
    return {
      user_id: faker.number.int({ min: 1000, max: 9999 }),
      username: faker.internet.userName(),
      email: faker.internet.email(),
      mobile: faker.phone.number('138########'),
      password_hash: '$2b$10$hashedpassword',
      salt: faker.string.alphanumeric(64),
      real_name: faker.person.fullName(),
      id_type: 1,
      id_number: faker.string.numeric(18),
      user_type: 1,
      status: 1,
      login_attempts: 0,
      created_at: faker.date.past(),
      updated_at: new Date(),
      ...overrides,
    }
  }

  static createMany(count: number, overrides?: Partial<User>): User[] {
    return Array.from({ length: count }, () => this.create(overrides))
  }

  static createStudent(overrides?: Partial<User>): User {
    return this.create({ user_type: 2, ...overrides })
  }
}
```

### 3.2 车站数据工厂
```typescript
// tests/factories/station.factory.ts
export class StationFactory {
  static stations = [
    { code: 'BJP', name: '北京', pinyin: 'beijing', abbr: 'bj' },
    { code: 'SHH', name: '上海', pinyin: 'shanghai', abbr: 'sh' },
    { code: 'GZQ', name: '广州', pinyin: 'guangzhou', abbr: 'gz' },
    { code: 'SZQ', name: '深圳', pinyin: 'shenzhen', abbr: 'sz' },
  ]

  static create(overrides?: Partial<Station>): Station {
    const station = faker.helpers.arrayElement(this.stations)
    return {
      station_id: faker.number.int({ min: 1, max: 1000 }),
      station_code: station.code,
      station_name: station.name,
      pinyin: station.pinyin,
      pinyin_abbr: station.abbr,
      city: station.name,
      province: station.name,
      status: 1,
      display_order: 0,
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides,
    }
  }

  static createBeijing(): Station {
    return this.create({
      station_code: 'BJP',
      station_name: '北京',
      pinyin: 'beijing',
      pinyin_abbr: 'bj',
    })
  }

  static createShanghai(): Station {
    return this.create({
      station_code: 'SHH',
      station_name: '上海',
      pinyin: 'shanghai',
      pinyin_abbr: 'sh',
    })
  }
}
```

### 3.3 车次数据工厂
```typescript
// tests/factories/train.factory.ts
export class TrainFactory {
  static create(overrides?: Partial<Train>): Train {
    const trainNo = faker.helpers.arrayElement(['G1', 'G2', 'D1', 'K1'])
    return {
      train_id: faker.number.int({ min: 1000, max: 9999 }),
      train_no: trainNo,
      train_type: trainNo.startsWith('G') ? 1 : trainNo.startsWith('D') ? 2 : 3,
      from_station_id: 1,
      to_station_id: 2,
      departure_time: '08:00:00',
      arrival_time: '12:28:00',
      duration: 268,
      distance: 1318,
      status: 1,
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides,
    }
  }

  static createG1(): Train {
    return this.create({
      train_no: 'G1',
      train_type: 1,
      departure_time: '08:00:00',
      arrival_time: '12:28:00',
    })
  }
}
```

### 3.4 订单数据工厂
```typescript
// tests/factories/order.factory.ts
export class OrderFactory {
  static create(overrides?: Partial<Order>): Order {
    const orderNo = `E${faker.date.recent().getTime()}`
    return {
      order_id: faker.number.int({ min: 10000, max: 99999 }),
      order_no: orderNo,
      user_id: 1001,
      train_id: 1001,
      train_no: 'G1',
      travel_date: faker.date.future(),
      from_station_id: 1,
      from_station_name: '北京',
      to_station_id: 2,
      to_station_name: '上海',
      departure_time: '08:00:00',
      arrival_time: '12:28:00',
      total_amount: 933.00,
      paid_amount: 0,
      order_status: 1,
      payment_status: 0,
      payment_deadline: new Date(Date.now() + 30 * 60 * 1000),
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides,
    }
  }

  static createPaid(overrides?: Partial<Order>): Order {
    return this.create({
      order_status: 2,
      payment_status: 1,
      paid_amount: 933.00,
      paid_at: new Date(),
      ...overrides,
    })
  }
}
```

---

## 4. API Mock Server

### 4.1 MSW配置
```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  // 登录
  http.post('/api/v1/auth/login', async ({ request }) => {
    const body = await request.json()
    const { username, password } = body as any
    
    if (username === 'user@example.com' && password === 'Password123') {
      return HttpResponse.json({
        code: 200,
        message: '登录成功',
        data: {
          user_id: 1001,
          username: 'user@example.com',
          token: 'mock_token_123',
          expires_in: 7200,
        },
      })
    }
    
    return HttpResponse.json(
      {
        code: 401,
        message: '用户名或密码输入错误',
        data: null,
      },
      { status: 401 }
    )
  }),

  // 车站搜索
  http.get('/api/v1/stations/search', ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q')
    
    const stations = [
      { station_id: 1, station_code: 'BJP', station_name: '北京', pinyin: 'beijing', pinyin_abbr: 'bj' },
      { station_id: 2, station_code: 'SHH', station_name: '上海', pinyin: 'shanghai', pinyin_abbr: 'sh' },
    ]
    
    const filtered = q 
      ? stations.filter(s => 
          s.station_name.includes(q) || 
          s.pinyin.includes(q) || 
          s.pinyin_abbr.includes(q)
        )
      : stations
    
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: filtered,
    })
  }),

  // 余票查询
  http.get('/api/v1/tickets/query', ({ request }) => {
    const url = new URL(request.url)
    const from = url.searchParams.get('from_station')
    const to = url.searchParams.get('to_station')
    const date = url.searchParams.get('travel_date')
    
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: {
        query_info: { from_station: '北京', to_station: '上海', travel_date: date },
        trains: [
          {
            train_id: 1001,
            train_no: 'G1',
            train_type: 1,
            from_station: '北京南',
            to_station: '上海虹桥',
            departure_time: '08:00',
            arrival_time: '12:28',
            duration: 268,
            seats: [
              { seat_type_id: 1, seat_type_name: '二等座', available_seats: 246, price: 553 },
              { seat_type_id: 2, seat_type_name: '一等座', available_seats: 68, price: 933 },
            ],
          },
        ],
      },
    })
  }),
]
```

### 4.2 MSW Server配置
```typescript
// src/mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

### 4.3 测试中使用MSW
```typescript
// tests/setup.ts
import { server } from '@/mocks/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

---

下一步: 生成具体测试用例 (tests_unit_components.ts, tests_api_integration.ts)
