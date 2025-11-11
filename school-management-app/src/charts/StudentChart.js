import React, { useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

const StudentChart = ({ student }) => {
  const chartRef = useRef(null);

  useLayoutEffect(() => {
    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, { panX: false, panY: false, wheelX: "none", wheelY: "none" })
    );

    const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, { categoryField: "subject" }));
    const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {}));

    const series = chart.series.push(am5xy.ColumnSeries.new(root, {
      name: "Marks",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "marks",
      categoryXField: "subject"
    }));

    series.data.setAll(Object.entries(student.results).map(([subject, marks]) => ({ subject, marks })));

    return () => root.dispose();
  }, [student]);

  return <div ref={chartRef} style={{ width: "100%", height: "300px" }} />;
};

export default StudentChart;
