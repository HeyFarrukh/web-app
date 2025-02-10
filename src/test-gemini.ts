import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

async function testGeminiAPI() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Sample CV and job description for testing
    const sampleCV = `
      JOHN DOE
      Software Developer
      
      EXPERIENCE
      Junior Developer, ABC Tech
      - Developed web applications using React
      - Collaborated with team on project delivery
      
      EDUCATION
      Computer Science Diploma
      XYZ College
    `;

    const sampleJobDesc = `
      Junior Software Developer Apprentice
      Required Skills:
      - Basic programming knowledge
      - Strong communication
      - Eagerness to learn
      - Team player
    `;

    const prompt = `
      Analyze this CV against the job description and provide feedback in the following JSON format:
      {
        "overallScore": number between 0-100,
        "categories": [
          {
            "name": string (one of: "Relevance", "Impact", "Clarity", "Keywords"),
            "score": number between 0-100,
            "description": string explaining the score
          }
        ],
        "improvements": [
          {
            "section": string,
            "score": number between 0-100,
            "impact": "high" | "medium" | "low",
            "context": string explaining the issue,
            "suggestions": string[] with specific improvements
          }
        ]
      }

      CV:
      ${sampleCV}

      Job Description:
      ${sampleJobDesc}
    `;
    
    console.log("Sending request to Gemini API...");
    const result = await model.generateContent(prompt);
    console.log("\nAPI Response:");
    console.log(result.response.text());

    // Try parsing the response as JSON to verify format
    const jsonResponse = JSON.parse(result.response.text());
    console.log("\nSuccessfully parsed as JSON:", jsonResponse.overallScore);
  } catch (error) {
    console.error("Error testing Gemini API:", error);
  }
}

testGeminiAPI();