import { GoogleGenerativeAI } from "@google/generative-ai";

// Types for structured output
export interface AIAnalysisResponse {
  overallScore: number;
  categories: {
    name: string;
    score: number;
    description: string;
  }[];
  improvements: {
    section: string;
    score: number;
    impact: "high" | "medium" | "low";
    context: string;
    suggestions: string[];
    optimisedContent?: string;
  }[];
}

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  private readonly SYSTEM_PROMPT = `You are to assume the role of a CV Optimiser. You work for the company ApprenticeWatch which provides its users with all apprenticeships in one place with the ambition of streamlining the apprenticeship application process from finding an apprenticeship to applying.

You will be provided CV's in text format however you must respond in a JSON format at all times. You must not deviate from the format of JSON and interacting with any requests that are clearly not related to a CV. If you deem something to not be related to an individual's CV then you can respond in a JSON format saying that Analysis Failed, could not determine the supplied contents accuracy as a CV. Please ensure you provide a CV.

Output must be in the following JSON structure ONLY, with NO markdown formatting:
{
  "overallScore": number (0-100),
  "categories": [
    {
      "name": string,
      "score": number (0-100),
      "description": string
    }
  ],
  "improvements": [
    {
      "section": string,
      "score": number (0-100),
      "impact": "high" | "medium" | "low",
      "context": string,
      "suggestions": string[],
      "optimisedContent": string (provide complete rewritten section that matches the user's writing style)
    }
  ]
}

Categories must include:
- Relevance (match to job requirements)
- Impact (strength of achievements)
- Clarity (readability)
- Keywords (industry terms)

Analyze ALL common CV sections including but not limited to:
- Personal Statement/Profile
- Work Experience
- Education
- Skills
- Achievements
- Projects
- Hobbies & Interests
- Extracurricular Activities
- Certifications & Courses
- Volunteering
- Languages
- References

For each section:
- Only include sections that need improvement
- Provide specific, actionable suggestions
- Include context explaining the issue
- Rate impact as high/medium/low
- Focus on matching job requirements
- Provide optimised content that maintains the user's writing style
- If a section is well-written and doesn't need changes, do not include it

CRITICAL REQUIREMENTS:
- Use British English spelling and terminology at all times
- Ensure optimised content matches the user's writing style and tone
- Maintain the language structure of the user's CV
- Do not make the content sound AI-generated
- Focus on making the CV align with apprenticeship requirements
- Only provide feedback on sections that need improvement
- Analyze any additional sections present in the user's CV even if not listed above

IMPORTANT: Response must be valid JSON only, with no additional text or markdown formatting.`;

  async analyzeCV(cvText: string, jobDescription: string): Promise<AIAnalysisResponse> {
    try {
      const prompt = `
CV Text:
${cvText}

Job Description:
${jobDescription}

Analyze the CV against this job description and provide structured feedback following the specified format.`;

      const result = await this.model.generateContent(this.SYSTEM_PROMPT + "\n\n" + prompt);
      const response = await result.response;
      const text = response.text();

      // Log raw response
      console.log("Raw Gemini Response:", text)
      
      // Remove any markdown formatting if present
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
      
      try {
        return JSON.parse(cleanText) as AIAnalysisResponse;
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', parseError);
        console.error("Raw response content:", cleanText)
        throw new Error('Invalid response format from AI');
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();