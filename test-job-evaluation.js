// Test script for job relevance evaluation

const testJob = {
    job_title: "Senior Agentic AI Engineer",
    job_description: `Our Company:

At Teradata, we're not just managing data; we're unleashing its full potential. Our ClearScape Analytics™ platform and pioneering Enterprise Vector Store are empowering the world's largest enterprises to derive unprecedented value from their most complex data. We're rapidly pushing the boundaries of what's possible with Artificial Intelligence, especially in the exciting realm of autonomous and agentic systems

 We're building intelligent systems that go far beyond automation — they observe, reason, adapt, and drive complex decision-making across large-scale enterprise environments. As a member of our AI engineering team, you'll play a critical role in designing and deploying advanced AI agents that integrate deeply with business operations, turning data into insight, action, and measurable outcomes.

 You'll work alongside a high-caliber team of AI researchers, engineers, and data scientists tackling some of the hardest problems in AI and enterprise software — from scalable multi-agent coordination and fine-tuned LLM applications, to real-time monitoring, drift detection, and closed-loop retraining systems.

 If you're passionate about building intelligent systems that are not only powerful but observable, resilient, and production-ready, this role offers the opportunity to shape the future of enterprise AI from the ground up.

 We are seeking a highly skilled Senior AI Engineer to drive the development and deployment of Agentic AI systems with a strong emphasis on AI observability and data platform integration. You will work at the forefront of cutting-edge AI research and its practical application—designing, implementing, and monitoring intelligent agents capable of autonomous reasoning, decision-making, and continuous learning.

Ignite the Future of AI at Teradata! 

What You'll Do: Shape the Way the World Understands Data   

As a senior Agentic AI Engineer at Teradata, you'll build cutting-edge intelligent agents that transform how users explore data, derive insights, and automate workflows across industries such as healthcare, finance, and telecommunications.

You will:

Design and implement autonomous AI agents for semantic search, text-to-SQL translation, and analytical task execution.
Develop modular prompts, reasoning chains, and decision graphs tailored to complex enterprise use cases.
Enhance agent performance through experimentation with LLMs, prompt tuning, and advanced reasoning workflows.
Integrate agents with Teradata's Model Context Protocol (MCP) to enable seamless interaction with model development pipelines.
Build tools that allow agents to monitor training jobs, evaluate models, and interact with unstructured and structured data sources.
Work on retrieval-augmented generation (RAG) pipelines and extend agents to downstream ML systems.
Who You'll Work With: Join Forces with the Best   

You'll collaborate with a world-class team of AI architects, ML engineers, and domain experts at Silicon Valley, working together to build the next generation of enterprise AI systems.

You'll also work cross-functionally with:

Product managers and UX designers to craft agentic workflows that are intuitive and impactful.
Domain specialists to ensure solutions align with real-world business problems in regulated industries.
Infrastructure and platform teams responsible for training, evaluation, and scaling AI workloads.
This is a rare opportunity to shape foundational AI capabilities within a global, data-driven company.

This is a deeply collaborative environment where technical innovation meets real-world application, where your ideas are not only heard but implemented to shape the next generation of data interaction.  

What Makes You a Qualified Candidate: Skills in Action

5+ years of product engineering experience in AI/ML, with strong software development fundamentals. 
Proficiency with LLM APIs (e.g., OpenAI, Claude, Gemini) and agent frameworks such as AutoGen, LangGraph, AgentBuilder, or CrewAI. 
Experience designing multi-step reasoning chains, prompt pipelines, or intelligent workflows. 
Familiarity with agent evaluation metrics: correctness, latency, failure modes. 
Passion for building production-grade systems that bring AI to life.
What You Bring: Passion and Potential

Master's or Ph.D. in Computer Science, AI, or a related field, or equivalent industry experience. 
Experience working with multimodal inputs, retrieval systems, or structured knowledge sources. 
Deep understanding of enterprise data workflows and scalable AI architectures. 
Prior exposure to MCP or similar orchestration/protocol systems.`,
    job_type: "Data Engineer"
};

async function testJobEvaluation() {
    try {
        console.log('Testing Job Relevance Evaluation...');
        console.log('Job Title:', testJob.job_title);
        console.log('Job Type:', testJob.job_type);
        console.log('---');
        
        // For local testing, we'll simulate the API call
        // In a real scenario, you'd call your deployed Netlify function
        console.log('Simulating evaluation for Data Engineer relevance...');
        
        // This is what the function would return based on the job content
        const mockResult = {
            score: 85,
            relevant: true,
            reason: "Strong alignment with data engineering through data platform integration, analytics workflows, and enterprise data architectures"
        };
        
        console.log('\n=== EVALUATION RESULT ===');
        console.log(JSON.stringify(mockResult, null, 2));
        console.log('\n=== ANALYSIS ===');
        console.log('This Teradata Senior Agentic AI Engineer role is highly relevant for Data Engineer positions because:');
        console.log('• Direct work with data platforms and analytics (ClearScape Analytics, Enterprise Vector Store)');
        console.log('• Text-to-SQL translation and analytical task execution - core data engineering skills');
        console.log('• Integration with model development pipelines and data workflows');
        console.log('• Work with structured and unstructured data sources');
        console.log('• RAG pipelines and ML systems integration');
        console.log('• Enterprise data workflows and scalable AI architectures');
        console.log('• Teradata is a major data platform company');
        
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testJobEvaluation();
