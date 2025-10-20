// Test script for the EY Staff TTT job posting
import Replicate from "replicate";

// Set up Replicate
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
});

// Function to extract experience level using DeepSeek web search - CONTENT ONLY
async function extractExperienceFromJobLink(jobLink, maxRetries = 3) {
    const prompt = `You have web search capabilities. Please search for and analyze the job posting at this URL: ${jobLink}

Your task is to find the experience level requirements for this job posting by analyzing ONLY the actual job posting content. Look for:
- Years of experience required (e.g., "3+ years", "minimum 5 years", "2-4 years")
- Seniority level indicators in the job description (e.g., "Senior", "Lead", "Principal", "Entry-level", "Mid-level")
- Any specific experience requirements mentioned in the job description
- Salary ranges that indicate experience level (higher salaries typically indicate more senior roles)

CRITICAL INSTRUCTIONS:
- Analyze ONLY the job posting content, not the URL or website structure
- Consider salary ranges as indicators of experience level
- Look for technical skill requirements that suggest experience level
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
• "Staff" positions can vary - analyze based on requirements and salary

Salary range indicators:
• $50,000-$70,000 = typically Entry level
• $70,000-$100,000 = typically Mid level  
• $100,000-$150,000 = typically Senior level
• $150,000+ = typically Lead level

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

async function testEYStaffTTTJob() {
    const eyJobUrl = "https://usearlycareers.ey.com/job/new-york/usa-tax-tax-technology-and-transformation-ttt-alwin-staff/39053/85914261504";
    
    console.log('🔍 Testing EY Staff TTT Job Posting - CONTENT ANALYSIS');
    console.log('====================================================');
    console.log(`📋 Job: USA - Tax - Tax Technology and Transformation (TTT) - ALWIN - Staff`);
    console.log(`🔗 URL: ${eyJobUrl}`);
    console.log(`🎯 Expected: Mid (3-5 Years) or Senior (6-8 Years) - $100K-$125K salary + strong technical requirements`);
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
            console.log('✅ Identified as Senior level - matches high salary range and technical requirements');
        } else if (result.experience_level === 'Mid (3-5 Years)') {
            console.log('✅ Identified as Mid level - reasonable for Staff position with strong technical requirements');
        } else if (result.experience_level === 'Entry (0-2 Years)') {
            console.log('❌ Identified as Entry level - contradicts high salary range ($100K-$125K)');
        } else if (result.experience_level === 'Lead (8+ Years)') {
            console.log('✅ Identified as Lead level - high salary range supports this');
        } else if (result.experience_level === null) {
            console.log('⚠️  No experience level detected - may need to check the job posting content');
        } else {
            console.log(`📊 Result: ${result.experience_level}`);
        }
        
        console.log(`🎯 Confidence: ${result.confidence}`);
        console.log(`📝 Found Requirements: ${result.found_requirements}`);
        
        console.log('\n🧠 Expected Analysis:');
        console.log('The job posting should show:');
        console.log('- "Staff" title → Mid/Senior level');
        console.log('- Salary range $100,000-$125,000 → Senior level range');
        console.log('- Strong technical requirements (AI/ML, Python) → Mid/Senior level');
        console.log('- No specific years mentioned but high skill requirements → Mid/Senior level');
        console.log('- Client-facing responsibilities → Mid/Senior level');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the test
testEYStaffTTTJob().catch(console.error);

