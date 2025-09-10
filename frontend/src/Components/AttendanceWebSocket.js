import React, { useEffect, useRef, useState } from "react";

const AttendanceWebSocket = () => {
  const videoRef = useRef(null);
  const wsRef = useRef(null);
  const [recognized, setRecognized] = useState([]);
  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");

  const WS_OPEN = 1; // WebSocket.OPEN

  // Start webcam and WS connection
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

    // Connect WebSocket
    wsRef.current = new WebSocket("ws://localhost:8000/ws/attendance/");

    wsRef.current.onopen = () => {
      console.log("WebSocket connected ✅");

      // Live recognition: send frames every second
      wsRef.current.interval = setInterval(() => {
        if (!videoRef.current || wsRef.current.readyState !== WS_OPEN) return;

        const { videoWidth, videoHeight } = videoRef.current;
        if (!videoWidth || !videoHeight) return;

        const canvas = document.createElement("canvas");
        canvas.width = videoWidth;
        canvas.height = videoHeight;
        canvas.getContext("2d").drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        wsRef.current.send(JSON.stringify({ frame: canvas.toDataURL("image/jpeg") }));
      }, 1000);
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.recognized_students) setRecognized(data.recognized_students);
    };

    wsRef.current.onclose = () => console.log("WebSocket closed ❌");

    return () => {
      if (wsRef.current) {
        clearInterval(wsRef.current.interval);
        wsRef.current.close();
      }
    };
  }, []);

  // Capture a frame from webcam
  const captureFrame = () => {
    if (!videoRef.current) return null;

    const { videoWidth, videoHeight } = videoRef.current;
    if (!videoWidth || !videoHeight) return null;

    const canvas = document.createElement("canvas");
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg");
  };

  // Register a new student
  const registerStudent = async () => {
    if (!name || !rollNo) return alert("Enter name and roll number");
    const frame = captureFrame();
    if (!frame) return alert("Could not capture frame");

    try {
      const response = await fetch("http://localhost:8080/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, roll_no: rollNo, frame }),
      });

      const data = await response.json();
      alert(data.message || data.error);

      setName("");
      setRollNo("");
    } catch (err) {
      console.error("Registration failed:", err);
      alert("Failed to register student");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Attendance & Registration</h2>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        width="400"
        className="border rounded mb-4"
      />

      <div className="mb-4">
        <h3 className="font-semibold">Register Student</h3>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-1 mr-2"
        />
        <input
          type="text"
          placeholder="Roll No"
          value={rollNo}
          onChange={(e) => setRollNo(e.target.value)}
          className="border p-1 mr-2"
        />
        <button
          onClick={registerStudent}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
        >
          Capture & Register
        </button>
      </div>

      <div>
        <h3 className="font-semibold mt-2">Recognized Students:</h3>
        <ul>
          {recognized.length > 0
            ? recognized.map((s, i) => (
                <li key={i}>{s.name} ({s.roll_no})</li>
              ))
            : <li>No students recognized yet.</li>
          }
        </ul>
      </div>
    </div>
  );
};

export default AttendanceWebSocket;
