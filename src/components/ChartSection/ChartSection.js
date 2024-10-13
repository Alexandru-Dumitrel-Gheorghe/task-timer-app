// src/components/ChartSection/ChartSection.jsx
import React, { useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import styles from "./ChartSection.module.css"; // Actualizați calea dacă este necesar
import { FaChartBar } from "react-icons/fa"; // Importați iconița necesară

// Înregistrați componentele necesare din Chart.js
Chart.register(...registerables);

const ChartSection = ({ dailyData }) => {
  // Funcție ajutătoare pentru formatarea timpului din secunde în HH:MM:SS
  const formatTime = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  // Memoizați datele pentru a evita recalcularea la fiecare randare
  const chartData = useMemo(() => {
    // Gruparea datelor după numele produsului și categorie
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

    return {
      labels,
      datasets: [
        {
          label: "Verbrachte Zeit (Minuten)",
          data: timeData,
          backgroundColor: "rgba(75, 123, 236, 0.6)", // Inițială, vom schimba în CSS
          borderColor: "#4b7bec",
          borderWidth: 1,
          yAxisID: "y",
        },
        {
          label: "Anzahl der Arbeiten",
          data: countData,
          backgroundColor: "rgba(252, 92, 101, 0.6)", // Inițială, vom schimba în CSS
          borderColor: "#fc5c65",
          borderWidth: 1,
          yAxisID: "y1",
        },
      ],
    };
  }, [dailyData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: "easeInOutBounce",
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "var(--text-color)",
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "var(--tooltip-bg, #fff)",
        bodyColor: "var(--text-color)",
        titleColor: "var(--text-color)",
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
            const productDetails = chartData.labels[context.dataIndex];
            let tooltipLabel =
              datasetIndex === 0
                ? `Verbrachte Zeit: ${formatTime(value * 60)} (HH:MM:SS)` // Convertim în secunde pentru format
                : `Anzahl der Arbeiten: ${value}`;
            return `${tooltipLabel}\n${productDetails}`;
          },
        },
      },
    },
    interaction: {
      mode: "index",
      intersect: false, // Dezactivează intersecțiile pentru o interacțiune mai lină
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
          color: "var(--text-color)",
          font: {
            size: 14,
          },
        },
        ticks: {
          color: "var(--text-color)",
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <FaChartBar className={styles.chartIcon} />
        <h3 className={styles.chartTitle}>
          Produktzeit und Anzahl der Arbeiten
        </h3>
      </div>
      <div className={styles.chartWrapper}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ChartSection;
