# 🔍 Analysis: EY Job Posting Experience Level Detection Issues

## Problem Identified

You are absolutely correct - the AI is making incorrect assumptions. The second EY job posting with "Senior" in the title is being incorrectly classified as Entry level.

## What's Happening

The AI is saying things like:
- "this is an early careers/student program targeting current students and recent graduates"
- "context indicates entry-level position"

This suggests the AI is either:
1. **Still using URL context** despite explicit instructions not to
2. **The actual job posting content** does say it's for students/recent graduates (which would be very confusing given the "Senior" title)

## The Real Issue

The problem is that **DeepSeek's web search might be accessing a different page or cached content** than what we expect. The "Senior" job title should indicate a senior-level position, but the AI is finding content that suggests it's for entry-level candidates.

## Possible Explanations

1. **URL Redirect**: The URL might redirect to a different job posting
2. **Dynamic Content**: The page might show different content based on user agent or other factors
3. **Cached Content**: DeepSeek might be accessing cached/outdated content
4. **Page Structure**: The job posting might have conflicting information

## Recommendations

### 1. Verify the Actual Job Posting
We should manually check what the actual job posting says at:
`https://usearlycareers.ey.com/job/charlotte/usa-consulting-financial-services-quantitative-advisory-services-senior/39053/86171544592`

### 2. Improve the AI Prompt
The current prompt needs to be more explicit about:
- Only trusting explicit experience requirements in the job description
- Ignoring any website navigation or program context
- Focusing on years of experience and job responsibilities

### 3. Add Validation Logic
We could add logic to flag when job title and detected experience level don't match:
- If title has "Senior" but detected as "Entry" → flag for manual review
- If title has "Associate" but detected as "Senior" → flag for manual review

### 4. Test with Known Good Examples
We should test with job postings where we know the correct experience level to validate the system.

## Current Status

✅ **Summer Associate job**: Correctly identified as Entry (0-2 Years)  
❌ **Senior job**: Incorrectly identified as Entry (0-2 Years) despite "Senior" in title

The system needs refinement to ensure it's analyzing actual job content rather than making assumptions based on website structure or context.

