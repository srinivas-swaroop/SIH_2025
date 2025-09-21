import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./index.css";

function Attendance() {
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [presentStudents, setPresentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://127.0.0.1:8080";
  const username = localStorage.getItem("username"); // logged-in teacher

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch(`${API_URL}/api/attendance-all/`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch attendance data");

        const data = await res.json();

        // Filter attendance for only this teacher
        const teacherAttendance = data.filter(
          (entry) => entry.teacher === username
        );

        // Transform into { date: [students] }
        const grouped = {};
        teacherAttendance.forEach((entry) => {
          if (entry.status === "Present") {
            if (!grouped[entry.date]) grouped[entry.date] = [];
            grouped[entry.date].push(entry.student_name);
          }
        });

        setAttendanceData(grouped);
      } catch (err) {
        console.error("Error fetching attendance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [username]);

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setPresentStudents(attendanceData[date] || []);
  };

  return (
    <div className="attendance-container">
      <div className="attendance-wrapper">
        <h1 className="attendance-title">Attendance Tracker</h1>
        <p className="attendance-desc">
          Welcome, <strong>{username || "Teacher"}</strong> 👋 <br />
          Select a date below to view who attended.
        </p>

        {loading ? (
          <p>Loading attendance...</p>
        ) : (
          <>
            <div className="attendance-controls">
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="attendance-date"
              />
            </div>

            {selectedDate && (
              <div className="attendance-card">
                <h2 className="attendance-date-text">
                  Attendance on <span>{selectedDate}</span>
                </h2>
                <p className="attendance-count">
                  Present: {presentStudents.length}
                </p>

                {presentStudents.length > 0 ? (
                  <ul className="attendance-list">
                    {presentStudents.map((student, i) => (
                      <li key={i} className="attendance-item">
                        {student}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-attendance">No students present on this day.</p>
                )}
              </div>
            )}
          </>
        )}

        <div className="nav-buttons">
          <br/>
          <Link to="/home" className="back-btn">
            ⬅ Back to Home
          </Link>
          <Link to="/dash" className="btn" state={{ selectedDate }}>
            View Dashboard
          </Link>
           <Link to="/Absentees" className="btn">
            Send Mails
          </Link>

        </div>
      </div>
    </div>
  );
}

export default Attendance;
