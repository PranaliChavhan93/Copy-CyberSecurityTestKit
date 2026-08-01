import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";

import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;

    setEmail(value);

    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

    if (value === "") {
        setEmailError("");
    } else if (!emailRegex.test(value)) {
        setEmailError("Please enter a valid email address.");
    } else {
        setEmailError("");
    }
  };

  const handleSubmit = async (e) => {
      e.preventDefault();

      setError("");

      if (!email || !password) {
          setError("Please fill all the fields.");
          return;
      }
      
      if (emailError) {
          return;
      }

      setLoading(true);

      try {

          const response = await fetch("http://127.0.0.1:8000/login/", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({
                  email,
                  password
              })
          });

          const data = await response.json();

         if (response.ok && data.success) {
            sessionStorage.setItem("user_id", data.user_id);

            sessionStorage.setItem(
              "access",
              data.access
            );

            sessionStorage.setItem(
              "refresh",
              data.refresh
            );

            sessionStorage.setItem(
              "user",
              JSON.stringify(data.user)
            );

            navigate("/setup-mfa");
          } else {
              setError(data.message || "Invalid Credentials");
          }
      } catch (err) {
          console.log(err);
          setError("Unable to connect to server.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="login-container">
      <div className="login-image-section">
        <img src="/LockImg.jpg" alt="Security" style={{ width: "100%", height: "100%" }} />
      </div>

      <div className="login-form-section">
        <div className="login-wrapper">

          <div className="mobile-logo">
            <Shield className="logo-icon" />
            <p className="logo-text">Cybersecurity TestKit</p>
          </div>

          <div className="login-card">
            <div className="login-header">
              <h1>Welcome</h1>
              <p>Sign in to your security platform account</p>
            </div>

            <form onSubmit={handleSubmit}>

              {error && (
                <div className="error-box">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  {/* <Mail size={15} className="input-icon" /> */}
                  <input
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={handleChange}
                    // onChange={(e) => setEmail(e.target.value)}
                  />
                  {emailError && (
                      <p className="input-error">{emailError}</p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-wrapper">
                  {/* <Lock size={15} className="input-icon" /> */}
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? "Signing In..." : "Login"}
              </button>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

export default LoginPage;