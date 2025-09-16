import React from "react";
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Home from "./Components/Home";
import Attendance from "./Components/Attendance"
import AttendanceWebSocket from "./Components/AttendanceWebSocket"
import Dashboard from "./Components/dash";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<AttendanceWebSocket/>} />
        <Route path="/attendance" element={<Attendance/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
        
      </Routes>
    </Router>
  );
}

export default App;