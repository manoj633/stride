// src/components/Goals/DonutChart.jsx
import { useLayoutEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

function DonutChart({ data }) {
  useLayoutEffect(() => {
    let root = am5.Root.new("chartdiv");

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

    // Hide the default labels to prevent cutoff
    series.labels.template.setAll({
      visible: false,
    });

    // Hide the tick marks as well
    series.ticks.template.setAll({
      visible: false,
    });

    // Create custom legend with better styling
    let legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        marginTop: 20,
        marginBottom: 10,
        layout: root.verticalLayout,
      })
    );

    // Customize legend labels to show category and percentage
    legend.labels.template.setAll({
      fontSize: 13,
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
      fill: am5.color("#1a1a1a"),
      fontWeight: "500",
    });

    legend.valueLabels.template.setAll({
      fontSize: 14,
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
      fill: am5.color("#1a1a1a"),
      fontWeight: "700",
    });

    legend.data.setAll(series.dataItems);
    series.data.setAll(data);

    series.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [data]);

  return (
    <div
      id="chartdiv"
      style={{
        width: "100%",
        height: "320px",
        backgroundColor: "transparent",
        borderRadius: "8px",
      }}
    ></div>
  );
}

export default DonutChart;
