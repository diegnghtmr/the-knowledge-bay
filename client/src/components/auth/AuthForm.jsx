import InputField from "../ui/InputField.jsx";
import { CheckIcon, Mail, EyeClosed, Eye, User} from 'lucide-react'
import SubmitButton from "../ui/SubmitButton.jsx";
import { Link } from "react-router-dom";
import { Checkbox } from '@ark-ui/react/checkbox'
const AuthForm = ({ type, action, state, loadState }) => {
    if (type === "login") {
        return (
            <form
                onSubmit={action}
                className="space-y-6 w-full max-w-lg"
                aria-label="Formulario de inicio de sesión"
            >
                <InputField
                    icon={Mail}
                    label="Correo electrónico"
                    type="email"
                    index={0}
                    id="email"
                    name="email"
                    placeholder="tu@email.com"
                    isActive={state}
                />
                <InputField
                    icon={EyeClosed}
                    altIcon={Eye}
                    label="Contraseña"
                    type="password"
                    index={1}
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    isActive={state}
                />
                <div className="flex items-center justify-between pt-2">
                    <button
                        type="button"
                        tabIndex={state ? 2 : -1}
                        className="mb-6 text-sm text-[var(--coastal-sea)] hover:text-[var(--sand)] transition-colors duration-300"
                    >
                        ¿Olvidaste tu contraseña?
                    </button>
                </div>
                <SubmitButton isLoading={loadState} index={3}>Ingresar</SubmitButton>
            </form>
        );

    } else if (type === "register") {
        return (

            <form
                onSubmit={action}
                className="space-y-6 w-full max-w-lg"
                aria-label="Formulario de registro"
            >
                <InputField
                    icon={User}
                    label="Nombre de usuario"
                    type="text"
                    index={0}
                    id="username"
                    name="username"
                    placeholder="usuario123"
                    isActive={state}
                />
                <InputField
                    icon={Mail}
                    label="Correo electrónico"
                    type="email"
                    index={1}
                    id="register-email"
                    name="register-email"
                    placeholder="tu@email.com"
                    isActive={state}
                />
                <InputField
                    icon={EyeClosed}
                    altIcon={Eye}
                    label="Contraseña"
                    type="password"
                    index={2}
                    id="register-password"
                    name="register-password"
                    placeholder="••••••••"
                    isActive={state}
                />
                <InputField
                    icon={EyeClosed}
                    altIcon={Eye}
                    label="Confirmar contraseña"
                    type="password"
                    index={3}
                    id="confirm-password"
                    name="confirm-password"
                    placeholder="••••••••"
                    isActive={state}
                />

                <Checkbox.Root className={"flex justify-fist mb-12"} tabIndex={4}>
                    <Checkbox.Control className={"h-6 w-6 text-black rounded-md mr-2 border-2 border-black"}>
                        <Checkbox.Indicator>
                            <CheckIcon className={"h-5 w-5 text-black"} />
                        </Checkbox.Indicator>
                    </Checkbox.Control>
                    <Checkbox.Label>
                        <Link className={"underline"} to={"/terms"}>Acepto los términos y condiciones</Link>
                    </Checkbox.Label>
                    <Checkbox.HiddenInput />
                </Checkbox.Root>

                <SubmitButton isLoading={loadState}>Crear Cuenta</SubmitButton>
            </form>
        );
    }
}

export default AuthForm;