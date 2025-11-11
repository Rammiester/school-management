import React, { useLayoutEffect } from 'react';
import { create } from '@amcharts/amcharts4/core';
import {
  XYChart,
  CategoryAxis,
  ValueAxis,
  ColumnSeries,
  Legend,
  PieChart,
  PieSeries,
} from '@amcharts/amcharts4/charts';
import { color } from '@amcharts/amcharts4/core';
import styled from 'styled-components';
import { FaDollarSign, FaCalendarAlt, FaMoneyCheckAlt, FaChartPie } from 'react-icons/fa';

const BudgetExpensesDashboard = () => {
  useLayoutEffect(() => {
    let chart = create('budgetExpensesChartDiv', XYChart);
    chart.logo.disabled = true;

    chart.data = [
      { category: 'January', revenue: 5000, salary: 2000, utilities: 800, rent: 1200, electricity: 300, transportation: 500 },
      { category: 'February', revenue: 6000, salary: 2000, utilities: 900, rent: 1200, electricity: 350, transportation: 550 },
      { category: 'March', revenue: 7000, salary: 2500, utilities: 950, rent: 1300, electricity: 400, transportation: 600 },
      { category: 'April', revenue: 8000, salary: 2700, utilities: 1000, rent: 1400, electricity: 450, transportation: 650 },
    ];

    let categoryAxis = chart.xAxes.push(new CategoryAxis());
    categoryAxis.dataFields.category = 'category';

    let valueAxis = chart.yAxes.push(new ValueAxis());

    const createSeries = (name, field, fillColor) => {
      let series = chart.series.push(new ColumnSeries());
      series.dataFields.valueY = field;
      series.dataFields.categoryX = 'category';
      series.name = name;
      series.columns.template.fill = color(fillColor);
      series.columns.template.strokeWidth = 0;
      series.columns.template.tooltipText = '{name}: [bold]{valueY}[/]';
      series.legendSettings.valueText = '{valueY}';
    };

    // Revenue Series
    createSeries('Revenue', 'revenue', '#04d119');
    // Salary Expense Series
    createSeries('Salary', 'salary', '#eb050c');
    // Utilities Expense Series
    createSeries('Utilities', 'utilities', '#ff7f0e');
    // Rent Expense Series
    createSeries('Rent', 'rent', '#1f77b4');
    // Electricity Expense Series
    createSeries('Electricity', 'electricity', '#ffbf00');
    // Transportation Expense Series
    createSeries('Transportation', 'transportation', '#8a2be2');

    // Adding Legend
    chart.legend = new Legend();
    chart.legend.position = 'bottom';
    chart.legend.marginBottom = 20;

    // Hide legend on small screens
    const updateLegendVisibility = () => {
      if (window.innerWidth < 768) {
        chart.legend.disabled = true;
      } else {
        chart.legend.disabled = false;
      }
    };

    updateLegendVisibility();
    window.addEventListener('resize', updateLegendVisibility);

    return () => {
      chart.dispose();
      window.removeEventListener('resize', updateLegendVisibility);
    };
  }, []);

  useLayoutEffect(() => {
    let revenueChart = create('revenueChartDiv', PieChart);
    revenueChart.logo.disabled = true;

    revenueChart.data = [
      { category: 'January', value: 5000 },
      { category: 'February', value: 6000 },
      { category: 'March', value: 7000 },
      { category: 'April', value: 8000 },
    ];

    let revenueSeries = revenueChart.series.push(new PieSeries());
    revenueSeries.dataFields.value = 'value';
    revenueSeries.dataFields.category = 'category';
    revenueSeries.slices.template.strokeWidth = 0;
    revenueSeries.slices.template.tooltipText = '{category}: [bold]{value}[/]';
  }, []);

  useLayoutEffect(() => {
    let expensesChart = create('expensesChartDiv', XYChart);
    expensesChart.logo.disabled = true;

    expensesChart.data = [
      { category: 'January', salary: 2000, utilities: 800, rent: 1200, electricity: 300, transportation: 500 },
      { category: 'February', salary: 2000, utilities: 900, rent: 1200, electricity: 350, transportation: 550 },
      { category: 'March', salary: 2500, utilities: 950, rent: 1300, electricity: 400, transportation: 600 },
      { category: 'April', salary: 2700, utilities: 1000, rent: 1400, electricity: 450, transportation: 650 },
    ];

    let categoryAxis = expensesChart.xAxes.push(new CategoryAxis());
    categoryAxis.dataFields.category = 'category';

    let valueAxis = expensesChart.yAxes.push(new ValueAxis());

    const createStackedSeries = (name, field, fillColor) => {
      let series = expensesChart.series.push(new ColumnSeries());
      series.dataFields.valueY = field;
      series.dataFields.categoryX = 'category';
      series.name = name;
      series.columns.template.fill = color(fillColor);
      series.stacked = true;
      series.columns.template.strokeWidth = 0;
      series.columns.template.tooltipText = '{name}: [bold]{valueY}[/]';
    };

    // Stacked Expense Series
    createStackedSeries('Salary', 'salary', '#eb050c');
    createStackedSeries('Utilities', 'utilities', '#ff7f0e');
    createStackedSeries('Rent', 'rent', '#1f77b4');
    createStackedSeries('Electricity', 'electricity', '#ffbf00');
    createStackedSeries('Transportation', 'transportation', '#8a2be2');

    // Adding Legend
    expensesChart.legend = new Legend();
    expensesChart.legend.position = 'bottom';
    expensesChart.legend.marginBottom = 20;
  }, []);

  useLayoutEffect(() => {
    let upcomingChart = create('upcomingChartDiv', PieChart);
    upcomingChart.logo.disabled = true;

    upcomingChart.data = [
      { description: 'Office Rent', value: 1500 },
      { description: 'Employee Salary', value: 2000 },
      { description: 'Utilities', value: 700 },
    ];

    let upcomingSeries = upcomingChart.series.push(new PieSeries());
    upcomingSeries.dataFields.value = 'value';
    upcomingSeries.dataFields.category = 'description';
    upcomingSeries.slices.template.strokeWidth = 0;
    upcomingSeries.slices.template.tooltipText = '{description}: [bold]{value}[/]';
  }, []);

  return (
    <DashboardContainer>
      <HeaderSection>
        <h2>Budget and Expenses Dashboard</h2>
      </HeaderSection>
      <SummaryRow>
        <SummaryItem>
          <FaDollarSign size={30} />
          <div>
            <h3>Total Revenue</h3>
            <p>$26,000</p>
          </div>
        </SummaryItem>
        <SummaryItem>
          <FaMoneyCheckAlt size={30} />
          <div>
            <h3>Total Expenses</h3>
            <p>$18,500</p>
          </div>
        </SummaryItem>
        <SummaryItem>
          <FaChartPie size={30} />
          <div>
            <h3>Upcoming Expenses</h3>
            <p>$4,200</p>
          </div>
        </SummaryItem>
      </SummaryRow>
      <DetailsRow>
        <SectionRow>
          <Section>
            <h3>Total Revenue Breakdown</h3>
            <ChartContainer id="revenueChartDiv"></ChartContainer>
          </Section>
          
        </SectionRow>
        <Section>
          <h3>Total Expenses Breakdown</h3>
          <ChartContainer id="expensesChartDiv"></ChartContainer>
        </Section>
      </DetailsRow>
      <ChartContainer id="budgetExpensesChartDiv"></ChartContainer>
    </DashboardContainer>
  );
};

export default BudgetExpensesDashboard;

// Styled Components
const DashboardContainer = styled.div`
  width: 100%;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
`;

const HeaderSection = styled.div`
display:flex
  text-align: center;
  margin-bottom: 20px;
  h2 {
    color: #333;
    font-size: 1.8em;
  }
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  flex-wrap:wrap;
`;

const SummaryItem = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  flex: 1;
  margin: 10px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  h3 {
    font-size: 1.2em;
    color: #555;
  }

  p {
    font-size: 1.5em;
    font-weight: bold;
    color: #333;
  }

  svg {
    margin-right: 15px;
  }
`;

const DetailsRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
`;

const SectionRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 400px;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Section = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  flex: 1;

  h3 {
    font-size: 1.5em;
    color: #333;
    margin-bottom: 10px;
  }
`;
