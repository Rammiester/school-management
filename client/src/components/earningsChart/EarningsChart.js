import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { ChartCard } from './EarningsChart.styles';
import {Typography} from "antd";

const data = [
  { month: 'Jan', Earnings: 5000, Expenses: 3000 },
  { month: 'Feb', Earnings: 7000, Expenses: 4000 },
  { month: 'Mar', Earnings: 6500, Expenses: 4500 },
  { month: 'Apr', Earnings: 8000, Expenses: 5000 },
  { month: 'May', Earnings: 7500, Expenses: 4800 },
];

const EarningsChart = () => {
  return (

    <ChartCard title={<Typography>📊 Earnings vs Expenses</Typography>}>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fill: "#ffffff" }} />
          <YAxis tick={{ fill: "#ffffff" }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Earnings" fill="#f5ae3f" barSize={30} />
          <Bar dataKey="Expenses" fill="#e07a5f" barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default EarningsChart;
