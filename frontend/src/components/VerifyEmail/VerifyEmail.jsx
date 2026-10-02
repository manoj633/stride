import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppDispatch } from "../../store/hooks";
import { setTwoFactorSetupData } from "../../store/features/users/userSlice";
import { userAPI } from "../../services/api/urlService";
import "./VerifyEmail.css";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [status, setStatus] = useState("verifying"); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState("");
  const [twoFactorData, setTwoFactorData] = useState(null);
  const [emailForResend, setEmailForResend] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const verify = async () => {
      if (!token) {
        if (isMounted) {
          setStatus("error");
          setMessage("No verification token was provided.");
        }
        return;
      }

      try {
        const response = await userAPI.verifyEmail(token);
        if (isMounted) {
          setStatus("success");
          setMessage(response.data?.message || "Email verified successfully!");

          if (
            response.data?.requiresTwoFactorSetup &&
            response.data?.twoFactorAuthSetup
          ) {
            const setupPayload = {
              qrCodeUrl: response.data.twoFactorAuthSetup.qrCodeUrl,
              secret: response.data.twoFactorAuthSetup.secret,
              setupToken: response.data.setupToken,
              email: response.data.email,
            };

            setTwoFactorData(setupPayload);
            dispatch(
              setTwoFactorSetupData({
                qrCodeUrl: setupPayload.qrCodeUrl,
                secret: setupPayload.secret,
              })
            );

            // Automatically transition to 2FA setup as direct continuous onboarding step
            setTimeout(() => {
              if (isMounted) {
                navigate("/two-factor-setup", {
                  replace: true,
                  state: setupPayload,
                });
              }
            }, 1200);
          }
        }
      } catch (err) {
        if (isMounted) {
          setStatus("error");
          const errorMsg =
            err.response?.data?.message ||
            "Verification link is invalid or has expired.";
          setMessage(errorMsg);
        }
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [token, dispatch, navigate]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!emailForResend.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setResending(true);
    try {
      const res = await userAPI.resendVerification(emailForResend.trim());
      setResendSuccess(true);
      toast.success(res.data?.message || "Verification email sent!");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to resend verification email."
      );
    } finally {
      setResending(false);
    }
  };

  const handleContinueToSetup = () => {
    if (twoFactorData) {
      navigate("/two-factor-setup", {
        replace: true,
        state: twoFactorData,
      });
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="verify-email">
      <div className="verify-email__card">
        {status === "verifying" && (
          <div className="verify-email__state verify-email__state--loading">
            <div className="verify-email__spinner" />
            <h1 className="verify-email__title">Verifying Your Email</h1>
            <p className="verify-email__text">
              Please wait while we confirm your email address...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="verify-email__state verify-email__state--success">
            <div className="verify-email__icon-wrapper verify-email__icon-wrapper--success">
              <svg
                className="verify-email__icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h1 className="verify-email__title">Email Verified!</h1>
            <p className="verify-email__text">
              {message || "Your email address has been confirmed successfully."}
            </p>
            <p className="verify-email__subtext">
              Redirecting you to set up Two-Factor Authentication to complete your account security...
            </p>
            <button
              type="button"
              onClick={handleContinueToSetup}
              className="verify-email__btn verify-email__btn--primary"
            >
              Continue to 2FA Setup →
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="verify-email__state verify-email__state--error">
            <div className="verify-email__icon-wrapper verify-email__icon-wrapper--error">
              <svg
                className="verify-email__icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 className="verify-email__title">Verification Failed</h1>
            <p className="verify-email__text verify-email__text--error">
              {message}
            </p>
            <p className="verify-email__subtext">
              Verification links expire after 24 hours. Enter your email below to receive a new verification link.
            </p>

            {resendSuccess ? (
              <div className="verify-email__resend-success">
                <p>
                  A fresh verification link has been sent to <strong>{emailForResend}</strong>. Please check your inbox.
                </p>
              </div>
            ) : (
              <form className="verify-email__resend-form" onSubmit={handleResend}>
                <input
                  type="email"
                  className="verify-email__input"
                  placeholder="Enter your email address"
                  value={emailForResend}
                  onChange={(e) => setEmailForResend(e.target.value)}
                  disabled={resending}
                  required
                />
                <button
                  type="submit"
                  className="verify-email__btn verify-email__btn--secondary"
                  disabled={resending}
                >
                  {resending ? "Sending..." : "Resend Verification Link"}
                </button>
              </form>
            )}

            <div className="verify-email__footer">
              <Link to="/login" className="verify-email__link">
                Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
