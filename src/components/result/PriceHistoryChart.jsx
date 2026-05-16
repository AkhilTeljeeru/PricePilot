import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

function generateMockHistory(currentPrice) {
  const days = 30;
  const data = [];
  let price = currentPrice * (1 + Math.random() * 0.3);

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    price = price + (Math.random() - 0.55) * (currentPrice * 0.05);
    price = Math.max(currentPrice * 0.85, Math.min(price, currentPrice * 1.4));
    data.push({
      date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      price: Math.round(price),
    });
  }
  data[data.length - 1].price = currentPrice;
  return data;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-bold text-foreground">₹{payload[0].value?.toLocaleString('en-IN')}</p>
      </div>
    );
  }
  return null;
};

export default function PriceHistoryChart({ currentPrice }) {
  const data = useMemo(() => generateMockHistory(currentPrice || 10000), [currentPrice]);

  return (
    <div className="rounded-2xl bg-card border border-border/50 shadow-lg p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-lg bg-chart-1/15 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-chart-1" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">Price Trend</h3>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
        </div>
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(217 91% 60%)" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="hsl(217 91% 60%)"
              strokeWidth={2}
              fill="url(#priceGradient)"
              dot={false}
              activeDot={{ r: 4, fill: 'hsl(217 91% 60%)', stroke: 'white', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}