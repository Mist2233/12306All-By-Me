# 12306系统E2E端到端测试用例

生成日期: 2025-11-13
TestGenerator Agent: E2E Test Engineer
测试框架: Playwright + TypeScript

---

## 测试配置

### Playwright配置
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // 关键用户路径串行执行
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## 1. 关键用户路径测试

### 1.1 完整购票流程
```typescript
// tests/e2e/ticket-purchase-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('完整购票流程', () => {
  test('用户从登录到支付的完整流程', async ({ page }) => {
    // Step 1: 访问首页
    await page.goto('/')
    await expect(page).toHaveTitle(/12306/)
    
    // Step 2: 进入登录页
    await page.click('text=登录')
    await expect(page).toHaveURL(/login/)
    
    // Step 3: 填写登录表单
    await page.fill('input[placeholder*="用户名"]', 'test_user')
    await page.fill('input[type="password"]', 'Password123!')
    
    // Step 4: 点击登录按钮
    await page.click('button:has-text("立即登录")')
    
    // Step 5: 等待验证模态框出现
    await expect(page.locator('text=选择验证方式')).toBeVisible()
    
    // Step 6: 选择滑动验证
    await page.click('text=滑动验证')
    
    // Step 7: 完成滑动验证
    const slideButton = page.locator('[data-testid="slide-button"]')
    const slideTrack = page.locator('[data-testid="slide-track"]')
    
    const trackBox = await slideTrack.boundingBox()
    const buttonBox = await slideButton.boundingBox()
    
    if (trackBox && buttonBox) {
      await slideButton.hover()
      await page.mouse.down()
      await page.mouse.move(
        trackBox.x + trackBox.width - buttonBox.width,
        trackBox.y + trackBox.height / 2,
        { steps: 10 }
      )
      await page.mouse.up()
    }
    
    // Step 8: 验证登录成功，跳转到首页
    await expect(page).toHaveURL('/')
    await expect(page.locator('text=退出')).toBeVisible()
    
    // Step 9: 查询车票
    await page.fill('input[aria-label="出发地"]', 'bei')
    await page.click('text=北京')
    
    await page.fill('input[aria-label="到达地"]', 'sh')
    await page.click('text=上海')
    
    // 选择明天的日期
    await page.click('input[aria-label="出发日期"]')
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await page.click(`text=${tomorrow.getDate()}`)
    
    await page.click('button:has-text("查询")')
    
    // Step 10: 等待车次列表加载
    await expect(page.locator('text=G1')).toBeVisible()
    await expect(page.locator('text=北京南')).toBeVisible()
    await expect(page.locator('text=上海虹桥')).toBeVisible()
    
    // Step 11: 点击预订
    await page.click('text=G1 >> .. >> button:has-text("预订")')
    
    // Step 12: 验证跳转到订单确认页
    await expect(page).toHaveURL(/confirmPassenger/)
    
    // Step 13: 选择乘车人
    await page.check('input[type="checkbox"][value="passenger_1"]')
    
    // Step 14: 选择座位类型
    await page.selectOption('select[name="seat_type"]', 'second_class')
    
    // Step 15: 提交订单
    await page.click('button:has-text("提交订单")')
    
    // Step 16: 等待订单创建成功
    await expect(page.locator('text=订单已提交')).toBeVisible({ timeout: 10000 })
    
    // Step 17: 跳转到支付页面
    await page.click('button:has-text("立即支付")')
    await expect(page).toHaveURL(/pay/)
    
    // Step 18: 选择支付方式
    await page.click('text=支付宝支付')
    
    // Step 19: 确认支付
    await page.click('button:has-text("确认支付")')
    
    // Step 20: 验证支付成功
    await expect(page.locator('text=支付成功')).toBeVisible({ timeout: 15000 })
    
    // Step 21: 查看订单详情
    await page.click('text=查看订单')
    await expect(page).toHaveURL(/orders/)
    await expect(page.locator('text=已支付')).toBeVisible()
  })
})
```

### 1.2 往返票购买流程
```typescript
// tests/e2e/round-trip-purchase.spec.ts
import { test, expect } from '@playwright/test'

test.describe('往返票购买流程', () => {
  test.beforeEach(async ({ page }) => {
    // 先登录
    await page.goto('/login')
    await page.fill('input[placeholder*="用户名"]', 'test_user')
    await page.fill('input[type="password"]', 'Password123!')
    await page.click('button:has-text("立即登录")')
    
    // 完成滑动验证
    const slideButton = page.locator('[data-testid="slide-button"]')
    const slideTrack = page.locator('[data-testid="slide-track"]')
    const trackBox = await slideTrack.boundingBox()
    const buttonBox = await slideButton.boundingBox()
    
    if (trackBox && buttonBox) {
      await slideButton.hover()
      await page.mouse.down()
      await page.mouse.move(
        trackBox.x + trackBox.width - buttonBox.width,
        trackBox.y + trackBox.height / 2
      )
      await page.mouse.up()
    }
    
    await expect(page).toHaveURL('/')
  })

  test('查询并购买往返票', async ({ page }) => {
    // Step 1: 切换到往返票
    await page.click('text=往返')
    
    // Step 2: 填写查询条件
    await page.fill('input[aria-label="出发地"]', 'bei')
    await page.click('text=北京')
    
    await page.fill('input[aria-label="到达地"]', 'sh')
    await page.click('text=上海')
    
    // 去程日期（3天后）
    await page.click('input[aria-label="去程日期"]')
    const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    await page.click(`text=${threeDaysLater.getDate()}`)
    
    // 返程日期（5天后）
    await page.click('input[aria-label="返程日期"]')
    const fiveDaysLater = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    await page.click(`text=${fiveDaysLater.getDate()}`)
    
    // Step 3: 提交查询
    await page.click('button:has-text("查询")')
    
    // Step 4: 验证显示往返结果
    await expect(page.locator('text=去程车次')).toBeVisible()
    await expect(page.locator('text=返程车次')).toBeVisible()
    
    // Step 5: 选择去程车次
    await page.locator('section:has-text("去程车次") >> button:has-text("预订")').first().click()
    
    // Step 6: 填写去程乘车人信息
    await page.check('input[type="checkbox"][value="passenger_1"]')
    await page.selectOption('select[name="seat_type"]', 'second_class')
    await page.click('button:has-text("下一步")')
    
    // Step 7: 选择返程车次
    await page.locator('section:has-text("返程车次") >> button:has-text("预订")').first().click()
    
    // Step 8: 填写返程乘车人信息
    await page.check('input[type="checkbox"][value="passenger_1"]')
    await page.selectOption('select[name="seat_type"]', 'second_class')
    
    // Step 9: 提交订单
    await page.click('button:has-text("提交订单")')
    
    // Step 10: 验证两个订单都已创建
    await expect(page.locator('text=订单已提交').first()).toBeVisible()
    
    // 应该有去程和返程两个订单
    const orderCards = page.locator('[data-testid="order-card"]')
    await expect(orderCards).toHaveCount(2)
  })
})
```

---

## 2. 用户认证场景测试

### 2.1 扫码登录流程
```typescript
// tests/e2e/qrcode-login.spec.ts
import { test, expect } from '@playwright/test'

test.describe('扫码登录流程', () => {
  test('生成二维码并模拟扫码成功', async ({ page, context }) => {
    await page.goto('/login')
    
    // Step 1: 切换到扫码登录
    await page.click('text=扫码登录')
    
    // Step 2: 验证二维码显示
    await expect(page.locator('img[alt="扫码登录二维码"]')).toBeVisible()
    await expect(page.locator('text=打开.*12306手机APP.*扫描二维码')).toBeVisible()
    
    // Step 3: 获取二维码ID
    const qrcodeImg = page.locator('img[alt="扫码登录二维码"]')
    const qrcodeSrc = await qrcodeImg.getAttribute('src')
    expect(qrcodeSrc).toContain('data:image/png;base64,')
    
    const qrcodeId = await page.getAttribute('[data-qrcode-id]', 'data-qrcode-id')
    
    // Step 4: 模拟APP扫码（在新页面打开模拟API）
    const apiPage = await context.newPage()
    await apiPage.goto(`/api/v1/auth/qrcode/scan?qrcode_id=${qrcodeId}&user_id=test_user`)
    
    // Step 5: 等待页面自动跳转
    await expect(page).toHaveURL('/', { timeout: 10000 })
    await expect(page.locator('text=退出')).toBeVisible()
  })

  test('二维码过期应该显示刷新按钮', async ({ page }) => {
    await page.goto('/login')
    await page.click('text=扫码登录')
    
    // 等待2分钟（加速时间）
    await page.evaluate(() => {
      // Mock Date.now()使时间快进
      const originalNow = Date.now
      Date.now = () => originalNow() + 120 * 1000
    })
    
    await page.waitForTimeout(1000)
    
    // 验证显示过期状态
    await expect(page.locator('text=二维码已失效')).toBeVisible()
    await expect(page.locator('button:has-text("刷新")')).toBeVisible()
    
    // 点击刷新
    await page.click('button:has-text("刷新")')
    
    // 验证新二维码显示
    await expect(page.locator('img[alt="扫码登录二维码"]')).toBeVisible()
  })
})
```

### 2.2 短信验证登录流程
```typescript
// tests/e2e/sms-login.spec.ts
import { test, expect } from '@playwright/test'

test.describe('短信验证登录流程', () => {
  test('完成短信验证登录', async ({ page }) => {
    await page.goto('/login')
    
    // Step 1: 填写用户名密码
    await page.fill('input[placeholder*="用户名"]', 'test_user')
    await page.fill('input[type="password"]', 'Password123!')
    await page.click('button:has-text("立即登录")')
    
    // Step 2: 选择短信验证
    await expect(page.locator('text=选择验证方式')).toBeVisible()
    await page.click('text=短信验证')
    
    // Step 3: 填写证件号后4位
    await page.fill('input[aria-label*="证件号后4位"]', '1234')
    
    // Step 4: 获取验证码
    await page.click('button:has-text("获取验证码")')
    
    // Step 5: 验证倒计时开始
    await expect(page.locator('button:has-text("60秒后重试")')).toBeVisible()
    await expect(page.locator('button:has-text("获取验证码")')).toBeDisabled()
    
    // Step 6: 填写验证码（从测试环境获取）
    // 在测试环境中，验证码固定为123456
    await page.fill('input[aria-label*="验证码"]', '123456')
    
    // Step 7: 提交验证
    await page.click('button:has-text("确认")')
    
    // Step 8: 验证登录成功
    await expect(page).toHaveURL('/')
    await expect(page.locator('text=退出')).toBeVisible()
  })

  test('验证码错误应该显示提示', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[placeholder*="用户名"]', 'test_user')
    await page.fill('input[type="password"]', 'Password123!')
    await page.click('button:has-text("立即登录")')
    
    await page.click('text=短信验证')
    await page.fill('input[aria-label*="证件号后4位"]', '1234')
    await page.click('button:has-text("获取验证码")')
    
    // 填写错误验证码
    await page.fill('input[aria-label*="验证码"]', '000000')
    await page.click('button:has-text("确认")')
    
    // 验证错误提示
    await expect(page.locator('text=验证码错误')).toBeVisible()
  })
})
```

---

## 3. 订单管理场景测试

### 3.1 订单查询与取消
```typescript
// tests/e2e/order-management.spec.ts
import { test, expect } from '@playwright/test'

test.describe('订单管理', () => {
  test.beforeEach(async ({ page }) => {
    // 登录并创建一个未支付订单
    await page.goto('/login')
    await page.fill('input[placeholder*="用户名"]', 'test_user')
    await page.fill('input[type="password"]', 'Password123!')
    await page.click('button:has-text("立即登录")')
    
    // 完成验证
    const slideButton = page.locator('[data-testid="slide-button"]')
    const slideTrack = page.locator('[data-testid="slide-track"]')
    const trackBox = await slideTrack.boundingBox()
    const buttonBox = await slideButton.boundingBox()
    
    if (trackBox && buttonBox) {
      await slideButton.hover()
      await page.mouse.down()
      await page.mouse.move(trackBox.x + trackBox.width - buttonBox.width, trackBox.y)
      await page.mouse.up()
    }
    
    // 创建订单
    await page.goto('/')
    await page.fill('input[aria-label="出发地"]', 'bei')
    await page.click('text=北京')
    await page.fill('input[aria-label="到达地"]', 'sh')
    await page.click('text=上海')
    
    await page.click('input[aria-label="出发日期"]')
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await page.click(`text=${tomorrow.getDate()}`)
    
    await page.click('button:has-text("查询")')
    await page.locator('button:has-text("预订")').first().click()
    
    await page.check('input[type="checkbox"][value="passenger_1"]')
    await page.selectOption('select[name="seat_type"]', 'second_class')
    await page.click('button:has-text("提交订单")')
    
    await expect(page.locator('text=订单已提交')).toBeVisible()
  })

  test('查看订单列表', async ({ page }) => {
    // Step 1: 进入我的订单
    await page.click('text=我的订单')
    await expect(page).toHaveURL(/orders/)
    
    // Step 2: 验证订单显示
    const orderCards = page.locator('[data-testid="order-card"]')
    await expect(orderCards).toHaveCount(1)
    
    await expect(orderCards.first()).toContainText('待支付')
    await expect(orderCards.first()).toContainText('G')
    await expect(orderCards.first()).toContainText('北京')
    await expect(orderCards.first()).toContainText('上海')
  })

  test('取消未支付订单', async ({ page }) => {
    await page.click('text=我的订单')
    
    // Step 1: 点击取消订单
    await page.locator('[data-testid="order-card"] >> button:has-text("取消订单")').first().click()
    
    // Step 2: 确认取消
    await expect(page.locator('text=确认取消订单')).toBeVisible()
    await page.click('button:has-text("确认")')
    
    // Step 3: 验证订单状态更新
    await expect(page.locator('text=已取消')).toBeVisible({ timeout: 5000 })
    
    // Step 4: 验证库存已释放（通过重新查询车票）
    await page.goto('/')
    await page.fill('input[aria-label="出发地"]', 'bei')
    await page.click('text=北京')
    await page.fill('input[aria-label="到达地"]', 'sh')
    await page.click('text=上海')
    
    await page.click('input[aria-label="出发日期"]')
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await page.click(`text=${tomorrow.getDate()}`)
    
    await page.click('button:has-text("查询")')
    
    // 余票数应该恢复
    const availableCount = await page.locator('[data-testid="available-count"]').first().textContent()
    expect(parseInt(availableCount || '0')).toBeGreaterThan(0)
  })

  test('订单超时自动取消', async ({ page }) => {
    await page.click('text=我的订单')
    
    // 加速时间（超过30分钟支付时限）
    await page.evaluate(() => {
      const originalNow = Date.now
      Date.now = () => originalNow() + 31 * 60 * 1000
    })
    
    // 刷新页面
    await page.reload()
    
    // 验证订单自动取消
    await expect(page.locator('text=已取消')).toBeVisible()
    await expect(page.locator('text=超时未支付')).toBeVisible()
  })
})
```

---

## 4. 用户中心场景测试

### 4.1 常用联系人管理
```typescript
// tests/e2e/contacts-management.spec.ts
import { test, expect } from '@playwright/test'

test.describe('常用联系人管理', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('/login')
    await page.fill('input[placeholder*="用户名"]', 'test_user')
    await page.fill('input[type="password"]', 'Password123!')
    await page.click('button:has-text("立即登录")')
    
    const slideButton = page.locator('[data-testid="slide-button"]')
    const slideTrack = page.locator('[data-testid="slide-track"]')
    const trackBox = await slideTrack.boundingBox()
    const buttonBox = await slideButton.boundingBox()
    
    if (trackBox && buttonBox) {
      await slideButton.hover()
      await page.mouse.down()
      await page.mouse.move(trackBox.x + trackBox.width - buttonBox.width, trackBox.y)
      await page.mouse.up()
    }
    
    await expect(page).toHaveURL('/')
  })

  test('添加常用联系人', async ({ page }) => {
    // Step 1: 进入个人中心
    await page.click('text=个人中心')
    await expect(page).toHaveURL(/user\/center/)
    
    // Step 2: 切换到常用联系人
    await page.click('text=常用联系人')
    
    // Step 3: 点击添加联系人
    await page.click('button:has-text("添加联系人")')
    
    // Step 4: 填写联系人信息
    await page.fill('input[name="name"]', '张三')
    await page.selectOption('select[name="id_type"]', 'ID_CARD')
    await page.fill('input[name="id_number"]', '110101199001011234')
    await page.selectOption('select[name="passenger_type"]', 'adult')
    await page.fill('input[name="phone"]', '13900139000')
    
    // Step 5: 提交
    await page.click('button:has-text("保存")')
    
    // Step 6: 验证添加成功
    await expect(page.locator('text=添加成功')).toBeVisible()
    await expect(page.locator('text=张三')).toBeVisible()
    await expect(page.locator('text=110101199001011234')).toBeVisible()
  })

  test('编辑常用联系人', async ({ page }) => {
    // 先添加一个联系人
    await page.click('text=个人中心')
    await page.click('text=常用联系人')
    await page.click('button:has-text("添加联系人")')
    
    await page.fill('input[name="name"]', '李四')
    await page.selectOption('select[name="id_type"]', 'ID_CARD')
    await page.fill('input[name="id_number"]', '110101199002022345')
    await page.selectOption('select[name="passenger_type"]', 'adult')
    await page.fill('input[name="phone"]', '13900139001')
    await page.click('button:has-text("保存")')
    
    await expect(page.locator('text=添加成功')).toBeVisible()
    
    // Step 1: 点击编辑
    await page.locator('[data-testid="contact-card"]:has-text("李四") >> button:has-text("编辑")').click()
    
    // Step 2: 修改信息
    await page.fill('input[name="phone"]', '13900139002')
    
    // Step 3: 保存
    await page.click('button:has-text("保存")')
    
    // Step 4: 验证修改成功
    await expect(page.locator('text=修改成功')).toBeVisible()
    await expect(page.locator('text=13900139002')).toBeVisible()
  })

  test('删除常用联系人', async ({ page }) => {
    // 先添加一个联系人
    await page.click('text=个人中心')
    await page.click('text=常用联系人')
    await page.click('button:has-text("添加联系人")')
    
    await page.fill('input[name="name"]', '王五')
    await page.selectOption('select[name="id_type"]', 'ID_CARD')
    await page.fill('input[name="id_number"]', '110101199003033456')
    await page.selectOption('select[name="passenger_type"]', 'adult')
    await page.fill('input[name="phone"]', '13900139003')
    await page.click('button:has-text("保存")')
    
    await expect(page.locator('text=添加成功')).toBeVisible()
    
    // Step 1: 点击删除
    await page.locator('[data-testid="contact-card"]:has-text("王五") >> button:has-text("删除")').click()
    
    // Step 2: 确认删除
    await expect(page.locator('text=确认删除')).toBeVisible()
    await page.click('button:has-text("确认")')
    
    // Step 3: 验证删除成功
    await expect(page.locator('text=删除成功')).toBeVisible()
    await expect(page.locator('text=王五')).not.toBeVisible()
  })
})
```

---

## 5. 性能与稳定性测试

### 5.1 并发查询测试
```typescript
// tests/e2e/performance.spec.ts
import { test, expect } from '@playwright/test'

test.describe('性能测试', () => {
  test('100个并发查询请求', async ({ page }) => {
    await page.goto('/')
    
    // 填写查询条件
    await page.fill('input[aria-label="出发地"]', 'bei')
    await page.click('text=北京')
    await page.fill('input[aria-label="到达地"]', 'sh')
    await page.click('text=上海')
    
    await page.click('input[aria-label="出发日期"]')
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await page.click(`text=${tomorrow.getDate()}`)
    
    // 并发发起100次查询
    const startTime = Date.now()
    const promises = []
    
    for (let i = 0; i < 100; i++) {
      promises.push(page.click('button:has-text("查询")'))
    }
    
    await Promise.all(promises)
    const endTime = Date.now()
    
    // 验证所有请求在5秒内完成
    expect(endTime - startTime).toBeLessThan(5000)
    
    // 验证结果正确显示
    await expect(page.locator('text=G1')).toBeVisible()
  })

  test('页面加载时间应小于2秒', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    
    // 等待关键内容加载
    await expect(page.locator('input[aria-label="出发地"]')).toBeVisible()
    const loadTime = Date.now() - startTime
    
    expect(loadTime).toBeLessThan(2000)
  })
})
```

---

## 测试总结

### 测试覆盖率目标
```yaml
E2E测试覆盖:
  关键用户路径: 5个核心场景
  用户认证: 3种登录方式
  订单管理: 创建、查询、取消、支付
  用户中心: 资料管理、联系人CRUD
  性能测试: 并发、响应时间

执行策略:
  - CI环境: 每次提交触发所有E2E测试
  - 本地开发: 手动执行相关场景测试
  - 关键路径: 每日定时执行
  
预期结果:
  - 所有测试通过率: 95%+
  - 平均执行时间: <10分钟
  - 失败自动重试: 最多2次
```

---

Next-Agent: Developer
任务: 基于TestGenerator生成的测试用例，实施TDD开发，实现所有功能使测试通过
