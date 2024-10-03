// src/components/ProductChart.js
import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const ProductChart = ({ dailyData }) => {
  // Group data by productName and sum the elapsedTime
  const groupedData = dailyData.reduce((acc, item) => {
    if (acc[item.productName]) {
      acc[item.productName] += item.elapsedTime;
    } else {
      acc[item.productName] = item.elapsedTime;
    }
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(groupedData),
    datasets: [
      {
        label: "Verbrachte Zeit (Sekunden)",
        data: Object.values(groupedData),
        backgroundColor: "rgba(46, 204, 113, 0.6)",
        borderColor: "rgba(46, 204, 113, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#2c3e50",
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const timeSpent = context.raw;
            const hrs = Math.floor(timeSpent / 3600);
            const mins = Math.floor((timeSpent % 3600) / 60);
            const secs = timeSpent % 60;
            return [
              `Verbrachte Zeit: ${timeSpent} Sekunden`,
              `Formatiert: ${hrs}h ${mins}m ${secs}s`,
            ];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Sekunden",
          color: "#2c3e50",
          font: {
            size: 14,
          },
        },
        ticks: {
          color: "#34495e",
        },
      },
      x: {
        title: {
          display: true,
          text: "Produkt",
          color: "#2c3e50",
          font: {
            size: 14,
          },
        },
        ticks: {
          color: "#34495e",
        },
      },
    },
  };

  return (
    <div style={{ marginTop: "30px" }}>
      <h3 style={{ textAlign: "center", color: "#2c3e50" }}>
        Verbrachte Zeit auf Produkte
      </h3>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ProductChart;
