import React from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import styles from "./ProductChart.module.css";

// Înregistrăm componentele Chart.js
Chart.register(...registerables);

const ProductChart = ({ dailyData }) => {
  // Grupăm datele după numele produsului și categorie
  const groupedData = dailyData.reduce((acc, item) => {
    const key = `${item.productName}|${item.category}`;
    if (!acc[key]) {
      acc[key] = {
        time: 0,
        count: 0,
        productName: item.productName,
        category: item.category,
      };
    }
    acc[key].time += item.elapsedTime;
    acc[key].count += 1;
    return acc;
  }, {});

  const labels = Object.keys(groupedData).map((key) => {
    const [productName, category] = key.split("|");
    return `${productName} (${category})`;
  });

  const timeData = Object.values(groupedData).map((data) =>
    (data.time / 60).toFixed(2)
  );
  const countData = Object.values(groupedData).map((data) => data.count);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Verbrachte Zeit (Minuten)",
        data: timeData,
        borderColor: "#4b7bec",
        backgroundColor: "rgba(75, 123, 236, 0.2)",
        pointBackgroundColor: "#fff",
        pointBorderColor: "#4b7bec",
        pointHoverBackgroundColor: "#4b7bec",
        pointHoverBorderColor: "#fff",
        fill: true,
        tension: 0.4,
        yAxisID: "y",
      },
      {
        label: "Anzahl der Arbeiten",
        data: countData,
        borderColor: "#fc5c65",
        backgroundColor: "rgba(252, 92, 101, 0.2)",
        pointBackgroundColor: "#fff",
        pointBorderColor: "#fc5c65",
        pointHoverBackgroundColor: "#fc5c65",
        pointHoverBorderColor: "#fff",
        fill: true,
        tension: 0.4,
        yAxisID: "y1",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#333",
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#fff",
        bodyColor: "#333",
        titleColor: "#333",
        borderColor: "#ccc",
        borderWidth: 1,
        titleFont: {
          size: 16,
        },
        bodyFont: {
          size: 14,
        },
        callbacks: {
          label: (context) => {
            const datasetIndex = context.datasetIndex;
            const value = context.raw;
            const productDetails = labels[context.dataIndex];
            let tooltipLabel =
              datasetIndex === 0
                ? `Verbrachte Zeit: ${value} min`
                : `Anzahl der Arbeiten: ${value}`;
            return `${tooltipLabel}\n${productDetails}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        position: "left",
        title: {
          display: true,
          text: "Verbrachte Zeit (Minuten)",
          color: "#4b7bec",
          font: {
            size: 14,
          },
        },
        ticks: {
          color: "#4b7bec",
        },
      },
      y1: {
        beginAtZero: true,
        position: "right",
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: "Anzahl der Arbeiten",
          color: "#fc5c65",
          font: {
            size: 14,
          },
        },
        ticks: {
          color: "#fc5c65",
        },
      },
      x: {
        title: {
          display: true,
          text: "Produkte",
          color: "#333",
          font: {
            size: 14,
          },
        },
        ticks: {
          color: "#333",
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>Produktzeit und Anzahl der Arbeiten</h3>
      <div className={styles.chartWrapper}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ProductChart;
