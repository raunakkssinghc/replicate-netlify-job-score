import Replicate from "replicate";

// Set up Replicate
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
});

// Function to evaluate job relevance using DeepSeek
async function evaluateJobRelevance(jobTitle, jobDescription, jobType) {
    try {
        console.log('Evaluating job relevance for title:', jobTitle, 'against job type:', jobType);
        
        // Validate inputs
        if (!jobTitle || !jobDescription || !jobType) {
            throw new Error('Job title, description, and job type are required');
        }
        
        // Use DeepSeek to evaluate job relevance
        const prompt = `You are a job relevance evaluator. Given a job title, description, and a target search intent, return how relevant the job is (0–100). Respond ONLY in this JSON format: {"score": <number>, "relevant": true/false, "reason": "<short reason>"}

Search intent: Relevant "${jobType}" positions.

Job title: ${jobTitle}

Job Description: ${jobDescription}`;

        const input = {
            prompt: prompt,
            max_new_tokens: 1000
        };

        console.log('Calling DeepSeek to evaluate job relevance...');
        const output = await replicate.run("deepseek-ai/deepseek-v3.1", { input });
        const relevanceResult = output.join("").trim();
        
        console.log('Successfully evaluated job relevance');
        return relevanceResult;
        
    } catch (error) {
        console.error('Evaluation error:', error.message);
        throw new Error(`Failed to evaluate job relevance: ${error.message}`);
    }
}

// Function to parse multipart form data manually
function parseMultipartForm(event) {
    const contentType = event.headers['content-type'] || event.headers['Content-Type'];
    const boundary = contentType.split('boundary=')[1];
    
    if (!boundary) {
        throw new Error('No boundary found in multipart form data');
    }
    
    let body = event.body;
    
    // Handle base64 encoding if needed
    if (event.isBase64Encoded) {
        body = Buffer.from(body, 'base64').toString('utf8');
    }
    
    const fields = {};
    const parts = body.split(`--${boundary}`);
    
    for (const part of parts) {
        if (part.includes('name="job_link"')) {
            const match = part.match(/name="job_link"\s*\r?\n\r?\n(.*?)(?:\r?\n--|$)/s);
            if (match) {
                fields.job_link = match[1].trim();
            }
        }
    }
    
    return fields;
}


// Netlify Function handler
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
        let job_title, job_description, job_type;
        
        // Check Content-Type to determine how to parse the body
        const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
        
        if (contentType.includes('application/json')) {
            // Parse JSON body
            const body = JSON.parse(event.body);
            job_title = body.job_title;
            job_description = body.job_description;
            job_type = body.job_type;
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
            // Parse form data
            const params = new URLSearchParams(event.body);
            job_title = params.get('job_title');
            job_description = params.get('job_description');
            job_type = params.get('job_type');
        } else {
            // Try to parse as JSON by default
            try {
                const body = JSON.parse(event.body);
                job_title = body.job_title;
                job_description = body.job_description;
                job_type = body.job_type;
            } catch (parseError) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        error: "Invalid request format. Use JSON with job_title, job_description, and job_type fields."
                    })
                };
            }
        }

        // Validate required fields
        if (!job_title || !job_type) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: "Missing required fields: job_title and job_type are required",
                    received: {
                        job_title: job_title || null,
                        job_description: job_description || null,
                        job_type: job_type || null
                    }
                })
            };
        }

        // Handle missing job description
        if (!job_description || job_description === null || job_description.trim() === '') {
            // Return default response for missing job description
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    relevance_result: JSON.stringify({
                        score: 0,
                        relevant: false,
                        reason: "Missing job description - cannot evaluate relevance without job details"
                    })
                })
            };
        }

        // Evaluate job relevance using DeepSeek
        console.log('Evaluating job relevance for:', job_title);
        const relevanceResult = await evaluateJobRelevance(job_title, job_description, job_type);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                relevance_result: relevanceResult
            })
        };
        
    } catch (error) {
        console.error('Error:', error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: "Failed to evaluate job relevance",
                details: error.message
            })
        };
    }
};
