import React, { useRef } from "react";
import Spline from "@splinetool/react-spline";
import { Link } from "react-router-dom";
import "./index.css";

function Home() {
  const splineRef = useRef(null);

  return (
    <div className="home-container">
      <div className="background">
        <Spline
          scene="https://prod.spline.design/avs5HRS2SHqkk84K/scene.splinecode"
          onLoad={(spline) => (splineRef.current = spline)}
        />
      </div>

      <div className="overlay">
        <h1 className="title">Smart Attendance Portal</h1>
        <p className="subtitle">
          Manage student registrations and track attendance seamlessly.
          <br />
          Simple • Fast • Reliable
        </p>

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
  );
}

export default Home;