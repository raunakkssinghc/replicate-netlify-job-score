// Mock test for the EY job posting (simulates the expected result)

async function testEYJobMock() {
    const eyJobUrl = "https://usearlycareers.ey.com/job/los-angeles/usa-ey-parthenon-corporate-finance-capital-equipment-summer-associate-2026/39053/86171544528";
    
    console.log('🔍 Testing EY Job Posting Experience Level Detection (Mock)');
    console.log('==========================================================');
    console.log(`📋 Job: EY Parthenon Corporate Finance Capital Equipment Summer Associate 2026`);
    console.log(`🔗 URL: ${eyJobUrl}`);
    console.log(`🎯 Expected: Entry (0-2 Years) - "Summer Associate" indicates internship/entry level`);
    console.log('---');
    
    // Mock the expected result based on the job title and URL
    const mockResult = {
        job_link: eyJobUrl,
        experience_level: "Entry (0-2 Years)",
        found_requirements: "Found 'Summer Associate' in job title and 'Early Careers' in URL path, indicating internship/entry-level position for students or recent graduates",
        confidence: "high"
    };
    
    console.log('✅ Mock Result:');
    console.log(JSON.stringify(mockResult, null, 2));
    
    // Analysis
    console.log('\n📈 Analysis:');
    console.log('✅ Correctly identified as Entry level - Summer Associate positions are typically for students/recent graduates');
    console.log('🎯 Confidence: high');
    console.log('📝 Found Requirements: Summer Associate title + Early Careers URL path');
    
    console.log('\n🔧 To run the actual test with DeepSeek:');
    console.log('1. Set your REPLICATE_API_TOKEN environment variable:');
    console.log('   export REPLICATE_API_TOKEN="your_token_here"');
    console.log('2. Run: node test-ey-job.js');
    
    console.log('\n🌐 Job Analysis:');
    console.log('• URL contains "usearlycareers" - indicates early career/internship program');
    console.log('• Job title contains "Summer Associate" - typically internship/entry level');
    console.log('• Position is for 2026 - suggests it\'s a planned internship program');
    console.log('• Corporate Finance Capital Equipment - specialized but entry-level role');
    
    console.log('\n📊 Expected Experience Level: Entry (0-2 Years)');
    console.log('   - Summer Associate positions typically require:');
    console.log('   - Current student or recent graduate');
    console.log('   - 0-2 years of relevant experience');
    console.log('   - Focus on learning and development');
}

// Run the mock test
testEYJobMock().catch(console.error);

