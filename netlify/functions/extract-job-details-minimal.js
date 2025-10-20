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
        const body = JSON.parse(event.body);
        const job_link = body.job_link;
        
        if (!job_link) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: "Missing required field: job_link"
                })
            };
        }

        // For now, just return a test response
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                job_title: "Test Job Title",
                city: "Test City",
                work_arrangement: "remote",
                experience: "Mid (3-5 Years)",
                version: "minimal-test-v1",
                timestamp: new Date().toISOString(),
                received_job_link: job_link
            })
        };
        
    } catch (error) {
        console.error('Error:', error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: "Failed to extract job details",
                details: error.message
            })
        };
    }
};
