export interface OrderItem {
    id: string
    scheduleId: string
    trainNo: string
    from: string
    to: string
    date: string
    seatType: string
    count: number
    passengerName: string
    passengerId: string
    phone?: string
    email?: string
    status?: string
    createdAt?: string
}

export async function listOrders(): Promise<OrderItem[]> {
    const res = await fetch('/api/v1/tickets/orders')
    if (!res.ok) throw new Error('Failed to fetch orders')
    return res.json()
}

export async function getOrder(orderId: string): Promise<OrderItem> {
    const res = await fetch(`/api/v1/tickets/orders/${orderId}`)
    if (!res.ok) throw new Error('Failed to fetch order')
    return res.json()
}

export async function cancelOrder(orderId: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/v1/tickets/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) throw new Error('Failed to cancel order')
    return res.json()
}
