// charts/TotalRevenueChart.js
import React, { useLayoutEffect, useRef } from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import styled from 'styled-components';

const ChartWrapper = styled.div`
  width: 100%;
  height: 400px;
`;

const TotalRevenueChart = ({ data }) => {
  const chartRef = useRef(null);

  useLayoutEffect(() => {
    if (!chartRef.current) return;
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#000000';

    am4core.useTheme(am4themes_animated);
    const chart = am4core.create(chartRef.current, am4charts.XYChart);
    chart.padding(20, 0, 0, 0);

    const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "month";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 30;
    categoryAxis.renderer.labels.template.fill = am4core.color(textColor);

    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.renderer.labels.template.disabled = false;
    valueAxis.calculateTotals = true;
    valueAxis.renderer.labels.template.fill = am4core.color(textColor);

    let chartData = [];
    
    if (data && data[0] && data[0].data) {
      const monthsData = data[0].data;
      const months = Object.keys(monthsData);
      
      chartData = months.map(month => {
        const monthRevenueData = monthsData[month]?.data || {};
        const total = Object.values(monthRevenueData).reduce((sum, val) => sum + (val || 0), 0);
        
        return {
          month: month,
          total: total,
          ...monthRevenueData
        };
      });
    }

    if (chartData.length > 0) {
      const revenueTypes = Object.keys(chartData[0]).filter(key => key !== 'month' && key !== 'total');
      
      const createSeries = (name, field, color) => {
        const series = chart.series.push(new am4charts.ColumnSeries());
        series.name = name;
        series.dataFields.valueY = field;
        series.dataFields.categoryX = "month";
        series.columns.template.fill = am4core.color(color);
        series.columns.template.stroke = am4core.color(color);
        series.stacked = true;
        series.columns.template.width = am4core.percent(60);
        series.columns.template.tooltipText = "[bold]{name}[/]\nAmount: {valueY}\nPercentage: {valueY.totalPercent.formatNumber('#.0')}%";

        const labelBullet = series.bullets.push(new am4charts.LabelBullet());
        labelBullet.label.text = "{valueY}";
        labelBullet.locationY = 0.5;
        labelBullet.label.hideOversized = true;
        labelBullet.label.fontSize = 10;
        labelBullet.label.fill = am4core.color(textColor);

        return series;
      };

      const colors = ["#476b6b", "#8c2a1e", "#dea08f", "#f5ae3f", "#2a5a8c", "#a16e99"];
      
      revenueTypes.forEach((type, index) => {
        createSeries(type.charAt(0).toUpperCase() + type.slice(1), type, colors[index % colors.length]);
      });
    }

    chart.data = chartData;
    chart.logo.disabled = true;
    chart.legend = new am4charts.Legend();
    chart.legend.position = "bottom";
    chart.legend.labels.template.fill = am4core.color(textColor);
    chart.tooltip.label.fill = am4core.color(textColor);

    return () => {
      if (chart) {
        chart.dispose();
      }
    };
  }, [data]);

  return <ChartWrapper ref={chartRef} />;
};

export default TotalRevenueChart;