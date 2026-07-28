const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function generateCareerAdvice(profile) {
const prompt = `
You are an expert AI Career Advisor.

Student Profile:

Skills:
${profile.skills.join(", ")}

Interests:
${profile.interests.join(", ")}

Academic Background:
${profile.background}

Current Role:
${profile.currentRole}

Suggest EXACTLY 3 suitable career paths.

For every career provide:

1. path
2. reasoning
3. suggestedSkillsToLearn
4. fitScore (an integer from 0 to 100 based on how well the profile matches)
5. salaryRange (a short salary range string, e.g. "$80K–$120K")
6. growthOutlook (a short description such as "High Growth", "+18% YoY", or "Stable")

Return ONLY valid JSON.

Use this format:

{
  "suggestions":[
    {
      "path":"",
      "reasoning":"",
      "suggestedSkillsToLearn":[],
      "fitScore":0,
      "salaryRange":"",
      "growthOutlook":""
    }
  ]
}

Do not write markdown.

Do not write explanations.

Return only JSON.
`;

const response = await ai.models.generateContent({
  model: "gemini-flash-latest",
  contents: prompt,
});

let text = response.text;

if (typeof text === "function") {
    text = text();
}

text = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

const suggestions = JSON.parse(text);

return suggestions.suggestions;
}

module.exports = {
    generateCareerAdvice,
};