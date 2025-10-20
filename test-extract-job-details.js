// Test script for the correct extract-job-details function
import Replicate from "replicate";

// Set up Replicate
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
});

// Function to test the extract-job-details functionality
async function testExtractJobDetails(jobLink, maxRetries = 3) {
    const prompt = `You have web search capabilities. Please search for and analyze the job posting at this URL: ${jobLink}

Your task is to extract job details and find the experience level requirements for this job posting by analyzing ONLY the actual job posting content. Look for:
- The complete job title (usually in the header or title section)
- Years of experience required (e.g., "3+ years", "minimum 5 years", "2-4 years")
- Seniority level indicators in the job description (e.g., "Senior", "Lead", "Principal", "Entry-level", "Mid-level")
- Any specific experience requirements mentioned in the job description
- Salary ranges that indicate experience level (higher salaries typically indicate more senior roles)

JOB TITLE CLEANING RULES - FOLLOW EXACTLY:
- Remove: Company names (e.g., "EY", "EY-Parthenon", "EY Foundry"), geographic locations (e.g., "USA"), department prefixes (e.g., "Tax - Other Tax -")
- Keep: Product team names (e.g., "Google Fi and Store", "Payments Team", "Chelsea")
- Keep: Core role title (e.g., "Data Engineer", "Quantitative Finance", "Product Manager")
- Keep: Technical focus areas (e.g., "Infrastructure", "Backend", "Frontend") 
- Keep: Seniority indicators (e.g., "Senior", "Lead", "Principal", "Staff")
- Keep: Specialization areas that affect requirements (e.g., "Economics", "Machine Learning", "ALWIN")

Examples:
- "Data Engineer, Google Fi and Store, Infrastructure" → "Data Engineer, Google Fi and Store, Infrastructure" (keep all)
- "USA - EY-Parthenon - Corporate Finance - Quantitative Finance and Economics" → "Quantitative Finance and Economics" (remove company prefix)
- "USA - Tax - Other Tax - EY Foundry Product Manager - Chelsea - Staff" → "Product Manager, Chelsea, Staff" (remove company/geographic prefixes)
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
  "job_title": "[cleaned job title following the rules above - remove company names, keep role and team info]",
  "city": "[extract from job description or null]",
  "work_arrangement": "[remote/hybrid/on-site or null] (MUST be lowercase)",
  "experience": "[Entry (0-2 Years)/Mid (3-5 Years)/Senior (6-8 Years)/Lead (8+ Years) or null]"
}`;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Attempt ${attempt}: Extracting job details from: ${jobLink}`);
            
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
                if (jsonResult.job_title && 
                    (jsonResult.city === null || typeof jsonResult.city === 'string') &&
                    (jsonResult.work_arrangement === null || ['remote', 'hybrid', 'on-site'].includes(jsonResult.work_arrangement)) &&
                    (jsonResult.experience === null || ['Entry (0-2 Years)', 'Mid (3-5 Years)', 'Senior (6-8 Years)', 'Lead (8+ Years)'].includes(jsonResult.experience))) {
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

async function testExtractJobDetailsExamples() {
    console.log('🧪 Testing Extract Job Details Functionality');
    console.log('===========================================');
    
    const testCases = [
        {
            name: "EY Foundry Product Manager",
            url: "https://usearlycareers.ey.com/job/new-york/usa-tax-other-tax-ey-foundry-product-manager-chelsea-staff/39053/85914261216",
            expectedTitle: "Product Manager, Chelsea, Staff",
            description: "Should remove 'USA - Tax - Other Tax - EY Foundry' prefix"
        },
        {
            name: "EY Staff TTT",
            url: "https://usearlycareers.ey.com/job/new-york/usa-tax-tax-technology-and-transformation-ttt-alwin-staff/39053/85914261504",
            expectedTitle: "Tax Technology and Transformation, ALWIN, Staff",
            description: "Should remove 'USA - Tax' prefix"
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`\n📋 Testing: ${testCase.name}`);
        console.log(`🔗 URL: ${testCase.url}`);
        console.log(`🎯 Expected cleaned title: ${testCase.expectedTitle}`);
        console.log(`📝 Description: ${testCase.description}`);
        console.log('---');
        
        try {
            const result = await testExtractJobDetails(testCase.url);
            
            console.log('✅ Result:');
            console.log(JSON.stringify(result, null, 2));
            
            // Check job title cleaning
            console.log('\n📈 Job Title Analysis:');
            if (result.job_title && result.job_title.includes('EY')) {
                console.log('❌ Job title cleaning failed - still contains company name');
            } else if (result.job_title && result.job_title.includes('USA')) {
                console.log('❌ Job title cleaning failed - still contains geographic prefix');
            } else {
                console.log('✅ Job title cleaning appears successful');
            }
            
            console.log(`📝 Cleaned title: "${result.job_title}"`);
            console.log(`🎯 Expected: "${testCase.expectedTitle}"`);
            console.log(`📍 Experience: ${result.experience}`);
            console.log(`🏢 Work arrangement: ${result.work_arrangement}`);
            console.log(`🌍 City: ${result.city}`);
            
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
        
        console.log('\n' + '='.repeat(60));
    }
}

// Run the test
testExtractJobDetailsExamples().catch(console.error);
