import React, { useState, useEffect } from "react";
import axios from "axios";
import { Doughnut, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [lateData, setLateData] = useState({ "5min": 0, "10min": 0, "15min": 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentRes = await axios.get("http://127.0.0.1:8000/api/student-all/");
        const attendanceRes = await axios.get("http://127.0.0.1:8000/api/attendance-all/");

        setStudents(studentRes.data);
        setAttendance(attendanceRes.data);

        const present = attendanceRes.data.length;
        const absent = studentRes.data.length - present;
        setPresentCount(present);
        setAbsentCount(absent);

        // Example late calculation
        let late5 = 0, late10 = 0, late15 = 0;
        const currentTime = new Date("2025-09-15T12:00:00"); // example start time
        attendanceRes.data.forEach(a => {
          const studentTime = new Date(`2025-09-15T${a.time}`);
          const diffMinutes = (studentTime - currentTime) / 60000;
          if(diffMinutes > 5 && diffMinutes <= 10) late5 += 1;
          if(diffMinutes > 10 && diffMinutes <= 15) late10 += 1;
          if(diffMinutes > 15) late15 += 1;
        });
        setLateData({ "5min": late5, "10min": late10, "15min": late15 });

      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const exportToExcel = () => {
    const data = students.map(s => {
      const isPresent = attendance.some(a => a.student_name === s.name);
      return { Name: s.name, Status: isPresent ? "P" : "A" };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "attendance.xlsx");
  };

  const attendanceDoughnutData = {
    labels: ["Present", "Absent"],
    datasets: [
      {
        data: [presentCount, absentCount],
        backgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  const genderBarData = {
    labels: ["Male", "Female"],
    datasets: [
      {
        label: "Number of Students",
        data: [0, 0], // update tomorrow with gender field
        backgroundColor: ["#FFCE56", "#FF6384"]
      }
    ]
  };

  // Stacked Horizontal Bar for Latecomers
  const lateStackedBarData = {
    labels: ["Late Students"],
    datasets: [
      {
        label: "5-10 min",
        data: [lateData["5min"]],
        backgroundColor: "#FFA500",
      },
      {
        label: "10-15 min",
        data: [lateData["10min"]],
        backgroundColor: "#FF4500",
      },
      {
        label: "15+ min",
        data: [lateData["15min"]],
        backgroundColor: "#8B0000",
      },
    ],
  };

  const lateOptions = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true }
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>Attendance Dashboard</h2>

      <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "40px" }}>
        <div style={{ width: "250px", height: "250px" }}>
          <h3 style={{ textAlign: "center" }}>Present vs Absent</h3>
          <Doughnut data={attendanceDoughnutData} />
        </div>

        <div style={{ width: "350px", height: "300px" }}>
          <h3 style={{ textAlign: "center" }}>Gender Distribution</h3>
          <Bar data={genderBarData} options={{ responsive: true, plugins: { legend: { display: false } }}} />
        </div>
      </div>

      <div style={{ width: "600px", margin: "0 auto", marginBottom: "40px" }}>
        <h3 style={{ textAlign: "center" }}>Late Comers</h3>
        <Bar data={lateStackedBarData} options={lateOptions} />
      </div>

      <div style={{ textAlign: "center" }}>
        <button
          onClick={exportToExcel}
          style={{
            backgroundColor: "#36A2EB",
            color: "#fff",
            padding: "10px 25px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Export to Excel
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
