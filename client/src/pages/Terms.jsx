import React from "react";
import NavigationBar from "../components/layout/NavigationBar";

const Terms = () => {
    return (
        <div className="min-h-screen bg-[var(--sand)] text-[var(--deep-sea)]">
            <NavigationBar title="Términos y Condiciones" />
            <div className="py-12 px-6 md:px-20">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-[var(--open-sea)] mb-6">
                        Términos y Condiciones
                    </h1>

                    <p className="mb-4">
                        Bienvenido a <strong>The Knowledge Bay</strong>, una red social académica
                        comprometida con el aprendizaje, la colaboración ética y el intercambio de
                        conocimiento de manera responsable. Al acceder o utilizar nuestra plataforma,
                        aceptas los siguientes términos y condiciones.
                    </p>

                    <h2 className="text-2xl font-semibold text-[var(--coastal-sea)] mt-8 mb-2">
                        1. Uso adecuado
                    </h2>
                    <p className="mb-4">
                        Esta plataforma está destinada a estudiantes, docentes e investigadores. Está
                        prohibido el uso para actividades fraudulentas, promoción de odio, acoso,
                        plagio o cualquier otra forma de conducta inapropiada o ilegal.
                    </p>

                    <h2 className="text-2xl font-semibold text-[var(--coastal-sea)] mt-8 mb-2">
                        2. Publicación de contenido
                    </h2>
                    <p className="mb-4">
                        Eres responsable del contenido que compartes. Al subir documentos, comentarios o
                        recursos, garantizas que posees los derechos sobre dicho material o que tienes
                        permiso para compartirlo. No está permitido publicar contenido que viole derechos
                        de autor o confidencialidad.
                    </p>

                    <h2 className="text-2xl font-semibold text-[var(--coastal-sea)] mt-8 mb-2">
                        3. Privacidad y datos
                    </h2>
                    <p className="mb-4">
                        Respetamos tu privacidad. Los datos personales se manejan de acuerdo con nuestra
                        <a href="/privacidad" className="text-[var(--open-sea)] underline ml-1">
                            Política de Privacidad
                        </a>. Nunca venderemos tu información a terceros.
                    </p>

                    <h2 className="text-2xl font-semibold text-[var(--coastal-sea)] mt-8 mb-2">
                        4. Comportamiento ético
                    </h2>
                    <p className="mb-4">
                        Se espera que todos los usuarios se comporten con respeto y profesionalismo. La
                        plataforma está diseñada para fomentar la colaboración positiva y el pensamiento
                        crítico, no el conflicto ni la desinformación.
                    </p>

                    <h2 className="text-2xl font-semibold text-[var(--coastal-sea)] mt-8 mb-2">
                        5. Suspensión de cuentas
                    </h2>
                    <p className="mb-4">
                        Nos reservamos el derecho de suspender o eliminar cuentas que violen estos
                        términos, sin previo aviso, en casos graves o reincidentes.
                    </p>

                    <h2 className="text-2xl font-semibold text-[var(--coastal-sea)] mt-8 mb-2">
                        6. Cambios a estos términos
                    </h2>
                    <p className="mb-4">
                        Podemos actualizar estos términos ocasionalmente. Notificaremos a los usuarios
                        registrados sobre cambios importantes. El uso continuado de la plataforma
                        implica aceptación de los nuevos términos.
                    </p>

                    <p className="mt-8 text-sm text-[var(--open-sea)]">
                        Última actualización: 13 de mayo de 2025
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Terms;