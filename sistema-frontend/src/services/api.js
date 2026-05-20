const API_URL = process.env.REACT_APP_API_URL || "https://sjr012.onrender.com";

export function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : ""
  };
}

export default API_URL;