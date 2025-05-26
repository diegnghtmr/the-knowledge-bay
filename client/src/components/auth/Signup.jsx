import { useEffect, useState } from "react";
import { useAuthHandler } from "../../hooks/useAuthHandler.jsx";
import { useNavigate } from "react-router-dom";
import { fetchInterests } from "../../services/InterestApi.js";
import SignupForm from "./SignupForm.jsx";

const Signup = ({ data }) => {
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        bio: '',
        interests: [],
    });

    // Controls form visibility based on `data`
    const [showForm, setShowForm] = useState(false);

    // Update formData and show/hide form based on incoming `data`
    useEffect(() => {
        if (data && (data.username || data.email || data.password || data.confirmPassword)) {
            setFormData(prev => ({
                ...prev,
                username: data.username || '',
                email: data.email || '',
                password: data.password || '',
                confirmPassword: data.confirmPassword || '',
            }));
            setShowForm(true);
        } else {
            setShowForm(false);
            navigate("/register"); // Redirect if data is not valid
        }
    }, [data]);


    // Custom authentication handler hook
    const {
        isLoading,
        error,
        handleRegister
    } = useAuthHandler({
        onRegisterSuccess: () => {
            navigate('/dashboard'); // Redirect on success
        }
    });

    // Format date to YYYY-MM-DD
    function formatDate(date) {
        let { year, month, day } = date;

        function pad(n) {
            return n.toString().padStart(2, '0');
        }

        return `${year}-${pad(month)}-${pad(day)}`;
    }

    // Fetch available interests from API
    useEffect(() => {
        fetchInterests()
            .then(data => setAvailableInterests(data))
            .catch(err => console.error("Failed to load interests", err));
    }, []);

    const [availableInterests, setAvailableInterests] = useState([]);

    // Final registration submit
    const handleFinalSubmit = async () => {
        const registrationData = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            firstName: formData.firstName,
            lastName: formData.lastName,
            dateOfBirth: formatDate(formData.dateOfBirth),
            bio: formData.bio,
            interests: formData.interests,
        };

        await handleRegister(registrationData);
    };





    return (
        <SignupForm showForm={showForm} error={error} formData={formData} setFormData={setFormData} isLoading={isLoading} availableInterests={availableInterests} action={handleFinalSubmit}/>
    );

};

export default Signup;