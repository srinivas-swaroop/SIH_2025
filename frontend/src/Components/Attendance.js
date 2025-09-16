import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./index.css";

function Attendance() {
  const attendanceData = {
    "2025-09-10": ["Alice", "Bob", "Charlie"],
    "2025-09-11": ["Alice", "David"],
    "2025-09-12": ["Bob", "Charlie", "David", "Eva"],
  };

  const [selectedDate, setSelectedDate] = useState("");
  const [presentStudents, setPresentStudents] = useState([]);

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
          Select a date below to view who attended. This helps in keeping track
          of class participation and ensures transparency.
        </p>

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

        <div className="back-home">
          <Link to="/" className="back-btn">⬅ Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default Attendance;