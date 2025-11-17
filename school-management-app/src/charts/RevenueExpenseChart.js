// charts/RevenueExpenseChart.js
import React, { useEffect, useLayoutEffect, useRef } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import styled from "styled-components";

const ChartWrapper = styled.div`
  width: 100%;
  height: 400px;
`;

const RevenueExpenseChart = ({ data, requestTypeFilter }) => {
  const chartRef = useRef(null);
  const textColor =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--text")
      .trim() || "#000000";

  useEffect(() => {
    console.log("Revenue and Expense data in chart:", data);
  }, [data]);

  useLayoutEffect(() => {
    if (!chartRef.current) return;

    // Create chart
    am4core.useTheme(am4themes_animated);
    const chart = am4core.create(chartRef.current, am4charts.XYChart);
    chart.padding(20, 0, 0, 0);

    // Create axes
    const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "month";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 30;
    categoryAxis.renderer.labels.template.fill = am4core.color(textColor);

    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.renderer.labels.template.fill = am4core.color(textColor);

    // Process data - extract the actual data array
    const chartData = data && data.data ? data.data : [];

    // Create series for revenue
    const revenueSeries = chart.series.push(new am4charts.ColumnSeries());
    revenueSeries.name = "Revenue";
    revenueSeries.dataFields.valueY = "revenue";
    revenueSeries.dataFields.categoryX = "month";
    revenueSeries.columns.template.fill = am4core.color("#f5ae3f");
    revenueSeries.columns.template.stroke = am4core.color("#f5ae3f");
    revenueSeries.columns.template.width = am4core.percent(40);

    // Add tooltip for revenue
    revenueSeries.columns.template.tooltipText =
      "{name}: ₹{valueY.formatNumber('#,###.##')}";

    // Add label bullet for revenue (only show if value > 0)
    const revenueLabelBullet = revenueSeries.bullets.push(
      new am4charts.LabelBullet()
    );
    revenueLabelBullet.label.text = "₹{valueY}";
    revenueLabelBullet.label.hideOversized = true;
    revenueLabelBullet.label.truncate = false;
    revenueLabelBullet.locationY = 0.5;
    revenueLabelBullet.label.dy = -10;
    revenueLabelBullet.label.fontSize = 10;
    // revenueLabelBullet.label.fill = am4core.color(textColor);
    revenueLabelBullet.label.adapter.add("text", function (text, target) {
      if (target.dataItem && target.dataItem.valueY > 0) {
        return "₹" + target.dataItem.valueY;
      }
      return "";
    });

    // Create series for expenses
    const expensesSeries = chart.series.push(new am4charts.ColumnSeries());
    expensesSeries.name = "Expenses";
    expensesSeries.dataFields.valueY = "expenses";
    expensesSeries.dataFields.categoryX = "month";
    expensesSeries.columns.template.fill = am4core.color("#e07a5f");
    expensesSeries.columns.template.stroke = am4core.color("#e07a5f");
    expensesSeries.columns.template.width = am4core.percent(40);

    // Add tooltip for expenses
    expensesSeries.columns.template.tooltipText =
      "{name}: ₹{valueY.formatNumber('#,###.##')}";

    // Add label bullet for expenses (only show if value > 0)
    const expensesLabelBullet = expensesSeries.bullets.push(
      new am4charts.LabelBullet()
    );
    expensesLabelBullet.label.text = "₹{valueY}";
    expensesLabelBullet.label.hideOversized = true;
    expensesLabelBullet.label.truncate = false;
    expensesLabelBullet.locationY = 0.5;
    expensesLabelBullet.label.dy = -10;
    expensesLabelBullet.label.fontSize = 10;
    expensesLabelBullet.label.adapter.add("text", function (text, target) {
      if (target.dataItem && target.dataItem.valueY > 0) {
        return "₹" + target.dataItem.valueY;
      }
      return "";
    });

    // Set data
    chart.data = chartData;
    chart.logo.disabled = true;

    // Add legend
    chart.legend = new am4charts.Legend();
    chart.legend.position = "bottom";
    chart.legend.labels.template.fill = am4core.color(textColor);
    chart.tooltip.label.fill = am4core.color(textColor);
    // Add cursor for better user experience
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.lineX.strokeOpacity = 0;
    chart.cursor.lineY.strokeOpacity = 0;

    // Clean up function
    return () => {
      if (chart) {
        chart.dispose();
      }
    };
  }, [data, requestTypeFilter]);

  return <ChartWrapper ref={chartRef} />;
};

export default RevenueExpenseChart;
