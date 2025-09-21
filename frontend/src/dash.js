import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import axios from "axios";
import "./index.css";

ChartJS.register(CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

function Dashboard() {
  const [presentData, setPresentData] = useState([]);
  const [absentData, setAbsentData] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);

  const username = localStorage.getItem("username");
  const API_URL = "http://127.0.0.1:8080";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Present Students
        const presentRes = await axios.get(`${API_URL}/api/attendance-all/`, {
          withCredentials: true,
        });
        const presentFiltered = presentRes.data.filter((a) => a.teacher === username);
        setPresentData(presentFiltered);

        // 2. Fetch All Students (to calculate absentees)
        const studentsRes = await axios.get(`${API_URL}/api/student-all/`, {
          withCredentials: true,
        });
        const teacherStudents = studentsRes.data.filter(
          (s) => s.teacher_username === username
        );

        // 3. Absentees = teacher students not in present list
        const presentIds = new Set(presentFiltered.map((a) => a.student));
        const absentList = teacherStudents.filter((s) => !presentIds.has(s.id));

        setAbsentData(absentList);

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  if (loading) return <p>Loading dashboard...</p>;

  // ✅ Filter by selected date
  const datePresent = selectedDate
    ? presentData.filter((a) => a.date === selectedDate)
    : [];
  const dateAbsent = selectedDate
    ? absentData.filter((a) => a.date === selectedDate)
    : [];

  // ✅ Gender Counts
  const maleCount = datePresent.filter((a) => a.gender?.toLowerCase() === "male").length;
  const femaleCount = datePresent.filter((a) => a.gender?.toLowerCase() === "female").length;

  // ✅ Doughnut chart: Present vs Absent
  const presentAbsentData = {
    labels: ["Present", "Absent"],
    datasets: [
      {
        data: [datePresent.length, dateAbsent.length],
        backgroundColor: ["#4caf50", "#f44336"],
      },
    ],
  };

  // ✅ Gender chart
  const genderData = {
    labels: ["Male", "Female"],
    datasets: [
      { data: [maleCount, femaleCount], backgroundColor: ["#2196f3", "#ff9800"] },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" } },
  };

  // ✅ Export Excel
  const handleExportExcel = () => {
    const data = datePresent.map((s) => ({ "Roll No": s.student, Name: s.student_name }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Present Students");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `PresentStudents_${selectedDate}.xlsx`);
  };

  return (
    <div className="attendance-container" style={{ padding: "15px" }}>
      <div className="attendance-wrapper" style={{ maxWidth: "950px", margin: "0 auto" }}>
        <h1 className="attendance-title">Dashboard for {username}</h1>

        {/* Date Picker */}
        <div className="attendance-controls" style={{ marginBottom: "10px" }}>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="attendance-date"
            style={{ padding: "5px 10px", fontSize: "13px" }}
          />
        </div>

        {/* Summary Card */}
        {selectedDate && (
          <div className="attendance-card" style={{ marginBottom: "15px", padding: "10px" }}>
            <h3>Attendance on {selectedDate}</h3>
            <p>Present: {datePresent.length}</p>
            <p>Absent: {dateAbsent.length}</p>
            <button className="btn" onClick={handleExportExcel} style={{ marginTop: "10px" }}>
              Export Excel
            </button>
          </div>
        )}

        {/* CHARTS - ONLY TWO CHARTS NOW */}
        <div className="attendance-graphs" style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
          <div style={{ height: "300px" }}>
            <h3>Present vs Absent</h3>
            <Doughnut data={presentAbsentData} options={chartOptions} />
          </div>

          <div style={{ height: "300px" }}>
            <h3>Male vs Female</h3>
            <Doughnut data={genderData} options={chartOptions} />
          </div>
        </div>

        <div style={{ marginTop: "50px" }}>
          <Link to="/attendance" className="back-btn">
            ⬅ Back to Attendance
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
