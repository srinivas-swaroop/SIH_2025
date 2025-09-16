// import React, { useState } from "react";
// import { Link } from "react-router-dom"; 
// import "./index.css";

// function Attendance() {
//   const attendanceData = {
//     "2025-09-10": ["Alice", "Bob", "Charlie"],
//     "2025-09-11": ["Alice", "David"],
//     "2025-09-12": ["Bob", "Charlie", "David", "Eva"],
//   };

//   const [selectedDate, setSelectedDate] = useState("");
//   const [presentStudents, setPresentStudents] = useState([]);

//   const handleDateChange = (e) => {
//     const date = e.target.value;
//     setSelectedDate(date);
//     setPresentStudents(attendanceData[date] || []);
//   };

//   return (
//     <div className="attendance-container">
//       <div className="attendance-wrapper">
//         <h1 className="attendance-title">Attendance Tracker</h1>
//         <p className="attendance-desc">
//           Select a date below to view who attended. This helps in keeping track
//           of class participation and ensures transparency.
//         </p>

//         <div className="attendance-controls">
//           <input
//             type="date"
//             value={selectedDate}
//             onChange={handleDateChange}
//             className="attendance-date"
//           />
//         </div>

//         {selectedDate && (
//           <div className="attendance-card">
//             <h2 className="attendance-date-text">
//               Attendance on <span>{selectedDate}</span>
//             </h2>
//             <p className="attendance-count">
//               Present: {presentStudents.length}
//             </p>
//             {presentStudents.length > 0 ? (
//               <ul className="attendance-list">
//                 {presentStudents.map((student, i) => (
//                   <li key={i} className="attendance-item">
//                     {student}
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p className="no-attendance">No students present on this day.</p>
//             )}
//           </div>
//         )}

//         <div className="back-home">
//           <Link to="/" className="back-btn">⬅ Back to Home</Link>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Attendance;



import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./index.css";

function Attendance() {
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [presentStudents, setPresentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_BACKEND_URL || "";

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch(`${API_URL}/api/attendance-all/`);
        const data = await res.json();

        // Transform data into { date: [students] } format
        const grouped = {};
        data.forEach((entry) => {
          if (entry.present) {
            if (!grouped[entry.date]) grouped[entry.date] = [];
            grouped[entry.date].push(entry.student);
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
  }, [API_URL]);

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
                  <p className="no-attendance">
                    No students present on this day.
                  </p>
                )}
              </div>
            )}
          </>
        )}

        <div className="back-home">
          <Link to="/home" className="back-btn">
            ⬅ Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Attendance;
