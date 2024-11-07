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
        innerRadius: am5.percent(50),
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
          am5.color("#1a73e8"),
          am5.color("#4285f4"),
          am5.color("#8ab4f8"),
        ],
      })
    );

    series.slices.template.setAll({
      cornerRadius: 5,
      templateField: "settings",
      strokeWidth: 2,
      stroke: am5.color("#ffffff"),
    });

    series.labels.template.setAll({
      fontSize: 12,
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
      text: "{category}: {value}%",
    });

    let legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        marginTop: 15,
        marginBottom: 15,
      })
    );

    legend.labels.template.setAll({
      fontSize: 12,
      fontFamily:
        "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
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
        height: "300px",
        backgroundColor: "#ffffff",
        borderRadius: "8px",
      }}
    ></div>
  );
}

export default DonutChart;
