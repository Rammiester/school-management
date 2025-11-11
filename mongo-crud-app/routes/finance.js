// routes/finance.js
const express = require('express');
const Earning = require('../models/Earning');
const router = express.Router();

const getDefaultDateRange = () => {
  const now = new Date();
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 3);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);
  return { startDate, endDate };
};

router.get('/summary', async (req, res) => {
  try {
    let { startDate, endDate, requestType } = req.query;
    
    if (!startDate || !endDate) {
      const defaultRange = getDefaultDateRange();
      startDate = defaultRange.startDate.toISOString();
      endDate = defaultRange.endDate.toISOString();
    }
    
    let query = { status: 'approved' };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (requestType) {
      query.requestType = requestType;
    }

    const earnings = await Earning.find(query).sort({ date: 1 });

    const totalRevenue = earnings
      .filter(earning => earning.type === 'revenue')
      .reduce((sum, earning) => sum + earning.earnings, 0);
    
    const totalExpenses = earnings
      .filter(earning => earning.type === 'expense')
      .reduce((sum, earning) => sum + earning.expenses, 0);
    
    const netProfit = totalRevenue - totalExpenses;

    const pendingRequests = await Earning.countDocuments({ status: 'pending' });

    res.json({
      totalRevenue,
      totalExpenses,
      netProfit,
      count: earnings.length,
      pendingRequests,
      dateRange: {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      }
    });
  } catch (error) {
    console.error('Error in /api/finance/summary:', error);
    res.status(500).json({ error: 'Failed to fetch finance summary' });
  }
});

router.get('/revenue-expense', async (req, res) => {
  try {
    let { startDate, endDate, requestType } = req.query;
    
    if (!startDate || !endDate) {
      const defaultRange = getDefaultDateRange();
      startDate = defaultRange.startDate.toISOString();
      endDate = defaultRange.endDate.toISOString();
    }
    
    let query = { status: 'approved' };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (requestType) {
      query.requestType = requestType;
    }

    const earnings = await Earning.find(query).sort({ date: 1 });

    if (requestType) {
      const startMonth = new Date(startDate);
      const endMonth = new Date(endDate);
      const monthsInRange = [];
      
      const currentMonth = new Date(startMonth.getFullYear(), startMonth.getMonth(), 1);
      while (currentMonth <= endMonth) {
        const monthName = currentMonth.toLocaleString('default', { month: 'short' }).toLowerCase();
        monthsInRange.push(monthName);
        currentMonth.setMonth(currentMonth.getMonth() + 1);
      }

      const monthlyData = {};
      monthsInRange.forEach(month => {
        monthlyData[month] = { 
          month: month.charAt(0).toUpperCase() + month.slice(1), 
          revenue: 0, 
          expenses: 0 
        };
      });
      
      earnings.forEach(earning => {
        const date = new Date(earning.date);
        const monthName = date.toLocaleString('default', { month: 'short' }).toLowerCase();
        
        if (monthlyData[monthName]) {
          if (earning.type === 'revenue') {
            monthlyData[monthName].revenue += earning.earnings;
          } else if (earning.type === 'expense') {
            monthlyData[monthName].expenses += earning.expenses;
          }
        }
      });

      const resultData = monthsInRange.map(month => monthlyData[month]);

      res.json({
        data: resultData,
        dateRange: {
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        }
      });
      return;
    }

    const startMonth = new Date(startDate);
    const endMonth = new Date(endDate);
    const monthsInRange = [];
    
    const currentMonth = new Date(startMonth.getFullYear(), startMonth.getMonth(), 1);
    while (currentMonth <= endMonth) {
      const monthName = currentMonth.toLocaleString('default', { month: 'short' }).toLowerCase();
      monthsInRange.push(monthName);
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }

    const monthlyData = {};
    monthsInRange.forEach(month => {
      monthlyData[month] = { month: month.charAt(0).toUpperCase() + month.slice(1), revenue: 0, expenses: 0 };
    });
    
    earnings.forEach(earning => {
      const date = new Date(earning.date);
      const monthName = date.toLocaleString('default', { month: 'short' }).toLowerCase();
      
      if (monthlyData[monthName]) {
        if (earning.type === 'revenue') {
          monthlyData[monthName].revenue += earning.earnings;
        } else if (earning.type === 'expense') {
          monthlyData[monthName].expenses += earning.expenses;
        }
      }
    });

    const resultData = monthsInRange.map(month => monthlyData[month]);

    res.json({
      data: resultData,
      dateRange: {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      }
    });
  } catch (error) {
    console.error('Error in /api/finance/revenue-expense:', error);
    res.status(500).json({ error: 'Failed to fetch revenue/expense data' });
  }
});

router.get('/revenue-breakdown', async (req, res) => {
  try {
    let { startDate, endDate, requestType } = req.query;
    
    if (!startDate || !endDate) {
      const defaultRange = getDefaultDateRange();
      startDate = defaultRange.startDate.toISOString();
      endDate = defaultRange.endDate.toISOString();
    }
    
    let query = { status: 'approved', type: 'revenue' };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (requestType) {
      query.requestType = requestType;
    }

    const earnings = await Earning.find(query).sort({ date: 1 });

    if (requestType) {
      const startMonth = new Date(startDate);
      const endMonth = new Date(endDate);
      const monthsInRange = [];
      
      const currentMonth = new Date(startMonth.getFullYear(), startMonth.getMonth(), 1);
      while (currentMonth <= endMonth) {
        const monthName = currentMonth.toLocaleString('default', { month: 'short' }).toLowerCase();
        monthsInRange.push(monthName);
        currentMonth.setMonth(currentMonth.getMonth() + 1);
      }

      const revenueBreakdownByMonth = {};
      monthsInRange.forEach(month => {
        revenueBreakdownByMonth[month] = {
          [requestType]: 0
        };
      });
      
      earnings.forEach(earning => {
        const date = new Date(earning.date);
        const monthName = date.toLocaleString('default', { month: 'short' }).toLowerCase();
        
        if (revenueBreakdownByMonth[monthName]) {
          revenueBreakdownByMonth[monthName][requestType] += earning.earnings;
        }
      });

      const formattedResponse = {};
      monthsInRange.forEach(month => {
        formattedResponse[month.charAt(0).toUpperCase() + month.slice(1)] = {
          data: revenueBreakdownByMonth[month]
        };
      });

      res.json({
        data: formattedResponse,
        dateRange: {
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        }
      });
      return;
    }

    const startMonth = new Date(startDate);
    const endMonth = new Date(endDate);
    const monthsInRange = [];
    
    const currentMonth = new Date(startMonth.getFullYear(), startMonth.getMonth(), 1);
    while (currentMonth <= endMonth) {
      const monthName = currentMonth.toLocaleString('default', { month: 'short' }).toLowerCase();
      monthsInRange.push(monthName);
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }

    const revenueBreakdownByMonth = {};
    const allRevenueTypes = ['school fee', 'hostel fee', 'uniform fee', 'other fees', 'donation', 'grant'];
    
    monthsInRange.forEach(month => {
      revenueBreakdownByMonth[month] = {};
      allRevenueTypes.forEach(type => {
        revenueBreakdownByMonth[month][type] = 0;
      });
    });
    
    earnings.forEach(earning => {
      const date = new Date(earning.date);
      const monthName = date.toLocaleString('default', { month: 'short' }).toLowerCase();
      
      if (revenueBreakdownByMonth[monthName]) {
        const requestType = earning.requestType || 'unknown';
        if (allRevenueTypes.includes(requestType)) {
          revenueBreakdownByMonth[monthName][requestType] += earning.earnings;
        }
      }
    });

    const formattedResponse = {};
    monthsInRange.forEach(month => {
      formattedResponse[month.charAt(0).toUpperCase() + month.slice(1)] = {
        data: revenueBreakdownByMonth[month]
      };
    });

    res.json({
      data: formattedResponse,
      dateRange: {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      }
    });
  } catch (error) {
    console.error('Error in /api/finance/revenue-breakdown:', error);
    res.status(500).json({ error: 'Failed to fetch revenue breakdown data' });
  }
});

router.get('/expense-breakdown', async (req, res) => {
  try {
    let { startDate, endDate, requestType } = req.query;
    
    if (!startDate || !endDate) {
      const defaultRange = getDefaultDateRange();
      startDate = defaultRange.startDate.toISOString();
      endDate = defaultRange.endDate.toISOString();
    }
    
    let query = { status: 'approved', type: 'expense' };
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (requestType) {
      query.requestType = requestType;
    }

    const expenses = await Earning.find(query);
    
    if (requestType) {
      const startMonth = new Date(startDate);
      const endMonth = new Date(endDate);
      const monthsInRange = [];
      
      const currentMonth = new Date(startMonth.getFullYear(), startMonth.getMonth(), 1);
      while (currentMonth <= endMonth) {
        const monthName = currentMonth.toLocaleString('default', { month: 'short' }).toLowerCase();
        monthsInRange.push(monthName);
        currentMonth.setMonth(currentMonth.getMonth() + 1);
      }

      const expenseBreakdownByMonth = {};
      monthsInRange.forEach(month => {
        expenseBreakdownByMonth[month] = {
          [requestType]: 0
        };
      });
      
      expenses.forEach(expense => {
        const date = new Date(expense.date);
        const monthName = date.toLocaleString('default', { month: 'short' }).toLowerCase();
        
        if (expenseBreakdownByMonth[monthName]) {
          expenseBreakdownByMonth[monthName][requestType] += expense.expenses;
        }
      });

      const formattedResponse = {};
      monthsInRange.forEach(month => {
        formattedResponse[month.charAt(0).toUpperCase() + month.slice(1)] = {
          data: expenseBreakdownByMonth[month]
        };
      });

      res.json({
        data: formattedResponse,
        dateRange: {
          startDate: new Date(startDate),
          endDate: new Date(endDate)
        }
      });
      return;
    }

    const startMonth = new Date(startDate);
    const endMonth = new Date(endDate);
    const monthsInRange = [];
    
    const currentMonth = new Date(startMonth.getFullYear(), startMonth.getMonth(), 1);
    while (currentMonth <= endMonth) {
      const monthName = currentMonth.toLocaleString('default', { month: 'short' }).toLowerCase();
      monthsInRange.push(monthName);
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }

    const expenseBreakdownByMonth = {};
    const allExpenseTypes = ['salary', 'food', 'admin office', 'housekeeping', 'stationary', 'other'];
    
    monthsInRange.forEach(month => {
      expenseBreakdownByMonth[month] = {};
      allExpenseTypes.forEach(type => {
        expenseBreakdownByMonth[month][type] = 0;
      });
    });
    
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthName = date.toLocaleString('default', { month: 'short' }).toLowerCase();
      
      if (expenseBreakdownByMonth[monthName]) {
        const requestType = expense.requestType;
        if (requestType && allExpenseTypes.includes(requestType)) {
          expenseBreakdownByMonth[monthName][requestType] += expense.expenses;
        } else if (!requestType || !allExpenseTypes.includes(requestType)) {
          expenseBreakdownByMonth[monthName]['other'] += expense.expenses;
        }
      }
    });

    const formattedResponse = {};
    monthsInRange.forEach(month => {
      formattedResponse[month.charAt(0).toUpperCase() + month.slice(1)] = {
        data: expenseBreakdownByMonth[month]
      };
    });

    res.json({
      data: formattedResponse,
      dateRange: {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      }
    });
  } catch (error) {
    console.error('Error in /api/finance/expense-breakdown:', error);
    res.status(500).json({ error: 'Failed to fetch expense breakdown data' });
  }
});

module.exports = router;
