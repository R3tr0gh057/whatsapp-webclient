export async function POST(req) {
    try {
      const requestBody = await req.json();
      const response = await fetch(
        "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authkey: "434102AXiqFRNu50672dc877P1", // Store in environment variables
          },
          body: JSON.stringify(requestBody),
        }
      );
  
      const data = await response.json();
      console.log(data);
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      console.error("Proxy error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send message" }),
        { status: 500 }
      );
    }
  }
  