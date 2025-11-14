export interface TicketResult {
    train_code: string
    from_station: string
    to_station: string
    departure_time: string
    arrival_time: string
    duration: string
    business_seat: { price: number; available: number }
    first_class: { price: number; available: number }
    second_class: { price: number; available: number }
}

export async function queryTickets(from: string, to: string, date: string, train_type?: string) {
    const params = new URLSearchParams({ from, to, date })
    if (train_type) params.set('train_type', train_type)

    const res = await fetch(`/api/v1/tickets/query?${params.toString()}`)
    if (!res.ok) {
        const text = await res.text()
        throw new Error(`Tickets query failed: ${res.status} ${text}`)
    }
    const payload = await res.json()
    if (payload && payload.code === 0) {
        return payload.data.tickets as TicketResult[]
    }
    throw new Error(payload?.message || 'Unknown response')
}
