import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export async function evaluateTransaction(transactionData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/recovery/evaluate`, transactionData);
    return response.data;
  } catch (error) {
    console.error("Error communicating with RECLAIM backend engine:", error);
    throw error;
  }
}