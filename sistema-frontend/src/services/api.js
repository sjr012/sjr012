const API_URL = process.env.REACT_APP_API_URL || "https://sjr012.onrender.com";

export function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : ""
  };

  export async function apiFetch(url, options = {}) {

    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...(options.headers || {})
      }
    });

    if (response.status === 401) {

      localStorage.removeItem("token");
      localStorage.removeItem("usuario");

      window.location.href = "/";
    }

    return response;
  }
  
}

export default API_URL;