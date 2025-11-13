import React, { useState, useRef } from 'react';
import './SlideVerify.css';

export interface SlideVerifyProps {
    onSuccess?: (token: string) => void;
    onFail?: () => void;
}

export const SlideVerify: React.FC<SlideVerifyProps> = ({
    onSuccess,
    onFail,
}) => {
    const [isSliding, setIsSliding] = useState(false);
    const [slideDistance, setSlideDistance] = useState(0);
    const [isSuccess, setIsSuccess] = useState(false);
    const startX = useRef(0);
    const trackRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isSliding || !trackRef.current) return;

            const maxDistance = trackRef.current.offsetWidth - 50;
            const distance = Math.min(Math.max(0, e.clientX - startX.current), maxDistance);
            setSlideDistance(distance);
        };

        const handleMouseUp = () => {
            if (!isSliding || !trackRef.current) return;

            setIsSliding(false);
            const maxDistance = trackRef.current.offsetWidth - 50;
            const threshold = maxDistance * 0.9;

            if (slideDistance >= threshold) {
                setIsSuccess(true);
                setSlideDistance(maxDistance);
                const token = `nc_token_${Date.now()}_${Math.random().toString(36).substr(2)}`;
                onSuccess?.(token);
            } else {
                setSlideDistance(0);
                onFail?.();
            }
        };

        if (isSliding) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isSliding, slideDistance, onSuccess, onFail]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isSuccess) return;
        setIsSliding(true);
        startX.current = e.clientX;
    };

    return (
        <div
            className={`slide-verify ${isSuccess ? 'success' : ''}`}
            data-testid="slide-verify"
        >
            <div className="slide-track" ref={trackRef} data-testid="slide-track">
                <div className="slide-text">
                    {isSuccess ? '验证成功' : '请按住滑块拖动到最右边'}
                </div>
                <div
                    className="slide-button"
                    style={{ left: `${slideDistance}px` }}
                    onMouseDown={handleMouseDown}
                    data-testid="slide-button"
                >
                    {isSuccess ? '✓' : '>>'}
                </div>
            </div>
        </div>
    );
};
