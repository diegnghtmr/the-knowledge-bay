const API_URL = "http://localhost:8080/api/interests";

export async function fetchInterests () {
    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Cache-Control": "no-cache" // Evita respuestas 304
            }
        });

        // Verificamos que la respuesta sea exitosa
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Verificamos que la respuesta tenga JSON válido
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            return data;
        } else {
            throw new Error("La respuesta no es JSON");
        }
    } catch (error) {
        console.error("No se pudieron cargar los intereses:", error);
        return []; // Devolvemos lista vacía en caso de error
    }
}
