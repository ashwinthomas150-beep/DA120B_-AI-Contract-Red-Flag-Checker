const https = require("https");

module.exports = async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { text } = req.body || {};
  if (!text || text.trim().length < 80)
    return res.status(400).json({ error: "Contract text too short (minimum 80 characters)." });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey)
    return res.status(500).json({ error: "API key not configured on server." });

  const prompt = `You are a senior legal risk analyst specializing in contract review for individuals. Analyze this contract and identify risky or one-sided clauses.

Return ONLY valid JSON — no markdown, no extra text. Use this exact schema:
{
  "overall_risk": "HIGH" | "MEDIUM" | "LOW" | "SAFE",
  "overall_summary": "2-3 sentence plain-English summary",
  "contract_type": "Employment" | "NDA" | "Rental" | "Freelance" | "Service" | "Other",
  "flags": [
    {
      "id": 1,
      "risk_level": "HIGH" | "MEDIUM" | "LOW",
      "category": "Non-Compete" | "IP" | "Arbitration" | "Termination" | "Compensation" | "Confidentiality" | "Liability" | "Other",
      "title": "Short title of the issue",
      "clause_excerpt": "Relevant quote from the contract (max 80 words)",
      "explanation": "Plain-English explanation of why this is risky for the signer",
      "recommendation": "Specific action the signer should take or negotiate"
    }
  ]
}

Risk levels:
- HIGH: Significant legal, financial, or career risk. Requires attention before signing.
- MEDIUM: Unfavorable or restrictive. Worth negotiating.
- LOW: Noteworthy but not immediately harmful.

Order flags by risk (HIGH first). A missed red flag is worse than a false positive.

CONTRACT:
---
${text.substring(0, 12000)}
---`;

  const body = JSON.stringify({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 3000,
    response_format: { type: "json_object" }
  });

  try {
    const result = await new Promise((resolve, reject) => {
      const request = https.request(
        {
          hostname: "api.openai.com",
          path: "/v1/chat/completions",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "Content-Length": Buffer.byteLength(body)
          }
        },
        (response) => {
          let data = "";
          response.on("data", chunk => data += chunk);
          response.on("end", () => resolve({ status: response.statusCode, data }));
        }
      );
      request.on("error", reject);
      request.write(body);
      request.end();
    });

    const parsed = JSON.parse(result.data);
    if (result.status !== 200) {
      return res.status(502).json({ error: parsed.error?.message || "OpenAI API error" });
    }

    const analysis = JSON.parse(parsed.choices[0].message.content);
    return res.status(200).json(analysis);

  } catch (err) {
    return res.status(500).json({ error: "Analysis failed: " + err.message });
  }
};
