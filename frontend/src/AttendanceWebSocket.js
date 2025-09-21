import React, { useRef, useState, useEffect } from "react";
import "./index.css";

const RegisterStudent = () => {
  const videoRef = useRef(null);
  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  // const [teacherId, setTeacherId] = useState(null);
  const [gender,setGender] = useState("");
  const [email,setEmail] = useState("");
  const loggedInUsername = localStorage.getItem("username");

  useEffect(() => {
    // Start webcam
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };
    startWebcam();
  }, []);

  const captureFrame = () => {
    const { videoWidth, videoHeight } = videoRef.current;
    if (!videoWidth || !videoHeight) return null;

    const canvas = document.createElement("canvas");
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg");
  };

  const registerStudent = async () => {
    if (!name || !rollNo) return alert("Enter name and roll number");
    const frame = captureFrame();
    if (!frame) return alert("Could not capture frame");

    try {
      // Step 1: Fetch all teachers
      const res = await fetch("http://localhost:8000/api/faculty-all/");
      const teachers = await res.json();

      // Step 2: Find the logged-in teacher
      const matchedTeacher = teachers.find((t) => t.username === loggedInUsername);
      if (!matchedTeacher) return alert("Logged-in teacher not found in faculty list");

      const teacherIdToUse = matchedTeacher.id;

      // Step 3: Register the student under that teacher
      const response = await fetch("http://localhost:8000/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, roll_no: rollNo, frame, teacher: teacherIdToUse,gender,email}),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setName("");
        setRollNo("");
        setGender("");
        setEmail("");
      } else {
        alert(data.error || data.detail);
      }
    } catch (err) {
      console.error("Registration failed:", err);
      alert("Failed to register student");
    }
  };

  return (
    <div className="register-page">
      <h2 className="register-title">Register New Student</h2>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        width="400"
        className="register-video"
      />

      <div className="register-inputs">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="register-input"
        />
        <input
          type="text"
          placeholder="Roll No"
          value={rollNo}
          onChange={(e) => setRollNo(e.target.value)}
          className="register-input"
        />
        <input
          type="text"
          placeholder="Gender"
          value={gender}
          className="register-input"
          onChange={(e)=>setGender(e.target.value)}
        />
        <input
        type="email"
        placeholder="Email"
        value={email}
        className="register-input"
        onChange={(e)=>setEmail(e.target.value)}
        />
      </div>

      <button onClick={registerStudent} className="register-btn">
        Capture & Register
      </button>
    </div>
  );
};

export default RegisterStudent;
