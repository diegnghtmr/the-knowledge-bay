const API_URL = "http://localhost:8080/api/interests";

export async function fetchInterests() {
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Cache-Control": "no-cache", // Evita respuestas 304
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      throw new Error("The server returned an invalid JSON response.");
    }
  } catch (error) {
    console.error("The interest could not be obtained", error);
    return [];
  }
}