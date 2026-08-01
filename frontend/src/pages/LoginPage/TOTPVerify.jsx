import { useState } from "react";

function TOTPVerify() {

  const [totp, setTotp] = useState("");

  const verifyCode = async () => {

    const response = await fetch(
      "http://127.0.0.1:8000/verify-totp/",
      {
        method: "POST",
        headers: {
          "Content-Type":"application/json"
        },
        body: JSON.stringify({
          user_id: sessionStorage.getItem("user_id"),
          totp
        })
      }
    );
    const navigate = useNavigate();
    const data = await response.json();

    if(data.success){

      sessionStorage.setItem(
        "access",
        data.access
      );

      sessionStorage.setItem(
        "refresh",
        data.refresh
      );

      navigate("/dashboard");
    }
  };

  return (
    <>
      <input
        value={totp}
        onChange={(e)=>setTotp(e.target.value)}
      />

      <button onClick={verifyCode}>
        Verify
      </button>
    </>
  );
}

export default TOTPVerify;