const express = require("express");
const cors = require("cors");
const { GoogleAuth } = require("google-auth-library");

const app = express();
app.use(cors());
app.use(express.json());

const PROJECT_ID = "aster-sunrise";
const LOCATION = "global";
const AGENT_ID = "1d4ed991-3ead-4a0a-955e-146ca392e68d";
const SESSION_ID = "web-session-1"; // can be any string

app.post("/api/agent-chat", async (req, res) => {
  try {
    const userMessage =
      (req.body && typeof req.body.message === "string"
        ? req.body.message
        : ""
      ).trim();

    if (!userMessage) {
      return res.status(400).json({ reply: "Please type a message." });
    }

    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    const client = await auth.getClient();

    const url = `https://${LOCATION}-dialogflow.googleapis.com/v3/projects/${PROJECT_ID}/locations/${LOCATION}/agents/${AGENT_ID}/sessions/${SESSION_ID}:detectIntent`;

    const response = await client.request({
      url,
      method: "POST",
      data: {
        queryInput: {
          text: {
            text: userMessage,
          },
          languageCode: "en",
        },
      },
    });

    let reply = "I didn’t get a response from the agent.";
    const messages = response.data?.queryResult?.responseMessages || [];

    for (const m of messages) {
      if (m.text && Array.isArray(m.text.text) && m.text.text.length > 0) {
        reply = m.text.text[0];
        break;
      }
    }

    res.json({ reply });
  } catch (err) {
    console.error("Error talking to agent:", err.response?.data || err);
    res.status(500).json({ error: "Agent request failed." });
  }
});

// 🔴 This is critical for Cloud Run:
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
