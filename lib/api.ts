
import axios from "axios";

export const API_BASE = "http://localhost:8000";


const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function fetchMessages(publicKey: string) {
  try {
    const response = await api.get(`/messages/${publicKey}`);
    return response.data; // Axios wraps data inside `data`
  } catch (error: any) {
    console.error("Fetch messages error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to fetch messages");
  }
}

// Send a new message
export async function sendMessage(publicKey: string, message: string) {
  try {
    const response = await api.post(`/messages`, { publicKey, message });
    return response.data;
  } catch (error: any) {
    console.error("Send message error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to send message");
  }
}