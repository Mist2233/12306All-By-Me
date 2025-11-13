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
