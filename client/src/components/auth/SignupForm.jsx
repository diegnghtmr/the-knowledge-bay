import {Steps} from "@ark-ui/react";
import InputField from "../ui/InputField.jsx";
import InputDate from "../ui/InputDate.jsx";
import {useCallback, useEffect, useState} from "react";


const SignupForm = ({ showForm, formData, setFormData, isLoading, error, availableInterests, action }) => {


    // List of step items
    const items = [
        { value: 'first', title: 'Datos Personales', description: 'Información básica' },
        { value: 'second', title: 'Biografía', description: 'Cuéntanos sobre ti' },
        { value: 'third', title: 'Intereses', description: 'Selecciona tus intereses' },
    ];


    // Step navigation state
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [isValidStep, setIsValidStep] = useState(false);


    // Validate fields according to step
    const checkStepValidity = useCallback(() => {
        if (currentStepIndex === 0) {
            return (
                formData.firstName !== "" &&
                formData.lastName !== "" &&
                formData.dateOfBirth !== ""
            );
        }
        if (currentStepIndex === 1) {
            return formData.bio.length >= 10;
        }
        if (currentStepIndex === 2) {
            return formData.interests.length > 0;
        }
        return false;
    }, [currentStepIndex, formData]);


    // Update step validity on form or step change
    useEffect(() => {
        setIsValidStep(checkStepValidity());
    }, [checkStepValidity]);


    // Determine step state for UI
    const getStepState = (index) => {
        if (index === currentStepIndex) return 'current';
        if (completedSteps.includes(index)) return 'complete';
        return 'incomplete';
    };


    // Handle moving to the next step
    const handleNextClick = () => {
        if (!completedSteps.includes(currentStepIndex)) {
            setCompletedSteps([...completedSteps, currentStepIndex]);
        }

        if (currentStepIndex < items.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        }
    };

    // Handle moving to the previous step
    const handlePrevClick = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };


    // Update field value
    const handleInputChange = (e) => {
        if (e.target) {
            const { id, value } = e.target;
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    };

    // Update bio field
    const handleBioChange = (e) => {
        setFormData(prev => ({ ...prev, bio: e.target.value }));
    };

    // Toggle interest selection
    const handleInterestToggle = (interest) => {
        setFormData(prev => {
            if (prev.interests.includes(interest)) {
                return {
                    ...prev,
                    interests: prev.interests.filter(i => i !== interest)
                };
            } else {
                return {
                    ...prev,
                    interests: [...prev.interests, interest]
                };
            }
        });
    };


    return (
        <Steps.Root
            count={items.length}
            className={`${showForm ? "" : "hidden"} absolute top-[20%] w-full min-h-[200px] flex flex-col justify-center items-center`}
        >
            {/* Lista de pasos (indicadores) */}
            <Steps.List className="flex gap-4 mb-14">
                {items.map((item, index) => {
                    const state = getStepState(index);
                    return (
                        <Steps.Item key={index} index={index} className="flex items-center">
                            <Steps.Trigger
                                className={`flex flex-col items-center ${state === 'complete' ? 'cursor-pointer' : 'cursor-default'}`}
                                onClick={() => {
                                    if (state === 'complete') {
                                        setCurrentStepIndex(index);
                                    }
                                }}
                            >
                                <Steps.Indicator
                                    className={`
                    h-12 w-12 rounded-full flex items-center justify-center text-xl
                    ${state === 'complete' ? 'bg-(--coastal-sea) text-white' : ''}
                    ${state === 'current' ? 'bg-(--open-sea) text-white' : ''}
                    ${state === 'incomplete' ? 'bg-gray-300 text-gray-600' : ''}
                  `}
                                >
                                    {state === 'complete' ? '✓' : index + 1}
                                </Steps.Indicator>
                            </Steps.Trigger>

                            {index < items.length - 1 && (
                                <Steps.Separator
                                    className={`mx-2 h-1 w-8 ${
                                        completedSteps.includes(index + 1) || state === 'complete'
                                            ? 'bg-(--coastal-sea)'
                                            : 'bg-gray-300'
                                    }`}
                                />
                            )}
                        </Steps.Item>
                    );
                })}
            </Steps.List>

            {/* Contenido de cada paso */}
            <div className="w-full max-w-md">
                {/* Paso 1 - Datos personales */}
                <Steps.Content index={0} className="flex flex-col justify-center items-center gap-2 p-6 h-[360px]">
                    <h2 className="text-xl font-bold mb-4 w-full text-left">Información Personal</h2>
                    <div className="space-y-4 h-[360px] w-[330px] flex flex-col justify-center items-center p-6">
                        <InputField
                            label="Nombre"
                            id="firstName"
                            type="text"
                            placeholder="Tu nombre"
                            value={formData.firstName}
                            onChange={handleInputChange}
                        />
                        <InputField
                            label="Apellido"
                            id="lastName"
                            type="text"
                            placeholder="Tu apellido"
                            value={formData.lastName}
                            onChange={handleInputChange}
                        />
                        <InputDate
                            label="Fecha de nacimiento"
                            id="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                        />
                    </div>
                </Steps.Content>

                {/* Paso 2 - Biografía */}
                <Steps.Content index={1} className="p-6 h-[360px]">
                    <h2 className="text-xl font-bold mb-4">Biografía</h2>
                    <p className="mb-4">Cuéntanos un poco sobre ti...</p>
                    <textarea
                        className={`w-full p-2 border rounded `}
                        rows="5"
                        placeholder="Escribe tu biografía aquí..."
                        value={formData.bio}
                        onChange={handleBioChange}
                    />
                </Steps.Content>

                {/* Paso 3 - Intereses */}
                <Steps.Content index={2} className="p-6 h-[360px]">
                    <h2 className="text-xl font-bold mb-4">Tus Intereses</h2>
                    <p>Selecciona los temas que te interesan:</p>
                    <div className="mt-4 space-y-2">
                        {availableInterests.map(({ name }) => (
                            <label key={name} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    className="rounded"
                                    checked={formData.interests.includes(name)}
                                    onChange={() => handleInterestToggle(name)}
                                />
                                <span>{name}</span>
                            </label>
                        ))}
                    </div>

                    {/* Mostrar errores si existen */}
                    {error && (
                        <div className="mt-4 text-red-500">
                            {error}
                        </div>
                    )}

                </Steps.Content>
            </div>

            {/* Controles de navegación */}
            <div className="mt-8 flex gap-4">
                <Steps.PrevTrigger
                    onClick={handlePrevClick}
                    disabled={currentStepIndex === 0 || isLoading}
                    className={`
            px-6 py-2 rounded-md cursor-pointer
            ${currentStepIndex === 0 || isLoading ? 'bg-(--open-sea)/60 text-(--deep-sea)/40 cursor-not-allowed' : 'bg-(--open-sea) hover:bg-(--open-sea)/90 text-white'}
          `}
                >
                    Volver
                </Steps.PrevTrigger>

                {currentStepIndex === items.length - 1 ? (
                    <button
                        onClick={action}
                        disabled={isLoading || !isValidStep}
                        className="px-6 py-2 bg-(--coastal-sea) hover:bg-(--coastal-sea)/80 text-white rounded-md cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Procesando...' : 'Finalizar'}
                    </button>
                ) : (
                    <Steps.NextTrigger
                        onClick={handleNextClick}
                        disabled={!isValidStep}
                        className="px-6 py-2 bg-(--coastal-sea) hover:bg-(--coastal-sea)/80 text-white rounded-md cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Siguiente
                    </Steps.NextTrigger>
                )}
            </div>
        </Steps.Root>
    );
}

export default SignupForm;