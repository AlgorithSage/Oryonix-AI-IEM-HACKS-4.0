import {
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

interface SeriesDef {
  key: string
  color?: string
}

interface ChartConfig {
  type: 'bar' | 'line' | 'area' | 'pie'
  title?: string
  xKey: string
  data: Record<string, string | number>[]
  series?: SeriesDef[]
}

const PALETTE = ['#f97316', '#fb923c', '#fdba74', '#ea580c', '#c2410c', '#fcd34d']

const TOOLTIP_STYLE = {
  background: '#1a0c08',
  border: '1px solid rgba(249,115,22,0.3)',
  borderRadius: 8,
  color: '#fafafa',
  fontSize: 12,
}

const AXIS_TICK = { fill: '#737373', fontSize: 11 }
const GRID_COLOR = 'rgba(249,115,22,0.08)'

function resolveKeys(config: ChartConfig) {
  if (config.series?.length) return config.series.map((s, i) => ({ key: s.key, color: s.color ?? PALETTE[i % PALETTE.length] }))
  const allKeys = Object.keys(config.data[0] ?? {}).filter(k => k !== config.xKey)
  return allKeys.map((k, i) => ({ key: k, color: PALETTE[i % PALETTE.length] }))
}

export function ChartBlock({ code }: { code: string }) {
  let config: ChartConfig
  try {
    config = JSON.parse(code)
  } catch {
    return (
      <pre style={{ color: '#f97316', fontSize: 11, padding: '8px', background: 'rgba(249,115,22,0.08)', borderRadius: 6 }}>
        ⚠ Invalid chart JSON
      </pre>
    )
  }

  if (!config.data?.length || !config.xKey) {
    return <div style={{ color: '#737373', fontSize: 12 }}>Chart: missing data or xKey.</div>
  }

  const series = resolveKeys(config)

  const shared = {
    data: config.data,
    margin: { top: 4, right: 12, left: -16, bottom: 0 },
  }

  let chart: React.ReactNode

  if (config.type === 'bar') {
    chart = (
      <BarChart {...shared}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
        <XAxis dataKey={config.xKey} tick={AXIS_TICK} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(249,115,22,0.06)' }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#a3a3a3' }} />
        {series.map(s => (
          <Bar key={s.key} dataKey={s.key} fill={s.color} radius={[4, 4, 0, 0]} maxBarSize={40} />
        ))}
      </BarChart>
    )
  } else if (config.type === 'line') {
    chart = (
      <LineChart {...shared}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
        <XAxis dataKey={config.xKey} tick={AXIS_TICK} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#a3a3a3' }} />
        {series.map(s => (
          <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.color} strokeWidth={2} dot={{ fill: s.color, r: 3 }} activeDot={{ r: 5 }} />
        ))}
      </LineChart>
    )
  } else if (config.type === 'area') {
    chart = (
      <AreaChart {...shared}>
        <defs>
          {series.map(s => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={s.color} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
        <XAxis dataKey={config.xKey} tick={AXIS_TICK} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#a3a3a3' }} />
        {series.map(s => (
          <Area key={s.key} type="monotone" dataKey={s.key} stroke={s.color} strokeWidth={2}
            fill={`url(#grad-${s.key})`} />
        ))}
      </AreaChart>
    )
  } else if (config.type === 'pie') {
    const valueKey = series[0]?.key ?? 'value'
    chart = (
      <PieChart>
        <Pie
          data={config.data}
          dataKey={valueKey}
          nameKey={config.xKey}
          cx="50%"
          cy="50%"
          outerRadius={75}
          innerRadius={32}
          paddingAngle={3}
          label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) + '%' : ''}`}
          labelLine={false}
        >
          {config.data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#a3a3a3' }} />
      </PieChart>
    )
  } else {
    return <div style={{ color: '#737373', fontSize: 12 }}>Unsupported chart type: {(config as any).type}</div>
  }

  return (
    <div className="chart-block">
      {config.title && <p className="chart-block-title">{config.title}</p>}
      <ResponsiveContainer width="100%" height={200}>
        {chart as React.ReactElement}
      </ResponsiveContainer>
    </div>
  )
}
