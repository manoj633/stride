import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { useNavigate } from "react-router-dom";
import { verifyAndEnableTwoFactor } from "../../store/features/users/userSlice";
import { toast } from "react-toastify";
import { QRCodeCanvas } from "qrcode.react";

const TwoFactorSetup = () => {
  const [token, setToken] = useState("");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { qrCodeUrl, secret, loading, error } = useAppSelector(
    (state) => state.user.twoFactorSetup
  );

  // Redirect if no QR code data is available
  useEffect(() => {
    if (!qrCodeUrl && !secret) {
      toast.error("No 2FA setup data available. Please try again.");
      navigate("/profile");
    }
  }, [qrCodeUrl, secret, navigate]);

  // Add effect to handle errors
  useEffect(() => {
    if (error) {
      toast.error(error || "Verification failed");
    }
  }, [error]);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!token || token.length < 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    try {
      // Add console log to debug
      console.log("Verifying token:", token);

      const result = await dispatch(
        verifyAndEnableTwoFactor({ token })
      ).unwrap();
      console.log("Verification result:", result);

      toast.success("Two-factor authentication enabled successfully!");
      navigate("/two-factor-success");
    } catch (err) {
      console.error("Verification error:", err);
      toast.error(err?.message || "Verification failed. Please try again.");
    }
  };

  return (
    <div className="two-factor-setup">
      <h1>Set Up Two-Factor Authentication</h1>
      <p>Scan this QR code with your authenticator app:</p>

      {qrCodeUrl && (
        <div className="qrcode-container">
          <QRCodeCanvas value={qrCodeUrl} size={200} />
        </div>
      )}

      <p>
        Or enter this code manually: <strong>{secret}</strong>
      </p>

      <form onSubmit={handleVerify}>
        <div className="form-group">
          <label>Enter the 6-digit code from your app:</label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter code"
            required
            pattern="[0-9]*"
            inputMode="numeric"
            maxLength="6"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Verify & Enable 2FA"}
        </button>
      </form>

      {loading && <p>Verifying your code...</p>}
    </div>
  );
};

export default TwoFactorSetup;
