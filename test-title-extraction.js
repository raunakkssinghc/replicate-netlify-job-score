// Test script to see what job title the AI is actually extracting
import Replicate from "replicate";

// Set up Replicate
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
});

async function testTitleExtraction(jobLink) {
    const prompt = `You have web search capabilities. Please search for and analyze the job posting at this URL: ${jobLink}

Your task is to find the job title from the job posting content. Look for:
- The main job title (usually in the header or title section)
- Any additional title information
- Team names or specializations mentioned

Please tell me exactly what job title you find in the job posting content. Be specific about what you see.

Output ONLY a valid JSON object in this exact format:
{
  "job_link": "${jobLink}",
  "found_title": "[exact job title as it appears in the job posting]",
  "title_location": "[where in the posting you found this title]"
}`;

    try {
        console.log(`Searching for job title in: ${jobLink}`);
        
        const input = {
            prompt: prompt,
            max_new_tokens: 300
        };

        const output = await replicate.run("deepseek-ai/deepseek-v3.1", { input });
        const responseText = output.join("").trim();
        
        console.log(`Response:`, responseText);
        
        // Clean up the response text to extract JSON
        let cleanResponse = responseText;
        if (cleanResponse.includes('```json')) {
            cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        }
        
        const jsonResult = JSON.parse(cleanResponse);
        return jsonResult;
        
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}

async function testBothJobs() {
    console.log('🔍 Testing Job Title Extraction');
    console.log('===============================');
    
    const jobs = [
        "https://usearlycareers.ey.com/job/new-york/usa-tax-other-tax-ey-foundry-product-manager-chelsea-staff/39053/85914261216",
        "https://usearlycareers.ey.com/job/new-york/usa-tax-tax-technology-and-transformation-ttt-alwin-staff/39053/85914261504"
    ];
    
    for (const jobLink of jobs) {
        console.log(`\n📋 Testing: ${jobLink}`);
        console.log('---');
        
        const result = await testTitleExtraction(jobLink);
        if (result) {
            console.log('✅ Result:');
            console.log(JSON.stringify(result, null, 2));
        }
        
        console.log('\n' + '='.repeat(60));
    }
}

// Run the test
testBothJobs().catch(console.error);
