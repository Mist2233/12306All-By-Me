# 12306系统前端组件测试用例

生成日期: 2025 - 11 - 13
TestGenerator Agent: Frontend Test Engineer
测试框架: Vitest + React Testing Library

---

## 1. 基础组件测试

### 1.1 Button组件测试
    ```typescript
// src/components/Button/__tests__/Button.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../Button'

describe('Button Component', () => {
  it('应该渲染主要按钮', () => {
    render(<Button variant="primary">立即登录</Button>)
    const button = screen.getByRole('button', { name: '立即登录' })
    
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('btn-primary')
  })

  it('应该处理点击事件', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>点击</Button>)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('禁用状态不应该触发点击', () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>禁用</Button>)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(handleClick).not.toHaveBeenCalled()
    expect(button).toBeDisabled()
  })

  it('应该支持不同尺寸', () => {
    const { rerender } = render(<Button size="sm">小按钮</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn-sm')
    
    rerender(<Button size="md">中按钮</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn-md')
    
    rerender(<Button size="lg">大按钮</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn-lg')
  })

  it('块级按钮应该占满宽度', () => {
    render(<Button block>块级按钮</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn-block')
  })
})
```

### 1.2 Input组件测试
    ```typescript
// src/components/Input/__tests__/Input.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '../Input'

describe('Input Component', () => {
  it('应该渲染输入框', () => {
    render(<Input placeholder="请输入用户名" />)
    const input = screen.getByPlaceholderText('请输入用户名')
    
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('input')
  })

  it('应该处理值变化', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'test@example.com')
    
    expect(handleChange).toHaveBeenCalled()
    expect(input).toHaveValue('test@example.com')
  })

  it('密码输入框应该隐藏内容', () => {
    render(<Input type="password" value="secret" readOnly />)
    const input = screen.getByDisplayValue('secret')
    
    expect(input).toHaveAttribute('type', 'password')
  })

  it('禁用状态应该不可编辑', async () => {
    const user = userEvent.setup()
    render(<Input disabled />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'test')
    
    expect(input).toBeDisabled()
    expect(input).toHaveValue('')
  })

  it('错误状态应该显示错误样式', () => {
    render(<Input error />)
    expect(screen.getByRole('textbox')).toHaveClass('error')
  })

  it('应该限制最大长度', async () => {
    const user = userEvent.setup()
    render(<Input maxLength={5} />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, '1234567890')
    
    expect(input).toHaveAttribute('maxLength', '5')
  })
})
```

### 1.3 Modal组件测试
    ```typescript
// src/components/Modal/__tests__/Modal.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from '../Modal'

describe('Modal Component', () => {
  it('visible为true时应该显示模态框', () => {
    render(
      <Modal visible={true} title="测试模态框">
        <div>模态框内容</div>
      </Modal>
    )
    
    expect(screen.getByText('测试模态框')).toBeInTheDocument()
    expect(screen.getByText('模态框内容')).toBeInTheDocument()
  })

  it('visible为false时不应该显示', () => {
    render(
      <Modal visible={false} title="测试模态框">
        <div>模态框内容</div>
      </Modal>
    )
    
    expect(screen.queryByText('测试模态框')).not.toBeInTheDocument()
  })

  it('点击关闭按钮应该触发onClose', () => {
    const handleClose = vi.fn()
    render(
      <Modal visible={true} title="测试" onClose={handleClose}>
        内容
      </Modal>
    )
    
    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)
    
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('点击遮罩层应该触发onClose', () => {
    const handleClose = vi.fn()
    render(
      <Modal visible={true} title="测试" onClose={handleClose} maskClosable>
        内容
      </Modal>
    )
    
    const mask = screen.getByTestId('modal-mask')
    fireEvent.click(mask)
    
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('maskClosable为false时点击遮罩不关闭', () => {
    const handleClose = vi.fn()
    render(
      <Modal visible={true} title="测试" onClose={handleClose} maskClosable={false}>
        内容
      </Modal>
    )
    
    const mask = screen.getByTestId('modal-mask')
    fireEvent.click(mask)
    
    expect(handleClose).not.toHaveBeenCalled()
  })
})
```

---

## 2. 业务组件测试

### 2.1 SlideVerify滑动验证组件测试
    ```typescript
// src/components/SlideVerify/__tests__/SlideVerify.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SlideVerify } from '../SlideVerify'

describe('SlideVerify Component', () => {
  it('应该渲染滑动验证组件', () => {
    render(<SlideVerify />)
    
    expect(screen.getByText('请按住滑块拖动到最右边')).toBeInTheDocument()
    expect(screen.getByTestId('slide-button')).toBeInTheDocument()
  })

  it('拖动滑块到最右边应该触发成功回调', () => {
    const handleSuccess = vi.fn()
    render(<SlideVerify onSuccess={handleSuccess} />)
    
    const button = screen.getByTestId('slide-button')
    const track = screen.getByTestId('slide-track')
    
    // 模拟拖动
    fireEvent.mouseDown(button)
    fireEvent.mouseMove(track, { clientX: 300 }) // 拖到最右边
    fireEvent.mouseUp(track)
    
    expect(handleSuccess).toHaveBeenCalledWith(expect.any(String)) // nc_token
  })

  it('拖动不到位应该失败', () => {
    const handleSuccess = vi.fn()
    const handleFail = vi.fn()
    render(<SlideVerify onSuccess={handleSuccess} onFail={handleFail} />)
    
    const button = screen.getByTestId('slide-button')
    const track = screen.getByTestId('slide-track')
    
    fireEvent.mouseDown(button)
    fireEvent.mouseMove(track, { clientX: 100 }) // 只拖一半
    fireEvent.mouseUp(track)
    
    expect(handleSuccess).not.toHaveBeenCalled()
    expect(handleFail).toHaveBeenCalled()
  })

  it('成功后应该显示成功状态', () => {
    render(<SlideVerify />)
    
    const button = screen.getByTestId('slide-button')
    const track = screen.getByTestId('slide-track')
    
    fireEvent.mouseDown(button)
    fireEvent.mouseMove(track, { clientX: 300 })
    fireEvent.mouseUp(track)
    
    expect(screen.getByTestId('slide-verify')).toHaveClass('success')
  })
})
```

### 2.2 Autocomplete自动补全组件测试
    ```typescript
// src/components/Autocomplete/__tests__/Autocomplete.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Autocomplete } from '../Autocomplete'

describe('Autocomplete Component', () => {
  const mockStations = [
    { station_id: 1, station_code: 'BJP', station_name: '北京', pinyin: 'beijing', pinyin_abbr: 'bj' },
    { station_id: 2, station_code: 'SHH', station_name: '上海', pinyin: 'shanghai', pinyin_abbr: 'sh' },
    { station_id: 3, station_code: 'BBH', station_name: '蚌埠', pinyin: 'bengbu', pinyin_abbr: 'bb' },
  ]

  it('输入时应该显示下拉列表', async () => {
    const user = userEvent.setup()
    render(<Autocomplete options={mockStations} />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'bei')
    
    await waitFor(() => {
      expect(screen.getByText(/北京/)).toBeInTheDocument()
      expect(screen.getByText(/蚌埠/)).toBeInTheDocument()
      expect(screen.queryByText(/上海/)).not.toBeInTheDocument()
    })
  })

  it('支持拼音搜索', async () => {
    const user = userEvent.setup()
    render(<Autocomplete options={mockStations} />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'sh')
    
    await waitFor(() => {
      expect(screen.getByText(/上海/)).toBeInTheDocument()
    })
  })

  it('点击选项应该填充值', async () => {
    const handleSelect = vi.fn()
    render(<Autocomplete options={mockStations} onSelect={handleSelect} />)
    
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'bei')
    
    await waitFor(() => {
      const option = screen.getByText(/北京/)
      fireEvent.click(option)
    })
    
    expect(handleSelect).toHaveBeenCalledWith(mockStations[0])
    expect(input).toHaveValue('北京')
  })

  it('键盘上下键应该导航选项', async () => {
    const user = userEvent.setup()
    render(<Autocomplete options={mockStations} />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'b')
    
    await waitFor(() => {
      expect(screen.getByText(/北京/)).toBeInTheDocument()
    })
    
    // 按下箭头键
    await user.keyboard('{ArrowDown}')
    expect(screen.getAllByRole('option')[0]).toHaveClass('active')
    
    await user.keyboard('{ArrowDown}')
    expect(screen.getAllByRole('option')[1]).toHaveClass('active')
    
    await user.keyboard('{ArrowUp}')
    expect(screen.getAllByRole('option')[0]).toHaveClass('active')
  })

  it('按回车键应该选中当前激活项', async () => {
    const user = userEvent.setup()
    const handleSelect = vi.fn()
    render(<Autocomplete options={mockStations} onSelect={handleSelect} />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'b')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')
    
    expect(handleSelect).toHaveBeenCalled()
  })
})
```

### 2.3 DatePicker日期选择器测试
    ```typescript
// src/components/DatePicker/__tests__/DatePicker.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DatePicker } from '../DatePicker'

describe('DatePicker Component', () => {
  it('点击输入框应该打开日期选择器', () => {
    render(<DatePicker />)
    
    const input = screen.getByRole('textbox')
    fireEvent.click(input)
    
    expect(screen.getByTestId('datepicker-panel')).toBeInTheDocument()
  })

  it('今天之前的日期应该禁用', () => {
    const minDate = new Date()
    render(<DatePicker minDate={minDate} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.click(input)
    
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const yesterdayCell = screen.getByText(yesterday.getDate().toString())
    
    expect(yesterdayCell).toHaveClass('disabled')
  })

  it('选择日期应该更新输入框', () => {
    const handleChange = vi.fn()
    render(<DatePicker onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.click(input)
    
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const tomorrowCell = screen.getByText(tomorrow.getDate().toString())
    fireEvent.click(tomorrowCell)
    
    expect(handleChange).toHaveBeenCalledWith(expect.any(Date))
  })

  it('应该显示正确的月份', () => {
    render(<DatePicker />)
    
    const input = screen.getByRole('textbox')
    fireEvent.click(input)
    
    const currentMonth = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
    expect(screen.getByText(currentMonth)).toBeInTheDocument()
  })

  it('点击上一月/下一月按钮', () => {
    render(<DatePicker />)
    
    const input = screen.getByRole('textbox')
    fireEvent.click(input)
    
    const nextButton = screen.getByTestId('next-month')
    fireEvent.click(nextButton)
    
    // 月份应该变化
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    expect(screen.getByText(
      nextMonth.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
    )).toBeInTheDocument()
  })
})
```

---

## 3. 页面组件测试

### 3.1 登录页面测试
    ```typescript
// src/pages/Login/__tests__/Login.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginPage } from '../LoginPage'
import { server } from '@/mocks/server'
import { http, HttpResponse } from 'msw'

describe('LoginPage', () => {
  beforeEach(() => {
    // 重置所有mock
    vi.clearAllMocks()
  })

  describe('账号密码登录', () => {
    it('应该渲染登录表单', () => {
      render(<LoginPage />)
      
      expect(screen.getByPlaceholderText('用户名/邮箱/手机号')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('密码')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '立即登录' })).toBeInTheDocument()
    })

    it('输入用户名密码并点击登录应该触发滑动验证', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)
      
      await user.type(screen.getByPlaceholderText('用户名/邮箱/手机号'), 'user@example.com')
      await user.type(screen.getByPlaceholderText('密码'), 'Password123')
      await user.click(screen.getByRole('button', { name: '立即登录' }))
      
      // 应该显示验证模态框
      await waitFor(() => {
        expect(screen.getByText('选择验证方式')).toBeInTheDocument()
        expect(screen.getByText('滑动验证')).toBeInTheDocument()
      })
    })

    it('完成滑动验证后应该提交登录', async () => {
      const user = userEvent.setup()
      const mockNavigate = vi.fn()
      
      render(<LoginPage navigate={mockNavigate} />)
      
      // 输入用户名密码
      await user.type(screen.getByPlaceholderText('用户名/邮箱/手机号'), 'user@example.com')
      await user.type(screen.getByPlaceholderText('密码'), 'Password123')
      await user.click(screen.getByRole('button', { name: '立即登录' }))
      
      // 完成滑动验证
      await waitFor(() => {
        expect(screen.getByTestId('slide-verify')).toBeInTheDocument()
      })
      
      const slideButton = screen.getByTestId('slide-button')
      const slideTrack = screen.getByTestId('slide-track')
      
      fireEvent.mouseDown(slideButton)
      fireEvent.mouseMove(slideTrack, { clientX: 300 })
      fireEvent.mouseUp(slideTrack)
      
      // 应该跳转到首页
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    })

    it('登录失败应该显示错误提示', async () => {
      const user = userEvent.setup()
      
      // Mock失败响应
      server.use(
        http.post('/api/v1/auth/login', () => {
          return HttpResponse.json(
            { code: 401, message: '用户名或密码输入错误', data: null },
            { status: 401 }
          )
        })
      )
      
      render(<LoginPage />)
      
      await user.type(screen.getByPlaceholderText('用户名/邮箱/手机号'), 'wronguser')
      await user.type(screen.getByPlaceholderText('密码'), 'wrongpass')
      await user.click(screen.getByRole('button', { name: '立即登录' }))
      
      // 完成滑动验证
      const slideButton = await screen.findByTestId('slide-button')
      const slideTrack = screen.getByTestId('slide-track')
      fireEvent.mouseDown(slideButton)
      fireEvent.mouseMove(slideTrack, { clientX: 300 })
      fireEvent.mouseUp(slideTrack)
      
      // 应该显示错误提示
      await waitFor(() => {
        expect(screen.getByText('用户名或密码输入错误')).toBeInTheDocument()
      })
    })
  })

  describe('扫码登录', () => {
    it('切换到扫码登录应该显示二维码', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)
      
      await user.click(screen.getByText('扫码登录'))
      
      await waitFor(() => {
        expect(screen.getByAltText('扫码登录二维码')).toBeInTheDocument()
        expect(screen.getByText(/打开.*12306手机APP.*扫描二维码/)).toBeInTheDocument()
      })
    })

    it('二维码过期应该显示刷新按钮', async () => {
      vi.useFakeTimers()
      render(<LoginPage />)
      
      await userEvent.click(screen.getByText('扫码登录'))
      
      // 等待2分钟过期
      vi.advanceTimersByTime(120 * 1000)
      
      await waitFor(() => {
        expect(screen.getByText('二维码已失效')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: '刷新' })).toBeInTheDocument()
      })
      
      vi.useRealTimers()
    })
  })

  describe('短信验证登录', () => {
    it('切换到短信验证应该显示验证码输入框', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)
      
      await user.type(screen.getByPlaceholderText('用户名/邮箱/手机号'), 'user@example.com')
      await user.type(screen.getByPlaceholderText('密码'), 'Password123')
      await user.click(screen.getByRole('button', { name: '立即登录' }))
      
      await waitFor(() => {
        expect(screen.getByText('短信验证')).toBeInTheDocument()
      })
      
      await user.click(screen.getByText('短信验证'))
      
      expect(screen.getByLabelText(/证件号后4位/)).toBeInTheDocument()
      expect(screen.getByLabelText(/验证码/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '获取验证码' })).toBeInTheDocument()
    })

    it('获取验证码应该开始倒计时', async () => {
      vi.useFakeTimers()
      const user = userEvent.setup()
      
      render(<LoginPage />)
      
      // 切换到短信验证
      await user.type(screen.getByPlaceholderText('用户名/邮箱/手机号'), 'user@example.com')
      await user.click(screen.getByRole('button', { name: '立即登录' }))
      await user.click(await screen.findByText('短信验证'))
      
      // 点击获取验证码
      const getCodeButton = screen.getByRole('button', { name: '获取验证码' })
      await user.click(getCodeButton)
      
      await waitFor(() => {
        expect(getCodeButton).toHaveTextContent(/60秒后重试/)
        expect(getCodeButton).toBeDisabled()
      })
      
      // 倒计时到0
      vi.advanceTimersByTime(60 * 1000)
      
      await waitFor(() => {
        expect(getCodeButton).toHaveTextContent('获取验证码')
        expect(getCodeButton).not.toBeDisabled()
      })
      
      vi.useRealTimers()
    })
  })
})
```

### 3.2 车票查询页面测试
    ```typescript
// src/pages/TicketQuery/__tests__/TicketQuery.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TicketQueryPage } from '../TicketQueryPage'

describe('TicketQueryPage', () => {
  it('应该渲染查询表单', () => {
    render(<TicketQueryPage />)
    
    expect(screen.getByLabelText('出发地')).toBeInTheDocument()
    expect(screen.getByLabelText('到达地')).toBeInTheDocument()
    expect(screen.getByLabelText('出发日期')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /查询/ })).toBeInTheDocument()
  })

  it('选择出发地应该显示自动补全', async () => {
    const user = userEvent.setup()
    render(<TicketQueryPage />)
    
    const fromInput = screen.getByLabelText('出发地')
    await user.type(fromInput, 'bei')
    
    await waitFor(() => {
      expect(screen.getByText(/北京/)).toBeInTheDocument()
    })
  })

  it('点击切换按钮应该交换出发地和到达地', async () => {
    const user = userEvent.setup()
    render(<TicketQueryPage />)
    
    // 选择出发地和到达地
    const fromInput = screen.getByLabelText('出发地')
    const toInput = screen.getByLabelText('到达地')
    
    await user.type(fromInput, 'bei')
    await user.click(await screen.findByText(/北京/))
    
    await user.type(toInput, 'sh')
    await user.click(await screen.findByText(/上海/))
    
    // 点击切换按钮
    const switchButton = screen.getByTitle('切换')
    await user.click(switchButton)
    
    expect(fromInput).toHaveValue('上海')
    expect(toInput).toHaveValue('北京')
  })

  it('出发地和到达地相同应该显示错误', async () => {
    const user = userEvent.setup()
    render(<TicketQueryPage />)
    
    const fromInput = screen.getByLabelText('出发地')
    const toInput = screen.getByLabelText('到达地')
    
    await user.type(fromInput, 'bei')
    await user.click(await screen.findByText(/北京/))
    
    await user.type(toInput, 'bei')
    await user.click(await screen.findByText(/北京/))
    
    const queryButton = screen.getByRole('button', { name: /查询/ })
    await user.click(queryButton)
    
    await waitFor(() => {
      expect(screen.getByText('出发地和到达地不能相同')).toBeInTheDocument()
    })
  })

  it('提交查询应该显示车次列表', async () => {
    const user = userEvent.setup()
    render(<TicketQueryPage />)
    
    // 选择出发地
    await user.type(screen.getByLabelText('出发地'), 'bei')
    await user.click(await screen.findByText(/北京/))
    
    // 选择到达地
    await user.type(screen.getByLabelText('到达地'), 'sh')
    await user.click(await screen.findByText(/上海/))
    
    // 选择日期
    await user.click(screen.getByLabelText('出发日期'))
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await user.click(screen.getByText(tomorrow.getDate().toString()))
    
    // 提交查询
    await user.click(screen.getByRole('button', { name: /查询/ }))
    
    await waitFor(() => {
      expect(screen.getByText('G1')).toBeInTheDocument()
      expect(screen.getByText('北京南')).toBeInTheDocument()
      expect(screen.getByText('上海虹桥')).toBeInTheDocument()
    })
  })

  it('切换到往返票应该显示返程日期', async () => {
    const user = userEvent.setup()
    render(<TicketQueryPage />)
    
    await user.click(screen.getByText('往返'))
    
    expect(screen.getByLabelText('去程日期')).toBeInTheDocument()
    expect(screen.getByLabelText('返程日期')).toBeInTheDocument()
  })

  it('返程日期早于去程应该显示错误', async () => {
    const user = userEvent.setup()
    render(<TicketQueryPage />)
    
    await user.click(screen.getByText('往返'))
    
    // 选择去程日期
    await user.click(screen.getByLabelText('去程日期'))
    const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    await user.click(screen.getByText(threeDaysLater.getDate().toString()))
    
    // 选择返程日期（早于去程）
    await user.click(screen.getByLabelText('返程日期'))
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await user.click(screen.getByText(tomorrow.getDate().toString()))
    
    await waitFor(() => {
      expect(screen.getByText('返程日期不能早于去程日期')).toBeInTheDocument()
    })
  })
})
```

---

    下一步: 后端API集成测试(tests_api_integration.ts)
