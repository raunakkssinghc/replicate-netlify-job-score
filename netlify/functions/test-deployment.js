export const handler = async (event, context) => {
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: "Deployment test successful!",
            timestamp: new Date().toISOString(),
            version: "test-deployment-v1"
        })
    };
};
