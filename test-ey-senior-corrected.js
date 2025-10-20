// Test script for the EY Senior job posting - focusing ONLY on page content
import Replicate from "replicate";

// Set up Replicate
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
});

// Function to extract experience level using DeepSeek web search - CONTENT ONLY
async function extractExperienceFromJobLink(jobLink, maxRetries = 3) {
    const prompt = `You have web search capabilities. Please search for and analyze the job posting at this URL: ${jobLink}

Your task is to find the experience level requirements for this job posting. Look for:
- Years of experience required (e.g., "3+ years", "minimum 5 years", "2-4 years")
- Seniority level indicators in the ACTUAL job description (e.g., "Senior", "Lead", "Principal", "Entry-level", "Mid-level")
- Any specific experience requirements mentioned in the job description

CRITICAL: Only analyze the actual job posting content. Do NOT use URL context or assumptions about the website structure. Focus ONLY on what is explicitly stated in the job description.

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

If no clear experience requirement is found, return null.

Output ONLY a valid JSON object in this exact format (no markdown formatting, no code blocks):
{
  "job_link": "${jobLink}",
  "experience_level": "[Entry (0-2 Years)/Mid (3-5 Years)/Senior (6-8 Years)/Lead (8+ Years)/null]",
  "found_requirements": "[brief description of what experience requirements were found in the actual job content]",
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

async function testEYSeniorJobCorrected() {
    const eyJobUrl = "https://usearlycareers.ey.com/job/charlotte/usa-consulting-financial-services-quantitative-advisory-services-senior/39053/86171544592";
    
    console.log('🔍 Testing EY Senior Job Posting - CONTENT ANALYSIS ONLY');
    console.log('========================================================');
    console.log(`📋 Job: EY Consulting Financial Services Quantitative Advisory Services Senior`);
    console.log(`🔗 URL: ${eyJobUrl}`);
    console.log(`🎯 Expected: Senior (6-8 Years) - "Senior" in job title should indicate senior level`);
    console.log('---');
    
    try {
        console.log('🤖 DeepSeek is searching the web for job requirements...');
        console.log('📊 Analyzing experience level requirements from ACTUAL job content...');
        
        const result = await extractExperienceFromJobLink(eyJobUrl);
        
        console.log('✅ Result:');
        console.log(JSON.stringify(result, null, 2));
        
        // Analysis
        console.log('\n📈 Analysis:');
        if (result.experience_level === 'Senior (6-8 Years)') {
            console.log('✅ Correctly identified as Senior level based on job content');
        } else if (result.experience_level === 'Entry (0-2 Years)') {
            console.log('❌ Incorrectly identified as Entry level - this contradicts the "Senior" job title');
            console.log('   The AI may be making assumptions based on URL context instead of job content');
        } else if (result.experience_level === null) {
            console.log('⚠️  No experience level detected - may need to check the job posting content');
        } else {
            console.log(`📊 Result: ${result.experience_level}`);
        }
        
        console.log(`🎯 Confidence: ${result.confidence}`);
        console.log(`📝 Found Requirements: ${result.found_requirements}`);
        
        console.log('\n🧠 Expected Behavior:');
        console.log('The AI should analyze the actual job posting content and find evidence of:');
        console.log('- Years of experience required (e.g., "5+ years")');
        console.log('- Senior-level responsibilities and requirements');
        console.log('- NOT make assumptions based on URL structure');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the test
testEYSeniorJobCorrected().catch(console.error);

