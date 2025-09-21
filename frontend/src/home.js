import React, { useRef, useEffect } from "react";
import Spline from "@splinetool/react-spline";
import { Link, useNavigate } from "react-router-dom";
import "./index.css";

function Home() {
  const navigate = useNavigate();
  const splineRef = useRef(null);

  // ✅ Protect Home: redirect to login if not logged in
  useEffect(() => {
    const username = localStorage.getItem("username");
    const loginType = localStorage.getItem("loginType");

    if (!username || loginType !== "faculty") {
      navigate("/"); // redirect to login
    }
  }, [navigate]);

  // ✅ Logout: clear localStorage and navigate to login
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // ✅ Get username from localStorage, fallback to "User"
  const username = localStorage.getItem("username") || "User";

  return (
    <>
      {/* Logout Button */}
      <div style={{ position: "absolute", top: 20, right: 20, zIndex: 10 }}>
        <button onClick={handleLogout} className="btn1">
          Logout
        </button>
      </div>

      <div className="home-container">
        {/* Background Spline */}
        <div className="background">
          <Spline
            scene="https://prod.spline.design/avs5HRS2SHqkk84K/scene.splinecode"
            onLoad={(spline) => (splineRef.current = spline)}
          />
        </div>

        {/* Overlay Content */}
        <div className="overlay">
          <h1 className="title">Smart Attendance Portal</h1>
          <h2 className="welcome">Welcome, {username} 👋</h2>
          <br />
          <p className="subtitle">
            Manage student registrations and track attendance seamlessly.
            <br />
            Simple • Fast • Reliable
          </p>
 
            <Link  to="/RecogniseStudent" className="sidebtn" >
              Take Attendance
            </Link>

          {/* Navigation Buttons */}
          <div className="button-controls">
            <Link to="/attendance" className="btn">
              View Attendance
            </Link>
            <Link to="/register" className="btn">
              Register New Student
            </Link>
          </div>
        </div>

        <div className="watermark-cover"></div>
      </div>
    </>
  );
}

export default Home;
