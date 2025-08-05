document.addEventListener("DOMContentLoaded", () => {
  const monthSelect = document.getElementById("monthSelect");
  const generateBtn = document.getElementById("generate-chart");
  const salesChartCtx = document.getElementById("salesChart").getContext("2d");
  const chartContainer = document.getElementById("chartContainer");
  const salesRecords = document.getElementById("salesRecords");

  let chartInstance = null;

  // Fetch available months from backend
  fetch("/months")
    .then((res) => res.json())
    .then((months) => {
      monthSelect.innerHTML = "";

      if (!months.length) {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "No data available";
        monthSelect.appendChild(option);
        return;
      }

      months.forEach((month) => {
        const option = document.createElement("option");
        option.value = month;
        option.textContent = month;
        monthSelect.appendChild(option);
      });

      // Auto-select latest month and trigger chart
      monthSelect.value = months[0];
      generateBtn.click();
    })
    .catch((err) => {
      console.error("Error fetching months:", err);
      monthSelect.innerHTML = "<option>Error loading months</option>";
    });

  // Generate chart on button click
  generateBtn.addEventListener("click", () => {
    const selectedMonth = monthSelect.value;
    if (!selectedMonth) return;

    fetch(`/sales-data?month=${encodeURIComponent(selectedMonth)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.length) {
          chartContainer.style.visibility = "hidden";
          salesRecords.innerHTML = "<p>No sales data available for this month.</p>";
          return;
        }

        const labels = data.map((d) => d.date);
        const totals = data.map((d) => parseFloat(d.total_price));
        chartContainer.style.visibility = "visible";

        if (chartInstance) chartInstance.destroy();

        chartInstance = new Chart(salesChartCtx, {
          type: "line",
          data: {
            labels: labels,
            datasets: [{
              label: "Total Sales (MYR)",
              data: totals,
              fill: true,
              borderColor: "#4CAF50",
              backgroundColor: "rgba(76, 175, 80, 0.1)",
              tension: 0.3
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: "top" },
              title: { display: true, text: `Sales Data for ${selectedMonth}` }
            },
            scales: {
              x: { title: { display: true, text: "Date" } },
              y: { title: { display: true, text: "Sales (MYR)" }, beginAtZero: true }
            }
          }
        });

        // Show records
        salesRecords.innerHTML = "<h2>Sales Records</h2>";
        data.forEach((record) => {
          const div = document.createElement("div");
          div.className = "record";
          div.textContent = `${record.date} - RM ${parseFloat(record.total_price).toFixed(2)} (${record.name})`;
          salesRecords.appendChild(div);
        });
      })
      .catch((err) => {
        console.error("Error fetching sales data:", err);
        chartContainer.style.visibility = "hidden";
        salesRecords.innerHTML = "<p>Error loading sales data.</p>";
      });
  });

  // Auto-refresh every 5 minutes
  setInterval(() => {
    generateBtn.click();
  }, 5 * 60 * 1000);
});
