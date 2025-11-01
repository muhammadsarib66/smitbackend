const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Analyze medical report using Gemini AI
 * @param {String} filePath - Path to uploaded file (image/PDF)
 * @param {String} reportType - Type of report (CBC, X-Ray, etc.)
 * @returns {Promise<Object>} - AI analysis with summary, abnormalities, and doctor questions
 */
const analyzeReport = async (filePath, reportType) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Read file
 // Read file
     const fileData = fs.readFileSync(filePath);
     const fileExt = path.extname(filePath).toLowerCase();
     const mimeType = fileExt === '.pdf' ? 'application/pdf' : fileExt === '.png' ? 'image/png' : fileExt === '.jpg' || fileExt === '.jpeg' ? 'image/jpeg' : 'image/jpeg';
    // Convert to base64
    const base64Data = fileData.toString('base64');

    // Prepare prompt for medical report analysis
    const prompt = `
Analyze this medical report (${reportType}) and provide a structured response in JSON format with the following fields:
1. summary: A brief summary of the report findings in English (max 200 words)
2. abnormalities: An array of strings listing any abnormal values or findings
3. doctorQuestions: An array of 3-5 relevant questions the patient should ask their doctor

Focus on:
- Highlighting any values outside normal ranges
- Explaining what each abnormal value might indicate
- Suggesting appropriate follow-up questions

Return ONLY valid JSON, no additional text.
`;

    // Use gemini-1.5-flash or gemini-1.5-pro for vision capabilities
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    // For images and PDFs, use vision model
    if (mimeType.includes('image') || mimeType === 'application/pdf') {
      const filePart = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      };

      const result = await model.generateContent([prompt, filePart]);
      const response = await result.response;
      const text = response.text();

      return parseAIResponse(text);
    } else {
      // Fallback for other file types
      const textModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await textModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return parseAIResponse(text);
    }
  } catch (error) {
    console.error('Error analyzing report with Gemini:', error);
    throw new Error(`Failed to analyze report: ${error.message}`);
  }
};

/**
 * Generate summary from manual report data
 * @param {Object} manualData - Manual report data entered by user
 * @param {String} reportType - Type of report
 * @returns {Promise<Object>} - AI analysis
 */
const generateSummary = async (manualData, reportType) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });

    const prompt = `
Analyze this medical report data (${reportType}) and provide a structured response in JSON format:

Report Data:
${JSON.stringify(manualData, null, 2)}

Provide:
1. summary: A brief summary of the report findings in English (max 200 words)
2. abnormalities: An array of strings listing any abnormal values or findings
3. doctorQuestions: An array of 3-5 relevant questions the patient should ask their doctor

Focus on:
- Highlighting any values outside normal ranges
- Explaining what each abnormal value might indicate
- Suggesting appropriate follow-up questions

Return ONLY valid JSON, no additional text.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return parseAIResponse(text);
  } catch (error) {
    console.error('Error generating summary with Gemini:', error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
};

/**
 * Chat with AI assistant
 * @param {String} userMessage - User's message
 * @param {Array} chatHistory - Previous chat messages for context
 * @returns {Promise<String>} - AI response
 */
const chatWithAI = async (userMessage, chatHistory = []) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });

    // Build context from chat history
    let context = '';
    if (chatHistory.length > 0) {
      context = chatHistory.slice(-5).map(msg => 
        `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.text}`
      ).join('\n');
    }

    const prompt = `
You are a helpful health assistant. Answer health-related questions clearly and provide general guidance.
Always remind users to consult with healthcare professionals for medical advice.

${context ? `Previous conversation:\n${context}\n\n` : ''}
User: ${userMessage}
AI:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error chatting with Gemini:', error);
    throw new Error(`Failed to get AI response: ${error.message}`);
  }
};

/**
 * Parse AI response and extract JSON
 * @param {String} text - Raw AI response text
 * @returns {Object} - Parsed response with summary, abnormalities, and doctorQuestions
 */
const parseAIResponse = (text) => {
  try {
    // Try to extract JSON from response
    let jsonText = text.trim();
    
    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Try to find JSON object
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonText);
    
    // Ensure required fields exist
    return {
      summary: parsed.summary || 'Analysis completed.',
      abnormalities: Array.isArray(parsed.abnormalities) ? parsed.abnormalities : [],
      doctorQuestions: Array.isArray(parsed.doctorQuestions) ? parsed.doctorQuestions : []
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    // Return fallback response
    return {
      summary: text.substring(0, 500) || 'Analysis completed. Please consult with your doctor for detailed interpretation.',
      abnormalities: [],
      doctorQuestions: [
        'Can you explain these results in detail?',
        'Are there any concerns I should be aware of?',
        'What follow-up actions do you recommend?'
      ]
    };
  }
};

module.exports = {
  analyzeReport,
  generateSummary,
  chatWithAI
};

