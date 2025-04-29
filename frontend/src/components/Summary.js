import { useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import './Summary.css';

// Enhanced color palette with better contrast and visual appeal
const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'];

export function Summary({ expenses }) {
  // Format currency with proper dollar sign and commas
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate total expenses
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  }, [expenses]);

  // Monthly summary
  const monthlySummary = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Get expenses for current month
    const thisMonthExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    
    // Calculate total for this month
    const thisMonthTotal = thisMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    
    // Get month name
    const monthName = now.toLocaleDateString('en-US', { month: 'long' });
    
    return {
      thisMonthTotal,
      monthName,
      count: thisMonthExpenses.length
    };
  }, [expenses]);

  // Category breakdown with percentage calculations
  const categoryData = useMemo(() => {
    const categoriesMap = {};
    expenses.forEach(e => {
      const category = e.category || 'other';
      const amount = Number(e.amount);
      categoriesMap[category] = (categoriesMap[category] || 0) + amount;
    });

    // Calculate total for percentages
    const total = Object.values(categoriesMap).reduce((sum, val) => sum + val, 0);
    
    // Convert to array and sort by amount (descending)
    return Object.entries(categoriesMap)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize
        value,
        percent: total > 0 ? Math.round((value / total) * 100) : 0
      }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Last 7 days trend
  const trendData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d.toISOString().slice(0, 10),
        amount: 0,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        formattedDate: formatDate(d)
      };
    });

    const dateIndex = days.reduce((acc, day, i) => ({
      ...acc,
      [day.date]: i
    }), {});

    expenses.forEach(e => {
      const date = e.date.slice(0, 10);
      if (dateIndex[date] !== undefined) {
        days[dateIndex[date]].amount += Number(e.amount);
      }
    });

    return days;
  }, [expenses]);

  // Calculate spending trends
  const spendingTrends = useMemo(() => {
    // If we have less than 2 months of data, return null
    if (expenses.length === 0) return null;

    // Find max expense amount for scaling
    const maxExpense = Math.max(...trendData.map(d => d.amount));
    
    // Calculate average daily spending
    const totalDays = trendData.filter(d => d.amount > 0).length || 1;
    const totalSpent = trendData.reduce((sum, d) => sum + d.amount, 0);
    const avgDaily = totalSpent / totalDays;

    return {
      maxExpense,
      avgDaily,
      hasData: totalSpent > 0
    };
  }, [trendData, expenses]);

  // Enhanced custom tooltip with better styling
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-pie-tooltip">
          <div className="tooltip-label">{payload[0].name}</div>
          <div className="tooltip-value">{formatCurrency(payload[0].value)}</div>
          <div className="tooltip-percent">{payload[0].payload.percent}% of total</div>
        </div>
      );
    }
    return null;
  };

  // Enhanced tooltip for area chart
  const LineChartTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-line-tooltip">
          <div className="tooltip-date">
            {payload[0].payload.day}, {payload[0].payload.formattedDate}
          </div>
          <div className="tooltip-amount">{formatCurrency(payload[0].value)}</div>
        </div>
      );
    }
    return null;
  };

  // Custom pie chart label
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label for segments that are large enough
    if (percent < 0.05) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {name}
      </text>
    );
  };

  // Customize legend
  const renderLegend = (props) => {
    const { payload } = props;
    
    return (
      <ul className="pie-legend">
        {payload.map((entry, index) => (
          <li key={`item-${index}`} className="legend-item">
            <div className="legend-color" style={{ backgroundColor: entry.color }}></div>
            <span className="legend-text">{entry.value}</span>
            <span className="legend-value">{formatCurrency(entry.payload.value)}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="expense-summary">
      <div className="summary-grid">
        {/* Total expenses box */}
        <div className="summary-card total-card">
          <div className="card-highlight"></div>
          <div className="card-content">
            <div className="card-title">TOTAL EXPENSES</div>
            <div className="highlight-amount">{formatCurrency(totalExpenses)}</div>
            <div className="card-subtitle">{expenses.length} transactions</div>
          </div>
        </div>

        {/* Monthly summary */}
        <div className="summary-card month-card">
          <div className="card-highlight"></div>
          <div className="card-content">
            <div className="card-title">This Month: <span className="accent-text">{monthlySummary.monthName}</span></div>
            <div className="highlight-amount">{formatCurrency(monthlySummary.thisMonthTotal)}</div>
            <div className="stat-container">
              <div className="stat-item">
                <div className="stat-label">Expenses</div>
                <div className="stat-value">{monthlySummary.count}</div>
              </div>
              {monthlySummary.count > 0 && (
                <div className="stat-item">
                  <div className="stat-label">Avg per Expense</div>
                  <div className="stat-value">
                    {formatCurrency(monthlySummary.thisMonthTotal / monthlySummary.count)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="summary-card pie-card">
          <div className="card-highlight"></div>
          <div className="card-content">
            <div className="card-title">Spending by Category</div>
            <div className="chart-container">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      labelLine={false}
                      label={renderCustomizedLabel}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          stroke="rgba(255,255,255,0.5)"
                          strokeWidth={1}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      content={renderLegend} 
                      verticalAlign="bottom" 
                      align="center" 
                      layout="horizontal"
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="no-data">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                  <p>No category data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Weekly trend */}
        <div className="summary-card trend-card">
          <div className="card-highlight"></div>
          <div className="card-content">
            <div className="card-title">Last 7 Days</div>
            {spendingTrends?.hasData ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${value}`} 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <Tooltip content={<LineChartTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#4f46e5" 
                      fillOpacity={1} 
                      fill="url(#colorExpense)"
                      activeDot={{ r: 6, stroke: '#4f46e5', strokeWidth: 2, fill: 'white' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="trend-insights">
                  <div className="insight-item">
                    <div className="insight-label">Average Daily</div>
                    <div className="insight-value">{formatCurrency(spendingTrends.avgDaily)}</div>
                  </div>
                  <div className="insight-item">
                    <div className="insight-label">Highest Day</div>
                    <div className="insight-value">{formatCurrency(spendingTrends.maxExpense)}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-data">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
                <p>No spending data for the last 7 days</p>
              </div>
            )}
          </div>
        </div>

        {/* Top categories list */}
        <div className="summary-card categories-card">
          <div className="card-highlight"></div>
          <div className="card-content">
            <div className="card-title">Top Categories</div>
            <div className="category-list">
              {categoryData.length > 0 ? (
                categoryData.slice(0, 5).map((category, index) => (
                  <div key={index} className="category-item">
                    <div className="category-bar-container">
                      <div 
                        className="category-bar" 
                        style={{ 
                          width: `${category.percent}%`, 
                          backgroundColor: COLORS[index % COLORS.length],
                          maxWidth: '100%'
                        }}
                      ></div>
                    </div>
                    <div className="category-info">
                      <div className="category-name-container">
                        <div 
                          className="category-color" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <div className="category-name">{category.name}</div>
                      </div>
                      <div className="category-details">
                        <div className="category-amount">{formatCurrency(category.value)}</div>
                        <div className="category-percent">{category.percent}%</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">
                  <p>No categories available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}