import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SlideVerify } from '../SlideVerify';

describe('SlideVerify Component', () => {
    beforeEach(() => {
        // Mock offsetWidth for track element
        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
            configurable: true,
            value: 300,
        });
    });

    it('应该渲染滑动验证组件', () => {
        render(<SlideVerify />);

        expect(screen.getByText('请按住滑块拖动到最右边')).toBeInTheDocument();
        expect(screen.getByTestId('slide-button')).toBeInTheDocument();
    });

    it('拖动滑块到最右边应该触发成功回调', async () => {
        const handleSuccess = vi.fn();
        render(<SlideVerify onSuccess={handleSuccess} />);

        const button = screen.getByTestId('slide-button');

        // 模拟拖动
        await act(async () => {
            fireEvent.mouseDown(button, { clientX: 0 });
            fireEvent.mouseMove(document, { clientX: 280 }); // 拖到90%以上
            fireEvent.mouseUp(document);
        });

        expect(handleSuccess).toHaveBeenCalledWith(expect.any(String));
    });

    it('拖动不到位应该失败', async () => {
        const handleSuccess = vi.fn();
        const handleFail = vi.fn();
        render(<SlideVerify onSuccess={handleSuccess} onFail={handleFail} />);

        const button = screen.getByTestId('slide-button');

        await act(async () => {
            fireEvent.mouseDown(button, { clientX: 0 });
            fireEvent.mouseMove(document, { clientX: 100 }); // 只拖一半
            fireEvent.mouseUp(document);
        });

        expect(handleSuccess).not.toHaveBeenCalled();
        expect(handleFail).toHaveBeenCalled();
    });

    it('成功后应该显示成功状态', async () => {
        render(<SlideVerify />);

        const button = screen.getByTestId('slide-button');

        await act(async () => {
            fireEvent.mouseDown(button, { clientX: 0 });
            fireEvent.mouseMove(document, { clientX: 280 });
            fireEvent.mouseUp(document);
        });

        expect(screen.getByTestId('slide-verify')).toHaveClass('success');
    });
});
