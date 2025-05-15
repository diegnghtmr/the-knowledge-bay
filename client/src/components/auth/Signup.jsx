import {Steps} from "@ark-ui/react";
import {useState} from "react";
import InputField from "../ui/InputField.jsx";

const Signup = ({data, state}) => {

    const fulldata = {
        username: data.username,
        email: data.email,
        password: data.password,
        dateofbirth: '',
        gender: '',
        phone: '',
        address: '',
    }

    console.log(data);

    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    const handleNextClick = () => {
        setCurrentStepIndex(prev => (prev + 1) % items.length);
    };

    const handlePrevClick = () => {
        setCurrentStepIndex(prev => (prev > 0 ? prev - 1 : 0));
    };


    const getStepClass = (index) => {
        return index === currentStepIndex
            ? "bg-(--coastal-sea) text-white"
            : "bg-gray-300 text-gray-800";
    };


    const items = [
        { value: 'first', title: 'Primero', description: 'Información personal' },
        { value: 'second', title: 'Segundo', description: 'Biografía' },
        { value: 'third', title: 'Third', description: 'Selector de intereses' },
    ]
        return (
            <Steps.Root count={items.length} className="absolute top-[20%] w-full min-h-[200px] flex flex-col justify-center items-center">
                <Steps.List className="flex gap-4">
                    {items.map((item, index) => (
                        <Steps.Item key={index} index={index}>
                            <Steps.Trigger className={`${getStepClass(index)} h-12 w-12 rounded-full`}>
                                <Steps.Indicator className={` text-xl rounded-full relative`}>{index + 1}</Steps.Indicator>
                            </Steps.Trigger>
                            <Steps.Separator />
                        </Steps.Item>
                    ))}
                </Steps.List>
                <Steps.Content index={0} className="h-[400px] flex flex-col justify-center items-center gap-2 p-4 mt-8">
                    <p>Bienvenido a The Knowledge Bay, antes de comenzar, por favor completa tus datos.</p>
                    <section className="max-w-[300px]">
                        <br/>
                    <InputField
                        label="Nombre/s"
                        id="first_name"
                        type="text"
                        placeholder="Tu nombre"
                        icon={null}
                    />
                        <br/>
                    <InputField
                        label="Apellido/s"
                        id="last_name"
                        type="text"
                        placeholder="Tu apellido"
                        icon={null}
                    />
                    </section>
                </Steps.Content>

                <Steps.Content index={1} className="h-[400px] flex flex-col justify-center items-center gap-2 p-4 mt-8">
                </Steps.Content>

                <Steps.Content index={2} className="h-[400px] flex flex-col justify-center items-center gap-2 p-4 mt-8">
                </Steps.Content>

                <div>
                    <Steps.PrevTrigger onClick={handlePrevClick} className="bg-(--deep-sea) rounded-md px-4 py-2 mr-4 text-white cursor-pointer mt-12">Volver</Steps.PrevTrigger>
                    <Steps.NextTrigger onClick={handleNextClick} className="bg-(--coastal-sea) rounded-md px-4 py-2 text-white cursor-pointer mt-12">Siguiente</Steps.NextTrigger>
                </div>
            </Steps.Root>
        )
}

export default Signup;