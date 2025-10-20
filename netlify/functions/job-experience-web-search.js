import Replicate from "replicate";

// Set up Replicate
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
});

// Function to extract experience level using DeepSeek web search
async function extractExperienceFromJobLink(jobLink, maxRetries = 3) {
    const prompt = `You have web search capabilities. Please search for and analyze the job posting at this URL: ${jobLink}

Your task is to:
1. Extract the complete job title from the job posting content
2. Clean the job title according to the rules below
3. Find the experience level requirements from the job posting content

Look for in the job posting content:
- The complete job title (usually in the header or title section)
- Years of experience required (e.g., "3+ years", "minimum 5 years", "2-4 years")
- Seniority level indicators in the job description (e.g., "Senior", "Lead", "Principal", "Entry-level", "Mid-level")
- Any specific experience requirements mentioned in the job description
- Salary ranges that indicate experience level (higher salaries typically indicate more senior roles)

JOB TITLE CLEANING - STEP BY STEP PROCESS:

STEP 1: Extract the complete job title from the job posting content
STEP 2: Apply these cleaning rules in order:
   a) Remove: "USA", "USA Tax", "Tax - Other Tax -", "EY", "EY Foundry", "EY-Parthenon"
   b) Keep: "Product Manager", "Chelsea", "Staff", "Tax Technology and Transformation", "TTT", "ALWIN"
   c) Format: Use commas to separate meaningful parts

STEP 3: Apply these specific transformations:
- "USA Tax - Other Tax - EY Foundry Product Manager - Chelsea Staff" → "Product Manager, Chelsea, Staff"
- "USA Tax - Tax Technology and Transformation (TTT) - Alwin Staff" → "Tax Technology and Transformation (TTT), ALWIN, Staff"

CRITICAL EXAMPLES - COPY THIS FORMAT EXACTLY:
- "USA Tax - Other Tax - EY Foundry Product Manager - Chelsea Staff" → "Product Manager, Chelsea, Staff"
- "USA Tax - Tax Technology and Transformation (TTT) - Alwin Staff" → "Tax Technology and Transformation (TTT), ALWIN, Staff"
- "Data Engineer, Google Fi and Store, Infrastructure" → "Data Engineer, Google Fi and Store, Infrastructure" (keep all)
- "Senior Software Engineer, Backend, Payments Team" → "Senior Software Engineer, Backend, Payments Team" (keep all)

CRITICAL INSTRUCTIONS:
- Analyze ONLY the job posting content, not the URL or website structure
- If the job title says "Senior" but the content says "entry-level", trust the content over the title
- If the job title says "Senior" and the content supports senior-level requirements, classify as Senior
- Do NOT make assumptions based on URL paths or website context

Based on your analysis, classify the experience level into one of these bins:
- Entry (0-2 Years)
- Mid (3-5 Years) 
- Senior (6-8 Years)
- Lead (8+ Years)

Experience level mapping rules:
• "1+ years" or "minimum 1 year" = Entry (0-2 Years)
• "2+ years" or "minimum 2 years" = Mid (3-5 Years)
• "5+ years" or "minimum 5 years" = Senior (6-8 Years)
• "8+ years" or "minimum 8 years" = Lead (8+ Years)
• Job titles with "Senior", "Lead", "Principal" = Senior (6-8 Years) or Lead (8+ Years) ONLY if content supports it
• Job titles with "Entry", "Junior", "Associate" = Entry (0-2 Years)
• Job titles with "Mid", "Intermediate" = Mid (3-5 Years)

If no clear experience requirement is found, return null.

Output ONLY a valid JSON object in this exact format:
{
  "job_link": "${jobLink}",
  "job_title": "[cleaned job title following the cleaning rules above - remove company names, keep role and team info]",
  "experience_level": "[Entry (0-2 Years)/Mid (3-5 Years)/Senior (6-8 Years)/Lead (8+ Years)/null]",
  "found_requirements": "[brief description of what experience requirements were found]",
  "confidence": "[high/medium/low]"
}

CRITICAL: The job_title field must follow the cleaning rules EXACTLY. 
- Remove ALL company names (EY, EY Foundry, EY-Parthenon) and geographic prefixes (USA)
- Keep ALL meaningful details (Chelsea, Staff, ALWIN, TTT, Product Manager, etc.)
- Use proper comma formatting and capitalization
- Follow the examples above precisely

SPECIFIC INSTRUCTION: 
- If you find "USA Tax - Other Tax - EY Foundry Product Manager - Chelsea Staff", output "Product Manager, Chelsea, Staff"
- If you find "USA Tax - Tax Technology and Transformation (TTT) - Alwin Staff", output "Tax Technology and Transformation (TTT), ALWIN, Staff"
- Follow the examples above EXACTLY - do not deviate from the format shown`;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempt ${attempt}: Searching job link for experience requirements...`);
            
            const input = {
                prompt: prompt,
                max_new_tokens: 500
            };

            const output = await replicate.run("deepseek-ai/deepseek-v3.1", { input });
            const responseText = output.join("").trim();
            
            console.log(`Attempt ${attempt} response:`, responseText);
            
            // Try to parse as JSON
            try {
                const jsonResult = JSON.parse(responseText);
                
                // Validate required fields
                if (jsonResult.job_link && 
                    (jsonResult.experience_level === null || 
                     ['Entry (0-2 Years)', 'Mid (3-5 Years)', 'Senior (6-8 Years)', 'Lead (8+ Years)'].includes(jsonResult.experience_level)) &&
                    jsonResult.found_requirements &&
                    ['high', 'medium', 'low'].includes(jsonResult.confidence)) {
                    return jsonResult;
                }
            } catch (parseError) {
                console.log(`Attempt ${attempt}: Invalid JSON, retrying...`);
                if (attempt === maxRetries) {
                    throw new Error(`Failed to extract valid JSON after ${maxRetries} attempts. Last response: ${responseText}`);
                }
            }
        } catch (error) {
            console.log(`Attempt ${attempt} failed:`, error.message);
            if (attempt === maxRetries) {
                throw error;
            }
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
}

// Netlify Function handler for job link experience extraction
export const handler = async (event, context) => {
    // Handle CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        let job_link;
        
        // Parse the request body
        const body = JSON.parse(event.body);
        job_link = body.job_link;
        
        if (!job_link) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: "Missing required field: job_link"
                })
            };
        }

        // Validate that it's a URL
        try {
            new URL(job_link);
        } catch (urlError) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: "Invalid URL format"
                })
            };
        }

        console.log(`Extracting experience level from job link: ${job_link}`);
        const result = await extractExperienceFromJobLink(job_link);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result)
        };
        
    } catch (error) {
        console.error('Error:', error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: "Failed to extract experience level from job link",
                details: error.message
            })
        };
    }
};
