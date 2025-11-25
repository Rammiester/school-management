import React, { useLayoutEffect, useRef } from 'react';
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";


const PieChartComponent = ({ data }) => {
  const chartRef = useRef(null);

  useLayoutEffect(() => {
    // Create root element
    let root = am5.Root.new(chartRef.current);

    // Apply a theme (optional)
    root.setThemes([am5themes_Animated.new(root)]);

    // Create a PieChart
    let chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout
      })
    );

    // Create a PieSeries and set its data fields
    let series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: 'value',
        categoryField: 'category'
      })
    );

    // Set chart data
    series.data.setAll(data);

    // Animate on load
    series.appear(1000, 100);

    // Cleanup when component unmounts
    return () => {
      root.dispose();
    };
  }, [data]);

  return (
    <div
      ref={chartRef}
      style={{ width: '100%', height: '400px', marginTop: '1rem' }}
    />
  );
};

export default PieChartComponent;
