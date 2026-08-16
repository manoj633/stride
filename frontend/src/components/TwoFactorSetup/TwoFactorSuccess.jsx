import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaClipboard, FaCheck, FaDownload } from "react-icons/fa";
import "./TwoFactorSuccess.css";

const TwoFactorSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

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

  const handleDownload = () => {
    const codesText = backupCodes.join("\n");
    const blob = new Blob([codesText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "stride-backup-codes.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    toast.success("Backup codes downloaded successfully");
  };

  const canContinue = copiedToClipboard || downloaded;

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

                <div className="two-factor-success__buttons-container">
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

                  <button
                    className="two-factor-success__download-button"
                    onClick={handleDownload}
                    aria-label="Download backup codes as a text file"
                  >
                    {downloaded ? (
                      <>
                        <FaCheck /> Downloaded
                      </>
                    ) : (
                      <>
                        <FaDownload /> Download Codes
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="two-factor-success__actions">
              <button
                className="two-factor-success__button"
                onClick={() => navigate("/")}
                disabled={!canContinue}
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
