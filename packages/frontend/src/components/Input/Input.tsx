import React, { InputHTMLAttributes } from 'react';
import './Input.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
}

export const Input: React.FC<InputProps> = ({
    error,
    className = '',
    ...props
}) => {
    const classes = [
        'input',
        error ? 'error' : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return <input className={classes} {...props} />;
};
