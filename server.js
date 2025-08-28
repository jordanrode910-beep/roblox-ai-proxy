import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json({ limit: "2mb" }));

const HF_KEY = process.env.HF_API_KEY;
const MODEL = process.env.MODEL_ID || "gpt2";

if (!HF_KEY) console.warn("HF_API_KEY missing — set env var HF_API_KEY");

app.post("/v1/generate", async (req, res) => {
  try {
    const prompt = typeof req.body.prompt === "string" ? req.body.prompt.substring(0, 2000) : "";
    if (!prompt) return res.status(400).json({ error: "missing prompt" });

    const response = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    const data = await response.json();
    let text = "";
    if (data.generated_text) text = data.generated_text;
    else if (Array.isArray(data) && data[0] && data[0].generated_text) text = data[0].generated_text;
    else text = JSON.stringify(data).slice(0, 3000);

    return res.json({ text });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Listening on port", port));
Add server.js
