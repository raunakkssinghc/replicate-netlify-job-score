// Test the production function directly
import { handler } from './netlify/functions/extract-job-details.js';

async function testProductionFunction() {
    console.log('🧪 Testing Production Function Directly');
    console.log('=====================================');
    
    const testEvent = {
        httpMethod: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            job_link: 'https://usearlycareers.ey.com/job/new-york/usa-tax-other-tax-ey-foundry-product-manager-chelsea-staff/39053/85914261216'
        })
    };
    
    const testContext = {};
    
    try {
        console.log('📤 Sending request to function...');
        const result = await handler(testEvent, testContext);
        
        console.log('📥 Function response:');
        console.log('Status Code:', result.statusCode);
        console.log('Headers:', result.headers);
        console.log('Body:', JSON.parse(result.body));
        
    } catch (error) {
        console.error('❌ Error testing function:', error.message);
    }
}

testProductionFunction().catch(console.error);
