import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// 自动清理
afterEach(() => {
    cleanup()
})
