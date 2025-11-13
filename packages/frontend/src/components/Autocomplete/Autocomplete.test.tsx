import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Autocomplete, AutocompleteOption } from '../Autocomplete';

describe('Autocomplete Component', () => {
  const mockStations: AutocompleteOption[] = [
    { station_id: 1, station_code: 'BJP', station_name: '北京', pinyin: 'beijing', pinyin_abbr: 'bj' },
    { station_id: 2, station_code: 'SHH', station_name: '上海', pinyin: 'shanghai', pinyin_abbr: 'sh' },
    { station_id: 3, station_code: 'BBH', station_name: '蚌埠', pinyin: 'bengbu', pinyin_abbr: 'bb' },
  ];

  it('输入时应该显示下拉列表', async () => {
    const user = userEvent.setup();
    render(<Autocomplete options={mockStations} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'bei');
    
    await waitFor(() => {
      expect(screen.getByText(/北京/)).toBeInTheDocument();
      expect(screen.queryByText(/上海/)).not.toBeInTheDocument();
    });
  });

  it('支持拼音搜索', async () => {
    const user = userEvent.setup();
    render(<Autocomplete options={mockStations} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'sh');
    
    await waitFor(() => {
      expect(screen.getByText(/上海/)).toBeInTheDocument();
    });
  });

  it('点击选项应该填充值', async () => {
    const handleSelect = vi.fn();
    render(<Autocomplete options={mockStations} onSelect={handleSelect} />);
    
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'bei');
    
    await waitFor(() => {
      const option = screen.getByText(/北京/);
      fireEvent.click(option);
    });
    
    expect(handleSelect).toHaveBeenCalledWith(mockStations[0]);
    expect(input).toHaveValue('北京');
  });

  it('键盘上下键应该导航选项', async () => {
    const user = userEvent.setup();
    render(<Autocomplete options={mockStations} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'b');
    
    await waitFor(() => {
      expect(screen.getByText(/北京/)).toBeInTheDocument();
    });
    
    // 按下箭头键
    await user.keyboard('{ArrowDown}');
    expect(screen.getAllByRole('option')[0]).toHaveClass('active');
    
    await user.keyboard('{ArrowDown}');
    expect(screen.getAllByRole('option')[1]).toHaveClass('active');
    
    await user.keyboard('{ArrowUp}');
    expect(screen.getAllByRole('option')[0]).toHaveClass('active');
  });

  it('按回车键应该选中当前激活项', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    render(<Autocomplete options={mockStations} onSelect={handleSelect} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'b');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');
    
    expect(handleSelect).toHaveBeenCalled();
  });

  it('清空输入应该隐藏下拉列表', async () => {
    const user = userEvent.setup();
    render(<Autocomplete options={mockStations} />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'bei');
    
    await waitFor(() => {
      expect(screen.getByText(/北京/)).toBeInTheDocument();
    });
    
    await user.clear(input);
    
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });
});
