import React, { ReactNode, useEffect } from 'react';
import './Modal.css';

export interface ModalProps {
    visible: boolean;
    title: string;
    children: ReactNode;
    onClose?: () => void;
    maskClosable?: boolean;
    width?: number;
}

export const Modal: React.FC<ModalProps> = ({
    visible,
    title,
    children,
    onClose,
    maskClosable = true,
    width = 520,
}) => {
    useEffect(() => {
        if (visible) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [visible]);

    if (!visible) return null;

    const handleMaskClick = () => {
        if (maskClosable && onClose) {
            onClose();
        }
    };

    const handleContentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div className="modal-wrapper">
            <div
                className="modal-mask"
                data-testid="modal-mask"
                onClick={handleMaskClick}
            />
            <div className="modal-content" style={{ width }} onClick={handleContentClick}>
                <div className="modal-header">
                    <div className="modal-title">{title}</div>
                    <button
                        className="modal-close"
                        onClick={onClose}
                        aria-label="close"
                    >
                        ×
                    </button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
};
