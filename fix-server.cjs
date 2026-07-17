const fs = require('fs');
let c = fs.readFileSync('server.ts', 'utf8');

const newRoute = `
// ----------------------------------------------------
// AI AUTO-TAGGING ENGINE
// ----------------------------------------------------
app.post("/api/auto-tag", async (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Missing document content" });
  }

  try {
    const ai = getGeminiClient();
    if (ai) {
      const prompt = \`Analyze the following document content and provide ONE single extremely concise category/tag that best describes it (e.g. "Legal", "Financial", "HR", "Personal", "Real Estate", "Startup"). Return ONLY the category name. Do not include markdown formatting or punctuation.\n\n\${content.substring(0, 3000)}\`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      const tag = response.text().trim();
      res.json({ tag });
    } else {
      res.json({ tag: "Uncategorized" });
    }
  } catch (error: any) {
    console.error("Auto-tag generation error:", error);
    res.status(500).json({ error: "Failed to generate tag" });
  }
});

app.post("/api/quality-check",`;

c = c.replace(/app\.post\("\/api\/quality-check",/, newRoute);
fs.writeFileSync('server.ts', c);
