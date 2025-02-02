export const makeRequest = async (requestBody) => {
    try {
      const response = await fetch(
        "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "authkey": "<authkey>", // Use an environment variable in production
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
          body: JSON.stringify(requestBody),
        }
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error("Error sending request:", error);
      return { error: "Failed to send message" };
    }
  };
  