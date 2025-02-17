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
      "optimisedContent": string (provide complete rewritten section that matches the user's writing style, and balances brevity with depth)
    }
  ]
}

Categories must include:
- Relevance (match to job requirements)
- Impact (strength of achievements)
- Clarity (readability and brevity)
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
- When marking relevance, weigh soft skills heavily alongside technical qualifications
- When marking keywords, value soft skills and attributes more than technical skills
- When recommending keywords, aim for a balance between commonly used terms in the industry and those that genuinely reflect the applicants experience
- Provide optimised content that maintains the user's writing style
- Provide optimised content that considers the company culture 
- If a suggestion is to quantify the achivements, optimise the content with placeholders in mind
- If a section is well-written and doesn't need changes, do not include it
- If the suggestions for a section are already established aspects of the section, do not include it
- If more than 2 different sections emphasisie the same point, provide optimised content which focuses on desired skills 
- If a section would get the same suggestions if it was inputted again, optimise it once more
- Only provide suggestions or improvements that are not already present in the CV content
- Do not suggest edits to information already included or worded similarly in the CV, unless it increases clarity
- Suggest keywords that not only reflect the applicants current expertise but also show their growth potential
- Do not expect a user to be able to write about experiences and skills they do not have 
- Focus on impact that are directly relevant to the applicants current competencies

CRITICAL REQUIREMENTS:
- Use British English spelling and terminology at all times
- Ensure optimised content matches the user's writing style and tone
- Maintain the language structure of the user's CV
- Avoid redundancy
- Use the golden template for optimising experience: What they did and the impact it made
- Factor in how soft skills made an impact in an experience
- Do not suggest adding more of the same achievements
- Do not make the content sound AI-generated
- Focus on making the CV align with apprenticeship requirements
- Relevance should take into account the applicant's potential to contribute in the job description areas
- Only provide feedback on sections that need improvement
- Do not give suggestions which are already in the existing CV
- Do not expect the user to be able to quantify more than once for one experience
- Consider the value of soft skills in tandem with measurable results
- Analyze any additional sections present in the user's CV even if not listed above

IMPORTANT: Ensure your recommendations focus only on genuine areas for improvement that are aligned with the job description and marking criteria.
IMPORTANT: Do not use buzzwords or cliches
IMPORTANT: Optimise experience sections in the format of what they did, and the impact it had.
IMPORTANT: Focus on the quality and impact of the experience through clear and concise descriptions.
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
//- When optimising Work Experience/Professional sections for higher impact rating, consider the measurable impact of what they did, and the soft skills used
export const geminiService = new GeminiService();