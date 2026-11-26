import { useEffect, useState } from "react";
import { useAuthHandler } from "../../hooks/useAuthHandler.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchInterests } from "../../services/InterestsApi.js";
import SignupForm from "./SignupForm.jsx";

const Signup = ({ data }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isOnboarding = pathname === "/register/steps";
  const showForm = isOnboarding && Boolean(data);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    bio: "",
    interests: [],
  });
  const [availableInterests, setAvailableInterests] = useState([]);

  useEffect(() => {
    if (isOnboarding && !data) navigate("/register", { replace: true });
  }, [isOnboarding, data, navigate]);

  // Custom authentication handler hook
  const { isLoading, error, handleRegister } = useAuthHandler({
    onRegisterSuccess: () => {
      navigate("/dashboard"); // Redirect on success
    },
  });

  // Format date to YYYY-MM-DD
  function formatDate(date) {
    let { year, month, day } = date;

    function pad(n) {
      return n.toString().padStart(2, "0");
    }

    return `${year}-${pad(month)}-${pad(day)}`;
  }

  useEffect(() => {
    if (!showForm) return;
    const controller = new AbortController();
    fetchInterests(controller.signal).then((interests) => {
      if (!controller.signal.aborted) setAvailableInterests(interests);
    });
    return () => controller.abort();
  }, [showForm]);

  const handleFinalSubmit = async () => {
    if (!data) return;
    const registrationData = {
      ...data,
      firstName: formData.firstName,
      lastName: formData.lastName,
      dateOfBirth: formatDate(formData.dateOfBirth),
      biography: formData.bio,
      interests: formData.interests,
    };

    await handleRegister(registrationData);
  };

  return (
    <SignupForm
      showForm={showForm}
      error={error}
      formData={formData}
      setFormData={setFormData}
      isLoading={isLoading}
      availableInterests={availableInterests}
      action={handleFinalSubmit}
    />
  );
};

export default Signup;
