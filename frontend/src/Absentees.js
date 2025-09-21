import React, { useEffect, useState } from "react";
import axios from "axios";

const AttendanceManager = () => {
  const [absentees, setAbsentees] = useState([]);

  useEffect(() => {
    const fetchAbsentees = async () => {
      try {
        // 1. Get logged-in teacher from local storage
        const teacherUsername = localStorage.getItem("username");
        if (!teacherUsername) {
          console.error("No teacher found in localStorage");
          return;
        }

        // 2. Fetch all students & filter by teacher
        const studentsRes = await axios.get("http://127.0.0.1:8080/api/student-all/");
        const teacherStudents = studentsRes.data.filter(
          (s) => s.teacher_username === teacherUsername
        );

        // 3. Fetch attendance & filter by teacher
        const attendanceRes = await axios.get("http://127.0.0.1:8080/api/attendance-all/");
        const teacherAttendance = attendanceRes.data.filter(
          (a) => a.teacher === teacherUsername
        );

        // 4. Extract present student IDs
        const presentIds = new Set(teacherAttendance.map((a) => a.student));

        // 5. Absentees = teacher students not in present list
        const absentList = teacherStudents.filter((s) => !presentIds.has(s.id));
        setAbsentees(absentList);

        // 6. Post absentees (same format as students-all API)
        if (absentList.length > 0) {
          const res = await axios.post("http://127.0.0.1:8080/api/absentees/", absentList, {
            headers: { "Content-Type": "application/json" },
          });
          console.log("✅ Absentees posted:", res.data);
        } else {
          console.log("🎉 No absentees today");
        }
      } catch (err) {
        console.error("Error while processing absentees:", err);
      }
    };

    fetchAbsentees();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Absentees</h2>
      {absentees.length > 0 ? (
        <ul className="list-disc pl-6">
          {absentees.map((student) => (
            <li key={student.id}>
              {student.name} ({student.roll_no}) - {student.gender}
            </li>
          ))}
        </ul>
      ) : (
        <p>✅ No absentees today</p>
      )}
    </div>
  );
};

export default AttendanceManager;