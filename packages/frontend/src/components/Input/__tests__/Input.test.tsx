import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../Input';

describe('Input Component', () => {
  it('应该渲染输入框', () => {
    render(<Input placeholder="请输入用户名" />);
    const input = screen.getByPlaceholderText('请输入用户名');

    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('input');
  });

  it('应该处理值变化', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test@example.com');

    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue('test@example.com');
  });

  it('密码输入框应该隐藏内容', () => {
    render(<Input type="password" value="secret" readOnly />);
    const input = screen.getByDisplayValue('secret');

    expect(input).toHaveAttribute('type', 'password');
  });

  it('禁用状态应该不可编辑', async () => {
    const user = userEvent.setup();
    render(<Input disabled />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'test');

    expect(input).toBeDisabled();
    expect(input).toHaveValue('');
  });

  it('错误状态应该显示错误样式', () => {
    render(<Input error />);
    expect(screen.getByRole('textbox')).toHaveClass('error');
  });

  it('应该限制最大长度', async () => {
    const user = userEvent.setup();
    render(<Input maxLength={5} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '1234567890');

    expect(input).toHaveAttribute('maxLength', '5');
  });
});
