const { GoogleGenAI } = require("@google/genai");

// Helper to get or run Gemini
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// @desc    AI Announcement Drafter
// @route   POST /api/ai/draft-announcement
// @access  Private (HR, Manager)
const draftAnnouncement = async (req, res) => {
  try {
    const { topic, tone, audience } = req.body;

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const ai = getGeminiClient();

    if (ai) {
      const prompt = `You are StaffSync AI, an expert HR communications assistant.
Generate a professional, polished company announcement for internal HRMS.
Topic: "${topic}"
Audience: ${audience || "All Employees"}
Tone: ${tone || "Professional and Engaging"}

Respond in pure JSON format with exactly these two keys:
{
  "title": "A compelling, clear announcement title",
  "message": "The full formatted announcement text with paragraph breaks and warm sign-off."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text);
      return res.json({
        success: true,
        source: "Gemini API",
        ...parsed,
      });
    }

    // Heuristic Fallback if GEMINI_API_KEY is not configured yet
    const fallbackTitle = `Important Update: ${topic}`;
    const fallbackMessage = `Dear Team,\n\nWe would like to share an important organizational update regarding ${topic}.\n\nPlease review these details and reach out to the HR / Management team if you have any questions or require further assistance.\n\nThank you for your ongoing commitment and dedication.\n\nWarm regards,\nPeople Operations Team`;

    return res.json({
      success: true,
      source: "StaffSync Heuristic Engine (Set GEMINI_API_KEY in server/.env for live model)",
      title: fallbackTitle,
      message: fallbackMessage,
    });
  } catch (error) {
    console.error("AI Draft Announcement Error:", error);
    res.status(500).json({ message: error.message || "Failed to generate AI announcement" });
  }
};

// @desc    AI Leave Reason & Impact Analyzer
// @route   POST /api/ai/analyze-leave
// @access  Private (Manager, HR)
const analyzeLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason, department } = req.body;

    if (!reason || !startDate || !endDate) {
      return res.status(400).json({ message: "Reason, startDate, and endDate are required" });
    }

    const diffDays = Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24) + 1
    );

    const ai = getGeminiClient();

    if (ai) {
      const prompt = `You are StaffSync AI, an HR workforce analyst.
Analyze the following leave request for operational impact:
Leave Type: ${leaveType}
Duration: ${diffDays} day(s) from ${startDate} to ${endDate}
Department: ${department || "General"}
Stated Reason: "${reason}"

Provide an objective assessment in pure JSON format:
{
  "impactScore": <number from 1 to 100 where 1 is minimal impact and 100 is critical bottleneck>,
  "riskLevel": "<Low | Moderate | High>",
  "recommendation": "<Recommended for Approval | Requires Manager Review | Alternate Schedule Advised>",
  "analysis": "<2-3 concise sentences evaluating reason validity, duration impact, and coverage suggestion>"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text);
      return res.json({
        success: true,
        source: "Gemini API",
        ...parsed,
      });
    }

    // Heuristic Fallback
    const impactScore = diffDays > 5 ? 70 : diffDays > 2 ? 40 : 20;
    const riskLevel = impactScore > 60 ? "Moderate" : "Low";
    const recommendation = impactScore > 60 ? "Requires Manager Review" : "Recommended for Approval";
    const analysis = `Leave application spans ${diffDays} day(s) under '${leaveType}'. The reason appears standard and manageable within normal team rotation.`;

    return res.json({
      success: true,
      source: "StaffSync Heuristic Engine (Set GEMINI_API_KEY in server/.env for live model)",
      impactScore,
      riskLevel,
      recommendation,
      analysis,
    });
  } catch (error) {
    console.error("AI Analyze Leave Error:", error);
    res.status(500).json({ message: error.message || "Failed to analyze leave request" });
  }
};

// @desc    AI Training Curriculum Generator
// @route   POST /api/ai/generate-curriculum
// @access  Private (Manager, HR)
const generateCurriculum = async (req, res) => {
  try {
    const { topic, duration, audience } = req.body;

    if (!topic) {
      return res.status(400).json({ message: "Topic is required" });
    }

    const ai = getGeminiClient();

    if (ai) {
      const prompt = `You are StaffSync AI, a corporate Learning & Development specialist.
Generate a structured training curriculum for:
Topic: "${topic}"
Target Audience: ${audience || "Engineering & Operations"}
Duration: ${duration || "4 Weeks (Self-paced + Workshops)"}

Return pure JSON format:
{
  "title": "<Professional training title>",
  "description": "<Engaging 2-sentence program summary>",
  "modules": [
    { "week": 1, "topic": "<Topic>", "summary": "<What participants will master>" },
    { "week": 2, "topic": "<Topic>", "summary": "<What participants will master>" },
    { "week": 3, "topic": "<Topic>", "summary": "<What participants will master>" },
    { "week": 4, "topic": "<Topic>", "summary": "<What participants will master>" }
  ],
  "learningOutcomes": ["Outcome 1", "Outcome 2", "Outcome 3"]
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text);
      return res.json({
        success: true,
        source: "Gemini API",
        ...parsed,
      });
    }

    // Heuristic Fallback
    return res.json({
      success: true,
      source: "StaffSync Heuristic Engine (Set GEMINI_API_KEY in server/.env for live model)",
      title: `Advanced Professional Program: ${topic}`,
      description: `Comprehensive industry-aligned training designed to accelerate team competencies and practical capabilities in ${topic}.`,
      modules: [
        { week: 1, topic: "Foundations and Core Architecture", summary: "Grasp theoretical models and environment setup." },
        { week: 2, topic: "Hands-on Implementation & Best Practices", summary: "Build concrete workflows and avoid common failure points." },
        { week: 3, topic: "Integration, Security & Scalability", summary: "Enforce production standards, testing, and team protocols." },
        { week: 4, topic: "Capstone Assessment & Review", summary: "Complete practical milestone project with peer review." },
      ],
      learningOutcomes: [
        `Master fundamental and advanced tenets of ${topic}`,
        "Enhance productivity through automated team patterns",
        "Deliver measurable business impact and cross-functional alignment",
      ],
    });
  } catch (error) {
    console.error("AI Curriculum Error:", error);
    res.status(500).json({ message: error.message || "Failed to generate training curriculum" });
  }
};

module.exports = {
  draftAnnouncement,
  analyzeLeave,
  generateCurriculum,
};
