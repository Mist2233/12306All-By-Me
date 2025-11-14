import React, { useEffect, useRef, useState } from 'react'
import { listHotStations, searchStations, groupedStations, Station } from '../../services/stations'
import './StationSelect.css'

interface Props {
    value: string
    placeholder?: string
    onChange: (v: string) => void
}

const StationSelect: React.FC<Props> = ({ value, placeholder, onChange }) => {
    const [open, setOpen] = useState(false)
    const [hot, setHot] = useState<Station[]>([])
    const [groups, setGroups] = useState<Record<string, Station[]>>({})
    const [query, setQuery] = useState('')
    const ref = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        listHotStations().then(setHot)
        groupedStations().then(setGroups)
    }, [])

    useEffect(() => {
        function onDoc(e: MouseEvent) {
            if (!ref.current) return
            if (!ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener('click', onDoc)
        return () => document.removeEventListener('click', onDoc)
    }, [])

    useEffect(() => {
        let mounted = true
        if (query) {
            searchStations(query).then(res => { if (mounted) setHot(res.slice(0, 20)) })
        } else {
            listHotStations().then(res => { if (mounted) setHot(res) })
        }
        return () => { mounted = false }
    }, [query])

    function pick(name: string) {
        onChange(name)
        setOpen(false)
        setQuery('')
    }

    return (
        <div className="station-select" ref={ref}>
            <input
                className="station-input"
                value={value}
                placeholder={placeholder}
                onFocus={() => setOpen(true)}
                onChange={(e) => { onChange(e.target.value); setQuery(e.target.value) }}
            />
            {open && (
                <div className="station-panel">
                    <div className="station-left">
                        <div className="tabs">
                            <div className="tab active">国内站点</div>
                            <div className="tab">国际站点</div>
                        </div>
                        <div className="hot-title">热门</div>
                        <div className="hot-list">
                            {hot.map(s => (
                                <button key={s.name} className="hot-item" onClick={() => pick(s.name)}>{s.name}</button>
                            ))}
                        </div>
                    </div>
                    <div className="station-right">
                        <div className="alpha-row">
                            {Object.keys(groups).sort().map(k => (
                                <a key={k} href={`#${k}`}>{k}</a>
                            ))}
                        </div>
                        <div className="groups">
                            {Object.keys(groups).sort().map(k => (
                                <div className="group" key={k} id={k}>
                                    <div className="group-title">{k}</div>
                                    <div className="group-list">
                                        {groups[k].map(s => (
                                            <button key={s.name} className="group-item" onClick={() => pick(s.name)}>{s.name}</button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default StationSelect
