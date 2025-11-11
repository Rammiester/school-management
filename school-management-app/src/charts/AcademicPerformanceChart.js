import React, { useEffect, useRef, useState } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

const AcademicPerformanceChart = ({ data = [], height = "250px" }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    let chart;
    let root;

    const isValidData = data && Array.isArray(data) && data.length > 0;
    setHasData(isValidData);

    if (chartRef.current) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }

      try {
        root = am5.Root.new(chartRef.current);

        root.setThemes([
          am5themes_Animated.new(root)
        ]);

        chart = root.container.children.push(am5xy.XYChart.new(root, {
          panX: false,
          panY: false,
          wheelX: "panX",
          wheelY: "zoomX",
          paddingLeft: 0,
          layout: root.verticalLayout
        }));

        const xRenderer = am5xy.AxisRendererX.new(root, {
          minorGridEnabled: true
        });

        const xAxis = chart.xAxes.push(
          am5xy.CategoryAxis.new(root, {
            categoryField: "year",
            renderer: xRenderer,
            tooltip: am5.Tooltip.new(root, {})
          })
        );

        if (isValidData) {
          xAxis.data.setAll(data);
        }

        const yRenderer = am5xy.AxisRendererY.new(root, {
          minGridDistance: 20,
          strokeOpacity: 0.1
        });

        const yAxis = chart.yAxes.push(
          am5xy.ValueAxis.new(root, {
            min: 0,
            maxDeviation: 0.1,
            renderer: yRenderer
          })
        );

        if (root._logo) {
          root._logo.dispose();
        }

        const series = chart.series.push(am5xy.ColumnSeries.new(root, {
          name: "Marks",
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "score",
          categoryXField: "year",
          sequencedInterpolation: true,
          tooltip: am5.Tooltip.new(root, {
            pointerOrientation: "horizontal",
            labelText: "[bold]{name}[/]\n{categoryX}: {valueY}%"
          })
        }));

        series.columns.template.setAll({
          width: am5.percent(80),
          strokeOpacity: 0,
          cornerRadiusTL: 6,
          cornerRadiusTR: 6,
          fill: am5.color("#8c2a1e")
        });

        if (isValidData) {
          series.data.setAll(data);
        } else {
          series.data.setAll([]);
        }

        const legend = chart.children.push(am5.Legend.new(root, {
          centerX: am5.p50,
          x: am5.p50
        }));
        legend.data.setAll(chart.series.values);

        const cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
          behavior: "zoomX"
        }));
        cursor.lineY.set("visible", false);

        if (isValidData) {
          series.appear(1000, 100);
          chart.appear(1000, 100);
        }

        chartInstanceRef.current = chart;
      } catch (error) {
        console.error("Error creating chart:", error);
      }
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
      if (root) {
        root.dispose();
      }
    };
  }, [data]);

  return (
    <div ref={chartRef} style={{ width: "100%", height: height }}>
      {!hasData && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'var(--text-light-color)',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          No academic performance data available
        </div>
      )}
    </div>
  );
};

export default AcademicPerformanceChart;
