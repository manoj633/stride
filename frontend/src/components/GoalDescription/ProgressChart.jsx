// ProgressChart.jsx
import React, { useEffect } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

const ProgressChart = ({ goal }) => {
  useEffect(() => {
    const chart = am4core.create("goal-chart", am4charts.PieChart3D);
    chart.data = [
      { category: "Completed", value: goal.completionPercentage },
      { category: "Remaining", value: 100 - goal.completionPercentage },
    ];

    const pieSeries = chart.series.push(new am4charts.PieSeries3D());
    pieSeries.dataFields.value = "value";
    pieSeries.dataFields.category = "category";
    pieSeries.innerRadius = am4core.percent(40);
    pieSeries.colors.list = [
      am4core.color("#1a73e8"),
      am4core.color("#e0e0e0"),
    ];

    return () => chart.dispose();
  }, [goal.completionPercentage]);

  return <div id="goal-chart" className="goal-description__chart-container" />;
};

export default ProgressChart;
