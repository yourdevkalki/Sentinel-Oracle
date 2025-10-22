import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_AGENT_API_URL || "http://localhost:5000";

/**
 * Fetch agent status
 */
export async function fetchAgentStatus() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/status`);
    return response.data;
  } catch (error) {
    console.error("Error fetching agent status:", error);
    // Return mock data for development
    return {
      status: "running",
      last_price: 65234.5,
      last_z_score: 0.45,
      is_anomalous: false,
      last_reason: "Normal (z=0.45)",
      last_update: new Date().toISOString(),
      anomaly_count: 0,
      uptime_start: new Date(Date.now() - 3600000).toISOString(),
      history_size: 25,
    };
  }
}

/**
 * Fetch price history
 */
export async function fetchPriceHistory() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/price-history`);
    return response.data.prices || [];
  } catch (error) {
    console.error("Error fetching price history:", error);
    // Return mock data for development
    const now = Date.now();
    return Array.from({ length: 30 }, (_, i) => ({
      price: 65000 + Math.random() * 500 - 250,
      timestamp: new Date(now - (30 - i) * 10000).toISOString(),
    }));
  }
}

/**
 * Send chat message to agent
 */
export async function sendChatMessage(message) {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/chat`, {
      message,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending chat message:", error);
    // Return mock response
    return {
      response: "I'm currently offline. Please try again later.",
      timestamp: new Date().toISOString(),
      agent_status: "offline",
      is_anomalous: false,
    };
  }
}
