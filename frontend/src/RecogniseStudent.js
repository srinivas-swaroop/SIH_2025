import React, { useEffect, useRef, useState } from "react";
import "./index.css";

const RecognizeStudent = () => {
  const videoRef = useRef(null);
  const wsRef = useRef(null);
  const [recognized, setRecognized] = useState([]);
  const [facultyId, setFacultyId] = useState(null);

  const loggedInUsername = localStorage.getItem("username");

  // ✅ Fetch faculty ID using "raw fetching" technique
  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/faculty-all/", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // in case session/cookies are needed
        });

        if (!res.ok) throw new Error("Failed to fetch faculty list");

        const facultyList = await res.json();

        // filter after fetching
        const matchedFaculty = facultyList.filter((f) => f.username === loggedInUsername);
        if (matchedFaculty.length > 0) {
          setFacultyId(matchedFaculty[0].id);
        } else {
          console.error("Faculty not found for logged-in user");
        }
      } catch (err) {
        console.error("Error fetching faculty list:", err);
      }
    };

    fetchFaculty();
  }, [loggedInUsername]);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };
    startWebcam();

    wsRef.current = new WebSocket("ws://localhost:8000/ws/attendance/");

    wsRef.current.onopen = () => {
      console.log("Recognition WebSocket connected ✅");
      wsRef.current.interval = setInterval(() => {
        if (!videoRef.current || wsRef.current.readyState !== 1) return;

        const { videoWidth, videoHeight } = videoRef.current;
        if (!videoWidth || !videoHeight) return;

        const canvas = document.createElement("canvas");
        canvas.width = videoWidth;
        canvas.height = videoHeight;
        canvas.getContext("2d").drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        wsRef.current.send(JSON.stringify({ frame: canvas.toDataURL("image/jpeg") }));
      }, 2000);
    };

    wsRef.current.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.recognized_students) {
        setRecognized(data.recognized_students);

        for (const student of data.recognized_students) {
          if (!facultyId) continue;

          try {
            const response = await fetch("http://127.0.0.1:8080/api/attendance-mark/", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                roll_no: student.roll_no, // ✅ using roll_no
                // teacher: facultyId,
                date: new Date().toISOString().split("T")[0],
                present: true,
              }),
            });

            if (!response.ok) {
              const error = await response.json();
              console.error("Attendance save failed:", error);
            } else {
              console.log(`Attendance marked for ${student.name} (${student.roll_no})`);
            }
          } catch (err) {
            console.error("Error marking attendance:", err);
          }
        }
      }
    };

    return () => {
      if (wsRef.current) {
        clearInterval(wsRef.current.interval);
        wsRef.current.close();
      }
    };
  }, [facultyId]);

  return (
    <div className="recognize-page">
      <h2 className="recognize-title">Recognize Students (Attendance)</h2>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        width="400"
        className="recognize-video"
      />

      <ul className="recognize-list">
        {recognized.length > 0
          ? recognized.map((s, i) => (
              <li key={i}>
                {s.name} ({s.roll_no}){" "}
                <span className="recognize-check">✅ Attendance Marked</span>
              </li>
            ))
          : <li>No students recognized yet.</li>}
      </ul>
    </div>
  );
};

export default RecognizeStudent;
