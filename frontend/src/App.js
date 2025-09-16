import React from "react";
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Home from "./home.js";
import Attendance from "./attendance"
import AttendanceWebSocket from "./AttendanceWebSocket.js"
import Login from "./login.js";
import Registering from "./registering"
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<AttendanceWebSocket/>} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/home" element={<Home/>}/>
        <Route path="registering" element={<Registering/>}/>
      </Routes>
    </Router>
  );
}

export default App;