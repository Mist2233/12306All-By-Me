import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '../Modal';

describe('Modal Component', () => {
  it('visible为true时应该显示模态框', () => {
    render(
      <Modal visible={true} title="测试模态框">
        <div>模态框内容</div>
      </Modal>
    );

    expect(screen.getByText('测试模态框')).toBeInTheDocument();
    expect(screen.getByText('模态框内容')).toBeInTheDocument();
  });

  it('visible为false时不应该显示', () => {
    render(
      <Modal visible={false} title="测试模态框">
        <div>模态框内容</div>
      </Modal>
    );

    expect(screen.queryByText('测试模态框')).not.toBeInTheDocument();
  });

  it('点击关闭按钮应该触发onClose', () => {
    const handleClose = vi.fn();
    render(
      <Modal visible={true} title="测试" onClose={handleClose}>
        内容
      </Modal>
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('点击遮罩层应该触发onClose', () => {
    const handleClose = vi.fn();
    render(
      <Modal visible={true} title="测试" onClose={handleClose} maskClosable>
        内容
      </Modal>
    );

    const mask = screen.getByTestId('modal-mask');
    fireEvent.click(mask);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('maskClosable为false时点击遮罩不关闭', () => {
    const handleClose = vi.fn();
    render(
      <Modal visible={true} title="测试" onClose={handleClose} maskClosable={false}>
        内容
      </Modal>
    );

    const mask = screen.getByTestId('modal-mask');
    fireEvent.click(mask);

    expect(handleClose).not.toHaveBeenCalled();
  });
});
