import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { useNavigate } from "react-router-dom";
import { verifyAndEnableTwoFactor } from "../../store/features/users/userSlice";
import { toast } from "react-toastify";
import { QRCodeCanvas } from "qrcode.react";

import "./TwoFactorSetup.css";
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
      const result = await dispatch(
        verifyAndEnableTwoFactor({ token })
      ).unwrap();

      if (result.backupCodes && result.backupCodes.length > 0) {
        navigate("/two-factor-success", {
          state: { backupCodes: result.backupCodes },
        });
      } else {
        toast.success("Two-factor authentication enabled successfully!");
        navigate("/two-factor-success");
      }
    } catch (err) {
      console.error("Verification error:", err);
      toast.error(err?.message || "Verification failed. Please try again.");
    }
  };

  return (
    <div className="two-factor-setup">
      <div className="two-factor-setup__container">
        <h1 className="two-factor-setup__title">
          Set Up Two-Factor Authentication
        </h1>

        <div className="two-factor-setup__content">
          <div className="two-factor-setup__instructions">
            <h2>Scan QR Code</h2>
            <p>Scan this QR code with your authenticator app:</p>

            {qrCodeUrl && (
              <div className="two-factor-setup__qrcode">
                <QRCodeCanvas value={qrCodeUrl} size={200} />
              </div>
            )}

            <div className="two-factor-setup__manual-entry">
              <h3>Or enter this code manually:</h3>
              <div className="two-factor-setup__secret-code">{secret}</div>
            </div>
          </div>

          <div className="two-factor-setup__verification">
            <h2>Verify Your Setup</h2>
            <form onSubmit={handleVerify} className="two-factor-setup__form">
              <div className="two-factor-setup__form-group">
                <label>Enter the 6-digit code from your app:</label>
                <input
                  type="text"
                  className="two-factor-setup__input"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="000000"
                  required
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength="6"
                />
              </div>
              <button
                type="submit"
                className={`two-factor-setup__button ${
                  loading ? "two-factor-setup__button--loading" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Enable 2FA"}
              </button>
            </form>

            {loading && (
              <div className="two-factor-setup__loading">
                <p>Verifying your code...</p>
              </div>
            )}
          </div>
        </div>

        <div className="two-factor-setup__info">
          <h3>Why use Two-Factor Authentication?</h3>
          <p>
            Two-factor authentication adds an extra layer of security to your
            account by requiring both your password and a code from your mobile
            device.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorSetup;
