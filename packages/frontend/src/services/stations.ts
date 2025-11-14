export interface Station {
    name: string
    pinyin?: string
}

const HOT_STATIONS: Station[] = [
    { name: '北京', pinyin: 'beijing' },
    { name: '上海', pinyin: 'shanghai' },
    { name: '天津', pinyin: 'tianjin' },
    { name: '重庆', pinyin: 'chongqing' },
    { name: '杭州', pinyin: 'hangzhou' },
    { name: '广州', pinyin: 'guangzhou' },
    { name: '深圳', pinyin: 'shenzhen' },
    { name: '南京', pinyin: 'nanjing' },
    { name: '武汉', pinyin: 'wuhan' },
    { name: '成都', pinyin: 'chengdu' },
    { name: '西安', pinyin: 'xian' },
    { name: '郑州', pinyin: 'zhengzhou' },
    { name: '长沙', pinyin: 'changsha' },
    { name: '沈阳', pinyin: 'shenyang' },
    { name: '济南', pinyin: 'jinan' },
]

const ALL_STATIONS: Station[] = HOT_STATIONS.concat([
    { name: '合肥', pinyin: 'hefei' },
    { name: '昆明', pinyin: 'kunming' },
    { name: '南宁', pinyin: 'nanning' },
    { name: '哈尔滨', pinyin: 'haerbin' },
    { name: '太原', pinyin: 'taiyuan' },
    { name: '兰州', pinyin: 'lanzhou' },
    { name: '银川', pinyin: 'yinchuan' },
    { name: '乌鲁木齐', pinyin: 'wulumuqi' },
])

export function listHotStations(): Promise<Station[]> {
    return Promise.resolve(HOT_STATIONS)
}

export function searchStations(query: string): Promise<Station[]> {
    if (!query) return Promise.resolve(ALL_STATIONS.slice(0, 30))
    const q = query.trim().toLowerCase()
    const result = ALL_STATIONS.filter(s => s.name.includes(q) || (s.pinyin && s.pinyin.includes(q)))
    return Promise.resolve(result)
}

export function groupedStations(): Promise<Record<string, Station[]>> {
    const groups: Record<string, Station[]> = {}
    for (const s of ALL_STATIONS) {
        const key = (s.pinyin && s.pinyin[0]?.toUpperCase()) || s.name[0]
        groups[key] = groups[key] || []
        groups[key].push(s)
    }
    return Promise.resolve(groups)
}
