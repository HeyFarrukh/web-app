import { GoogleGenerativeAI } from "@google/generative-ai";
import { Analytics } from '@/services/analytics/analytics';
import { createLogger } from '@/services/logger/logger';

const logger = createLogger({ module: 'GeminiService' });

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
    this.genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
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
- Provide optimised content that maintains the user's writing style
- If a section is well-written and doesn't need changes, do not include it

CRITICAL REQUIREMENTS:
- Use British English spelling and terminology at all times
- Ensure optimised content matches the user's writing style and tone
- Maintain the language structure of the user's CV
- Use the golden template for optimising experience: What they did and the impact it made
- Factor in how soft skills made an impact in an experience
- Do not suggest adding more of the same achievements
- Do not make the content sound AI-generated
- Focus on making the CV align with apprenticeship requirements
- Only provide feedback on sections that need improvement
- Analyze any additional sections present in the user's CV even if not listed above

IMPORTANT: Ensure your recommendations focus only on genuine areas for improvement that are aligned with the job description and marking criteria.
IMPORTANT: Do not use buzzwords or cliches
IMPORTANT: Optimise experience sections in the format of what they did, and the impact it had.
IMPORTANT: Focus on the quality and impact of the experience through clear and concise descriptions.
IMPORTANT: Response must be valid JSON only, with no additional text or markdown formatting.`;

  async analyzeCV(cvText: string, jobDescription: string): Promise<AIAnalysisResponse> {
    try {
      const fullPrompt = this.SYSTEM_PROMPT + "\n\n" + `
CV Text:
${cvText}

Job Description:
${jobDescription}

Analyze the CV against this job description and provide structured feedback following the specified format.`;

      logger.info('Starting CV analysis with Gemini', {
        cvLength: cvText.length,
        jobDescLength: jobDescription.length,
        model: 'gemini-2.0-flash'
      });

      logger.info('Full prompt being sent to Gemini:', {
        systemPrompt: this.SYSTEM_PROMPT,
        cvText,
        jobDescription,
        fullPrompt
      });

      const result = await this.model.generateContent(fullPrompt);
      const text = result.response.text();
      logger.debug('Raw Gemini response received', { responseLength: text.length });

      try {
        // Clean the response text to ensure it's valid JSON
        const cleanText = text
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();

        const analysis = JSON.parse(cleanText);
        logger.info('Successfully parsed Gemini response', {
          score: analysis.overallScore,
          categories: analysis.categories.length,
          improvements: analysis.improvements.length
        });

        return analysis;
      } catch (parseError) {
        logger.error('Failed to parse Gemini response:', { 
          error: parseError instanceof Error ? parseError.message : 'Unknown error',
          responseLength: text.length
        });
        logger.debug('Raw response content:', { content: text });
        throw new Error('Failed to parse AI response. Please try again.');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Gemini API error:', { 
        error: errorMessage,
        cvLength: cvText.length,
        jobDescLength: jobDescription.length
      });
      Analytics.event('cv_optimization', 'gemini_error', errorMessage);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();