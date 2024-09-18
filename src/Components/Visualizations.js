import React, { useState } from 'react';
import { 
  PieChart, Pie, Cell, 
  LineChart, Line, 
  BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const INITIAL_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Visualizations = ({ transactions }) => {
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState(new Date());
  const [chartColors, setChartColors] = useState(INITIAL_COLORS);
  const [pieChartType, setPieChartType] = useState('pie');

  const filterTransactionsByDate = (transactions, startDate, endDate) => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.transaction_date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  };

  const filteredTransactions = filterTransactionsByDate(transactions, startDate, endDate);

  // Spending by Category Pie Chart
  const preparePieChartData = (transactions) => {
    const categoryTotals = transactions.reduce((acc, transaction) => {
      if (transaction.amount < 0) { // Only consider expenses
        acc[transaction.category] = (acc[transaction.category] || 0) + Math.abs(transaction.amount);
      }
      return acc;
    }, {});

    return Object.entries(categoryTotals).map(([category, total]) => ({
      name: category,
      value: total
    }));
  };

  const SpendingByCategory = ({ transactions }) => {
    const data = preparePieChartData(transactions);

    return (
      <div>
        <h3>Spending by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              innerRadius={pieChartType === 'donut' ? 40 : 0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Income vs. Expenses Line Chart
  const prepareLineChartData = (transactions) => {
    const monthlyData = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.transaction_date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = { month: monthYear, income: 0, expenses: 0 };
      }
      
      if (transaction.amount > 0) {
        acc[monthYear].income += transaction.amount;
      } else {
        acc[monthYear].expenses += Math.abs(transaction.amount);
      }
      
      return acc;
    }, {});

    return Object.values(monthlyData).sort((a, b) => new Date(a.month) - new Date(b.month));
  };

  const IncomeVsExpenses = ({ transactions }) => {
    const data = prepareLineChartData(transactions);

    return (
      <div>
        <h3>Income vs. Expenses Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="income" stroke={chartColors[0]} />
            <Line type="monotone" dataKey="expenses" stroke={chartColors[1]} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Monthly Spending Comparison Bar Chart
  const prepareBarChartData = (transactions) => {
    const monthlySpending = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.transaction_date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = { month: monthYear, spending: 0 };
      }
      
      if (transaction.amount < 0) {
        acc[monthYear].spending += Math.abs(transaction.amount);
      }
      
      return acc;
    }, {});

    return Object.values(monthlySpending).sort((a, b) => new Date(a.month) - new Date(b.month));
  };

  const MonthlySpendingComparison = ({ transactions }) => {
    const data = prepareBarChartData(transactions);

    return (
      <div>
        <h3>Monthly Spending Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="spending" fill={chartColors[2]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Chart Customization Component
  const ChartCustomization = ({ colors, setColors, chartType, setChartType }) => {
    return (
      <div>
        <h3>Chart Customization</h3>
        <div>
          <label>Chart Type: </label>
          <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
            <option value="pie">Pie</option>
            <option value="donut">Donut</option>
          </select>
        </div>
        <div>
          <label>Chart Colors: </label>
          {colors.map((color, index) => (
            <input
              key={index}
              type="color"
              value={color}
              onChange={(e) => {
                const newColors = [...colors];
                newColors[index] = e.target.value;
                setColors(newColors);
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="visualizations">
      <h2>Visualizations</h2>
      
      <div className="date-range-picker">
        <h3>Select Date Range</h3>
        <DatePicker
          selected={startDate}
          onChange={date => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
        />
        <DatePicker
          selected={endDate}
          onChange={date => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
        />
      </div>

      <ChartCustomization 
        colors={chartColors} 
        setColors={setChartColors}
        chartType={pieChartType}
        setChartType={setPieChartType}
      />

      <SpendingByCategory transactions={filteredTransactions} />
      <IncomeVsExpenses transactions={filteredTransactions} />
      <MonthlySpendingComparison transactions={filteredTransactions} />
    </div>
  );
};

export default Visualizations;