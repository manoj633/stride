import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faCopy,
  faExclamationTriangle,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import "./TwoFactorSuccess.css";

const TwoFactorSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo, twoFactorSetup } = useSelector((state) => state.user);
  const { backupCodes = [] } = twoFactorSetup;

  useEffect(() => {
    // If no user info or 2FA isn't enabled, redirect to settings
    if (!userInfo || !userInfo.twoFactorEnabled) {
      navigate("/profile");
    }
  }, [userInfo, navigate]);

  const copyBackupCodes = () => {
    if (backupCodes.length) {
      const codesText = backupCodes.join("\n");
      navigator.clipboard
        .writeText(codesText)
        .then(() => {
          alert("Backup codes copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy backup codes:", err);
        });
    }
  };

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="two-factor-success">
      <div className="two-factor-success__container">
        <div className="two-factor-success__header">
          <FontAwesomeIcon
            icon={faCheckCircle}
            className="two-factor-success__icon"
          />
          <h1 className="two-factor-success__title">
            Two-Factor Authentication Enabled!
          </h1>
          <p className="two-factor-success__subtitle">
            Your account is now protected with an extra layer of security.
          </p>
        </div>

        {backupCodes && backupCodes.length > 0 ? (
          <div className="two-factor-success__backup-codes">
            <div className="two-factor-success__backup-header">
              <FontAwesomeIcon icon={faShieldAlt} />
              <h2>Your Backup Codes</h2>
            </div>

            <p className="two-factor-success__backup-info">
              Save these backup codes in a secure location. You can use them to
              sign in if you lose access to your authenticator app.
            </p>

            <div className="two-factor-success__codes-container">
              <div className="two-factor-success__codes-grid">
                {backupCodes.map((code, index) => (
                  <div key={index} className="two-factor-success__code">
                    {code}
                  </div>
                ))}
              </div>

              <button
                className="two-factor-success__copy-button"
                onClick={copyBackupCodes}
              >
                <FontAwesomeIcon icon={faCopy} /> Copy All Codes
              </button>
            </div>

            <div className="two-factor-success__warning">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <p>
                Each backup code can only be used once. Save them securely or
                write them down!
              </p>
            </div>
          </div>
        ) : (
          <div className="two-factor-success__no-backup">
            <p>
              No backup codes were generated. Two-factor authentication is still
              enabled.
            </p>
          </div>
        )}

        <div className="two-factor-success__next-steps">
          <h3>What's Next?</h3>
          <ul>
            <li>
              You'll need to enter a verification code each time you sign in
            </li>
            <li>Keep your authenticator app installed on your device</li>
            <li>Store your backup codes in a safe place</li>
          </ul>

          <button
            className="two-factor-success__continue-button"
            onClick={goToDashboard}
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorSuccess;
