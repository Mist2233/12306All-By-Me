import React, { ButtonHTMLAttributes } from 'react'
import './Button.css'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    block?: boolean
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    block = false,
    className = '',
    children,
    ...props
}) => {
    const classes = [
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        block && 'btn-block',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    )
}
