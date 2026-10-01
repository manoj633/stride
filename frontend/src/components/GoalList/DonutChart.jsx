import { useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

function DonutChart({ data, height = "220px" }) {
  const chartRef = useRef(null);
  const rootRef = useRef(null);
  const seriesRef = useRef(null);
  const legendRef = useRef(null);

  useLayoutEffect(() => {
    if (!chartRef.current) return;

    try {
      // Clean up any existing root on this container
      const existingRoot = am5.registry.rootElements.find(
        (r) => r.dom === chartRef.current
      );
      if (existingRoot) {
        existingRoot.dispose();
      }

      let root = am5.Root.new(chartRef.current);
      rootRef.current = root;

      root.setThemes([am5themes_Animated.new(root)]);

      let chart = root.container.children.push(
        am5percent.PieChart.new(root, {
          layout: root.verticalLayout,
          innerRadius: am5.percent(60),
          paddingTop: 0,
          paddingBottom: 10,
          paddingLeft: 0,
          paddingRight: 0,
        })
      );

      let series = chart.series.push(
        am5percent.PieSeries.new(root, {
          valueField: "value",
          categoryField: "category",
          alignLabels: false,
        })
      );
      seriesRef.current = series;

      series.set(
        "colors",
        am5.ColorSet.new(root, {
          colors: [
            am5.color("#3b82f6"),
            am5.color("#8b5cf6"),
            am5.color("#94a3b8"),
          ],
        })
      );

      series.slices.template.setAll({
        cornerRadius: 10,
        templateField: "settings",
        strokeWidth: 4,
        stroke: am5.color("#ffffff"),
      });

      series.labels.template.setAll({
        visible: false,
      });

      series.ticks.template.setAll({
        visible: false,
      });

      let legend = chart.children.push(
        am5.Legend.new(root, {
          centerX: am5.percent(50),
          x: am5.percent(50),
          marginTop: 10,
          marginBottom: 0,
          layout: root.verticalLayout,
        })
      );
      legendRef.current = legend;

      legend.labels.template.setAll({
        fontSize: 12,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
        fill: am5.color("#1a1a1a"),
        fontWeight: "500",
      });

      legend.valueLabels.template.setAll({
        fontSize: 13,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
        fill: am5.color("#1a1a1a"),
        fontWeight: "700",
      });

      if (Array.isArray(data)) {
        series.data.setAll(data);
        legend.data.setAll(series.dataItems);
      }

      series.appear(1000, 100);
    } catch (err) {
      console.error("DonutChart initialization error:", err);
    }

    return () => {
      if (rootRef.current) {
        rootRef.current.dispose();
        rootRef.current = null;
        seriesRef.current = null;
        legendRef.current = null;
      }
    };
  }, []);

  useLayoutEffect(() => {
    if (seriesRef.current && Array.isArray(data)) {
      try {
        seriesRef.current.data.setAll(data);
        if (legendRef.current) {
          legendRef.current.data.setAll(seriesRef.current.dataItems);
        }
      } catch (err) {
        console.error("DonutChart data update error:", err);
      }
    }
  }, [data]);

  return (
    <div
      ref={chartRef}
      style={{
        width: "100%",
        height: height,
        backgroundColor: "transparent",
        borderRadius: "8px",
      }}
    ></div>
  );
}

export default DonutChart;
