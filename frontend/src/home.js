// import React, { useRef } from "react";
// import Spline from "@splinetool/react-spline";
// import { Link, useNavigate } from "react-router-dom"; // combine imports
// import "./index.css";

// function Home() {
//   const navigate = useNavigate(); // define navigate first
//   const splineRef = useRef(null);

//   const handleLogout = () => {
//     navigate("/login"); // now it works
//   };

//   return (
//     <>
//       <div>
//         <button onClick={handleLogout} className="btn1">
//           Logout
//         </button>
//       </div>

//       <div className="home-container">
//         <div className="background">
//           <Spline
//             scene="https://prod.spline.design/avs5HRS2SHqkk84K/scene.splinecode"
//             onLoad={(spline) => (splineRef.current = spline)}
//           />
//         </div>

//         <div className="overlay">
//           <h1 className="title">Smart Attendance Portal</h1>
//           <p className="subtitle">
//             Manage student registrations and track attendance seamlessly.
//             <br />
//             Simple • Fast • Reliable
//           </p>

//           <div className="button-controls">
//             <Link to="/attendance" className="btn">
//               View Attendance
//             </Link>
//             <Link to="/register" className="btn">
//               Register New Student
//             </Link>
//           </div>
//         </div>

//         <div className="watermark-cover"></div>
//       </div>
//     </>
//   );
// }

// export default Home;



import React, { useRef } from "react";
import Spline from "@splinetool/react-spline";
import { Link, useNavigate } from "react-router-dom";
import "./index.css";

function Home() {
  const navigate = useNavigate();
  const splineRef = useRef(null);

  // ✅ Logout clears everything
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // ✅ Get username from localStorage (fallback if not set)
  const username = localStorage.getItem("username") || "User";

  return (
    <>
      {/* Logout Button */}
      <div>
        <button onClick={handleLogout} className="btn1">
          Logout
        </button>
      </div>

      <div className="home-container">
        {/* Background */}
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
          <br/>
          <p className="subtitle">
            Manage student registrations and track attendance seamlessly.
            <br />
            Simple • Fast • Reliable
          </p>

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
