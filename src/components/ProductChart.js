// src/components/ProductChart.js
import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

// Register Chart.js components
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
        backgroundColor: [
          "rgba(46, 204, 113, 0.6)",
          "rgba(52, 152, 219, 0.6)",
          "rgba(231, 76, 60, 0.6)",
          "rgba(241, 196, 15, 0.6)",
          "rgba(155, 89, 182, 0.6)",
          "rgba(230, 126, 34, 0.6)",
        ],
        borderColor: [
          "rgba(46, 204, 113, 1)",
          "rgba(52, 152, 219, 1)",
          "rgba(231, 76, 60, 1)",
          "rgba(241, 196, 15, 1)",
          "rgba(155, 89, 182, 1)",
          "rgba(230, 126, 34, 1)",
        ],
        borderWidth: 2,
        borderRadius: 5,
        hoverBackgroundColor: "rgba(44, 62, 80, 0.8)",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#2c3e50",
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
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
      title: {
        display: true,
        text: "Produktive Zeitübersicht",
        color: "#2c3e50",
        font: {
          size: 18,
          weight: "bold",
        },
        padding: {
          top: 20,
          bottom: 30,
        },
      },
      datalabels: {
        anchor: "end",
        align: "top",
        color: "#2c3e50",
        font: {
          size: 12,
          weight: "bold",
        },
        formatter: (value) => {
          const hrs = Math.floor(value / 3600);
          const mins = Math.floor((value % 3600) / 60);
          return `${hrs}h ${mins}m`;
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
            size: 16,
            weight: "bold",
          },
        },
        ticks: {
          color: "#34495e",
          stepSize: 500,
          font: {
            size: 12,
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Produkt",
          color: "#2c3e50",
          font: {
            size: 16,
            weight: "bold",
          },
        },
        ticks: {
          color: "#34495e",
          font: {
            size: 12,
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
      },
    },
    animation: {
      duration: 1500,
      easing: "easeInOutQuad",
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
      },
    },
    hover: {
      animationDuration: 800,
      mode: "nearest",
      intersect: true,
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
  };

  return (
    <div
      style={{
        marginTop: "30px",
        height: "500px",
        padding: "20px",
        backgroundColor: "#ecf0f1",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h3
        style={{ textAlign: "center", color: "#2c3e50", marginBottom: "20px" }}
      >
        Verbrachte Zeit auf Produkte
      </h3>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ProductChart;
