import React from "react";
import { toast } from "react-toastify";

const ErrorMessage = ({ message }) => {
  React.useEffect(() => {
    if (message) toast.error(message);
  }, [message]);

  if (!message) return null;
  return (
    <div className="error-message" role="alert">
      {message}
    </div>
  );
};

export default ErrorMessage;
