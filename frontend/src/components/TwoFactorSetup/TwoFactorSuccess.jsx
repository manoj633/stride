import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaClipboard, FaCheck } from "react-icons/fa";
import "./TwoFactorSuccess.css";

const TwoFactorSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Get backup codes from location state
  const backupCodes = location.state?.backupCodes || [];

  const handleCopyToClipboard = () => {
    const codesText = backupCodes.join("\n");
    navigator.clipboard
      .writeText(codesText)
      .then(() => {
        setCopiedToClipboard(true);
        toast.success("Backup codes copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy codes:", err);
        toast.error("Failed to copy codes");
      });
  };

  return (
    <div className="two-factor-success">
      <div className="two-factor-success__container">
        <h1 className="two-factor-success__title">
          Two-Factor Authentication Enabled
        </h1>

        <div className="two-factor-success__content">
          <div className="two-factor-success__main">
            <div className="two-factor-success__status">
              <div className="two-factor-success__status-icon">✓</div>
              <p>
                Your account is now protected with an additional layer of
                security.
              </p>
            </div>

            {backupCodes.length > 0 && (
              <div className="two-factor-success__backup-section">
                <h2>Save Your Backup Codes</h2>

                <div className="two-factor-success__info">
                  <h3>Important</h3>
                  <p>
                    Store these backup codes in a secure location. If you lose
                    access to your authenticator app, you can use one of these
                    codes to sign in. Each code can only be used once.
                  </p>
                </div>

                <div className="two-factor-success__codes-grid">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="two-factor-success__code">
                      {code}
                    </div>
                  ))}
                </div>

                <button
                  className="two-factor-success__copy-button"
                  onClick={handleCopyToClipboard}
                  aria-label="Copy all backup codes to clipboard"
                >
                  {copiedToClipboard ? (
                    <>
                      <FaCheck /> Copied to Clipboard
                    </>
                  ) : (
                    <>
                      <FaClipboard /> Copy All Codes
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="two-factor-success__actions">
              <button
                className="two-factor-success__button"
                onClick={() => navigate("/dashboard")}
                aria-label="Continue to dashboard"
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorSuccess;
