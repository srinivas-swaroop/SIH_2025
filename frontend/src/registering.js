import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Snackbar, Alert, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import "./index.css";

export default function Registering() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("info");

  const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000"; // adjust if deployed

  const showAlert = (msg, type = "info") => {
    setAlertMsg(msg);
    setAlertType(type);
    setAlertOpen(true);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      showAlert("All fields are required", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/register-faculty/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();
      if (res.ok) {
        showAlert("Faculty account created successfully!", "success");
        setTimeout(() => navigate("/"), 1500);
      } else {
        showAlert(data.detail || data.error || "Registration failed", "error");
      }
    } catch (err) {
      console.error("Register error:", err);
      showAlert("Network or server error", "error");
    } finally {
      setLoading(false);
    }
  };

  const purpleField = {
    input: { color: "#a855f7" },
    "& .MuiInputLabel-root": { color: "#c084fc" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#9333ea" },
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: "#9333ea" },
      "&:hover fieldset": { borderColor: "#a855f7" },
      "&.Mui-focused fieldset": { borderColor: "#c084fc" },
    },
  };

  return (
    <div className="auth-page">
      <div className="auth-box1">
        <div className="auth-header">
          <h1 className="title">Faculty Register</h1>
        </div>

        <form className="auth-form" onSubmit={handleRegister}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            sx={purpleField}
          />

          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            sx={purpleField}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((s) => !s)} edge="end">
                    {showPassword ? (
                      <VisibilityOff sx={{ color: "white" }} />
                    ) : (
                      <Visibility sx={{ color: "white" }} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? "Please wait..." : "Register"}
          </button>
        </form>
      </div>

      <Snackbar
        open={alertOpen}
        autoHideDuration={4000}
        onClose={() => setAlertOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setAlertOpen(false)} severity={alertType} sx={{ width: "100%" }}>
          {alertMsg}
        </Alert>
      </Snackbar>
    </div>
  );
}
