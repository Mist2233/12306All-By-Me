export async function bookTicket(body: {
    train_code: string
    from: string
    to: string
    date: string
    seat_type: 'business' | 'first' | 'second'
    passenger_name: string
    passenger_id?: string
}) {
    const res = await fetch('/api/v1/tickets/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
    if (!res.ok) {
        const txt = await res.text()
        throw new Error(`Book failed: ${res.status} ${txt}`)
    }
    const payload = await res.json()
    if (payload && payload.code === 0) return payload.data
    throw new Error(payload?.message || 'Booking error')
}
