import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, AlertCircle } from "lucide-react";

import "./LoginPage.css";

function SetupMFA() {
  const navigate = useNavigate();

  const [qrCode, setQrCode] = useState("");
  const [totp, setTotp] = useState("");
  const [error, setError] = useState("");

  const user_id = sessionStorage.getItem("user_id");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/setup-mfa/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Authentication required. Please login again.");
          }
          throw new Error(`Server error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setQrCode(data.qr_code);
        } else {
          setError(data.message);
        }
      })
      .catch((error) => {
        console.error("Error fetching QR code:", error);
        setError(error.message || "Unable to load QR Code. Please try again.");
      });
  }, [user_id]);

  const verifyCode = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/verify-totp/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id,
            totp,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem("access", data.access);
        sessionStorage.setItem("refresh", data.refresh);
        sessionStorage.setItem("role", data.role);

        switch (data.role) {
          case "ADMIN":
            navigate("/admin");
            break;

          case "SUPPORTADMIN":
            navigate("/support-admin");
            break;

          case "TEST_MANAGER":
            navigate("/testmanager");
            break;

          case "TESTER":
            navigate("/tester");
            break;

          case "CUSTOMER":
            navigate("/customer");
            break;

          case "MASTER":
            navigate("/master");
            break;

          default:
            setError("Unknown user role.");
        }
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error(error);
      setError("Verification Failed.");
    }
  };

  return (
    <div className="login-container">

      <div className="login-image-section">
        <img
          src="/LockImg.jpg"
          alt="Security"
          className="login-image"
        />
      </div>

      <div className="login-form-section">
        <div className="login-wrapper">

          <div className="mobile-logo">
            <Shield className="logo-icon" />
            <p className="logo-text">Cybersecurity TestKit</p>
          </div>

          <div className="login-card">

            <div className="login-header">
              <h1>Verification</h1>
              <p>
                Scan the QR code using Google Authenticator
                and enter the generated TOTP.
              </p>
            </div>

            {error && (
              <div className="error-box">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {qrCode && (
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "25px",
                }}
              >
                <img
                  src={`data:image/png;base64,${qrCode}`}
                  alt="QR Code"
                  style={{
                    width: "220px",
                    height: "220px",
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    background: "#fff",
                  }}
                />
              </div>
            )}

            <div className="form-group">
              <label>Enter TOTP</label>

              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={totp}
                  onChange={(e) => setTotp(e.target.value)}
                />
              </div>
            </div>

            <button
              className="login-btn"
              onClick={verifyCode}
            >
              Verify
            </button>

          </div>

        </div>
      </div>

    </div>
  );
}

export default SetupMFA;