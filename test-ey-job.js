// Test script for the specific EY job posting
import Replicate from "replicate";

// Set up Replicate
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
});

// Function to extract experience level using DeepSeek web search
async function extractExperienceFromJobLink(jobLink, maxRetries = 3) {
    const prompt = `You have web search capabilities. Please search for and analyze the job posting at this URL: ${jobLink}

Your task is to find the experience level requirements for this job posting. Look for:
- Years of experience required (e.g., "3+ years", "minimum 5 years", "2-4 years")
- Seniority level indicators (e.g., "Senior", "Lead", "Principal", "Entry-level", "Mid-level")
- Any specific experience requirements mentioned in the job description

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
• Job titles with "Senior", "Lead", "Principal" = Senior (6-8 Years) or Lead (8+ Years)
• Job titles with "Entry", "Junior", "Associate" = Entry (0-2 Years)
• Job titles with "Mid", "Intermediate" = Mid (3-5 Years)
• "Summer Associate" typically indicates Entry (0-2 Years) - internship/entry level

If no clear experience requirement is found, return null.

Output ONLY a valid JSON object in this exact format:
{
  "job_link": "${jobLink}",
  "experience_level": "[Entry (0-2 Years)/Mid (3-5 Years)/Senior (6-8 Years)/Lead (8+ Years)/null]",
  "found_requirements": "[brief description of what experience requirements were found]",
  "confidence": "[high/medium/low]"
}`;

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
            
            // Clean up the response text to extract JSON
            let cleanResponse = responseText;
            if (cleanResponse.includes('```json')) {
                cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            }
            
            // Try to parse as JSON
            try {
                const jsonResult = JSON.parse(cleanResponse);
                
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

async function testEYJob() {
    const eyJobUrl = "https://usearlycareers.ey.com/job/los-angeles/usa-ey-parthenon-corporate-finance-capital-equipment-summer-associate-2026/39053/86171544528";
    
    console.log('🔍 Testing EY Job Posting Experience Level Detection');
    console.log('==================================================');
    console.log(`📋 Job: EY Parthenon Corporate Finance Capital Equipment Summer Associate 2026`);
    console.log(`🔗 URL: ${eyJobUrl}`);
    console.log(`🎯 Expected: Entry (0-2 Years) - "Summer Associate" indicates internship/entry level`);
    console.log('---');
    
    try {
        console.log('🤖 DeepSeek is searching the web for job requirements...');
        console.log('📊 Analyzing experience level requirements...');
        
        const result = await extractExperienceFromJobLink(eyJobUrl);
        
        console.log('✅ Result:');
        console.log(JSON.stringify(result, null, 2));
        
        // Analysis
        console.log('\n📈 Analysis:');
        if (result.experience_level === 'Entry (0-2 Years)') {
            console.log('✅ Correctly identified as Entry level - Summer Associate positions are typically for students/recent graduates');
        } else if (result.experience_level === null) {
            console.log('⚠️  No experience level detected - may need to check the job posting content');
        } else {
            console.log(`🤔 Unexpected result: ${result.experience_level} - Summer Associate usually indicates entry level`);
        }
        
        console.log(`🎯 Confidence: ${result.confidence}`);
        console.log(`📝 Found Requirements: ${result.found_requirements}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the test
testEYJob().catch(console.error);
