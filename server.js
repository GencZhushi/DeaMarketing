/**
 * Kinspire CoreHire Backend Server
 * 
 * This server:
 * 1. Serves the static frontend files
 * 2. Reads your API key from .env file (secure!)
 * 3. Handles AI analysis requests to OpenAI
 * 
 * Your API key NEVER goes to the browser - it stays on the server.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allow large CV text
app.use(express.static(path.join(__dirname))); // Serve static files

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// =====================================================
// API ENDPOINTS
// =====================================================

/**
 * GET /api/status
 * Check if server is running and API key is configured
 */
app.get('/api/status', (req, res) => {
    const hasApiKey = !!process.env.OPENAI_API_KEY && 
                      process.env.OPENAI_API_KEY !== 'sk-your-api-key-here';
    
    res.json({
        status: 'ok',
        apiKeyConfigured: hasApiKey,
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
    });
});

/**
 * POST /api/analyze
 * Main endpoint for CV + Job analysis
 * 
 * Body: { cvText: string, jobDescription: string }
 * Returns: JSON with all profile fields filled
 */
app.post('/api/analyze', async (req, res) => {
    try {
        const { cvText, jobDescription } = req.body;
        
        // Validate input
        if (!cvText || !jobDescription) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'Both cvText and jobDescription are required'
            });
        }
        
        // Check API key
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-api-key-here') {
            return res.status(500).json({
                error: 'API key not configured',
                message: 'Please add your OpenAI API key to the .env file'
            });
        }
        
        console.log('📝 Starting analysis...');
        console.log(`   CV length: ${cvText.length} characters`);
        console.log(`   Job description length: ${jobDescription.length} characters`);
        
        // Build the analysis prompt
        const prompt = buildAnalysisPrompt(cvText, jobDescription);
        
        // Call OpenAI API
        console.log('🤖 Calling OpenAI API...');
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert HR analyst and executive recruiter. Always respond with valid JSON only, no markdown formatting or extra text.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 4000,
            temperature: 0.7
        });
        
        // Parse the response
        let content = completion.choices[0].message.content.trim();
        
        // Remove markdown code blocks if present
        if (content.startsWith('```')) {
            content = content.replace(/```json?\n?/g, '').replace(/```$/g, '').trim();
        }
        
        const analysisResult = JSON.parse(content);
        
        console.log('✅ Analysis complete!');
        
        // Return the analysis
        res.json({
            success: true,
            data: analysisResult,
            usage: {
                promptTokens: completion.usage.prompt_tokens,
                completionTokens: completion.usage.completion_tokens,
                totalTokens: completion.usage.total_tokens
            }
        });
        
    } catch (error) {
        console.error('❌ Analysis error:', error);
        
        // Handle specific OpenAI errors
        if (error.code === 'invalid_api_key') {
            return res.status(401).json({
                error: 'Invalid API key',
                message: 'Your OpenAI API key is invalid. Please check your .env file.'
            });
        }
        
        if (error.code === 'insufficient_quota') {
            return res.status(402).json({
                error: 'Insufficient credits',
                message: 'Your OpenAI account has no credits. Please add payment method at platform.openai.com'
            });
        }
        
        if (error.code === 'rate_limit_exceeded') {
            return res.status(429).json({
                error: 'Rate limit exceeded',
                message: 'Too many requests. Please wait a moment and try again.'
            });
        }
        
        // Generic error
        res.status(500).json({
            error: 'Analysis failed',
            message: error.message || 'An unexpected error occurred'
        });
    }
});

// =====================================================
// PROMPT BUILDER
// =====================================================

function buildAnalysisPrompt(cvText, jobDescription) {
    return `You are an expert HR analyst and executive recruiter. Analyze the following CV/resume against the job description and provide a comprehensive candidate profile.

## CV/RESUME:
${cvText}

## JOB DESCRIPTION:
${jobDescription}

## TASK:
Based on the CV and job description, fill out ALL the following fields for a Kinspire CoreHire™ Candidate Profile. Be specific, insightful, and professional. Extract real information from the CV where possible, and make educated assessments based on the candidate's background.

Respond ONLY with a valid JSON object with these exact keys (use empty string if information is not available):

{
    "full_name": "Candidate's full name from CV",
    "headline_tagline": "A compelling one-line summary of the candidate (e.g., 'Strategic Marketing Leader with 15+ Years Driving Growth')",
    "company": "Company name from job description",
    "role_title": "Job title from job description",
    "success_level": "HIGH/MEDIUM/LOW with brief explanation",
    "opening_narrative": "2-3 sentence narrative about how this candidate aligns with the role",
    
    "success_factor_1": "First key success factor",
    "success_factor_2": "Second key success factor",
    "success_factor_3": "Third key success factor",
    
    "support_1": "First support need/development area",
    "support_2": "Second support need/development area",
    
    "need_1": "Strategic need 1 from job",
    "need_2": "Strategic need 2 from job",
    "need_3": "Strategic need 3 from job",
    "need_4": "Strategic need 4 from job",
    "need_5": "Strategic need 5 from job",
    
    "match_1": "How candidate matches need 1",
    "match_2": "How candidate matches need 2",
    "match_3": "How candidate matches need 3",
    "match_4": "How candidate matches need 4",
    "match_5": "How candidate matches need 5",
    
    "overall_alignment_descriptor": "Strong/Moderate/Developing",
    "overall_alignment_summary": "Brief summary of cultural alignment",
    "mission_descriptor": "Strong/Moderate/Developing",
    "mission_note": "How candidate aligns with company mission",
    "vision_descriptor": "Strong/Moderate/Developing",
    "vision_note": "How candidate aligns with company vision",
    "values_descriptor": "Strong/Moderate/Developing",
    "values_note": "How candidate aligns with company values",
    "pillars_descriptor": "Strong/Moderate/Developing",
    "pillars_note": "How candidate aligns with company pillars",
    
    "career_1": "Career highlight 1",
    "career_2": "Career highlight 2",
    "career_3": "Career highlight 3",
    "career_4": "Career highlight 4",
    "career_5": "Career highlight 5",
    
    "skill_1": "Signature skill/superpower 1",
    "skill_2": "Signature skill/superpower 2",
    "skill_3": "Signature skill/superpower 3",
    "skill_4": "Signature skill/superpower 4",
    "skill_5": "Signature skill/superpower 5",
    
    "value_1": "Motivator/value 1",
    "value_2": "Motivator/value 2",
    "value_3": "Motivator/value 3",
    "value_4": "Motivator/value 4",
    
    "env_1": "Ideal work environment characteristic 1",
    "env_2": "Ideal work environment characteristic 2",
    "env_3": "Ideal work environment characteristic 3",
    
    "growth_vector": "Primary growth direction",
    "growth_motivators": "What motivates their growth",
    "blind_spots": "Potential blind spots to watch",
    "practices": "Integration practices recommendation",
    
    "public_1": "Public record/online presence finding 1",
    "public_2": "Public record/online presence finding 2",
    "public_3": "Public record/online presence finding 3",
    "public_4": "Public record/online presence finding 4",
    
    "risk_reputation_text": "Low Risk - Professional online presence",
    "risk_tone_text": "Assessment of professional tone",
    "risk_content_text": "Assessment of content risk",
    "risk_background_text": "Assessment of background flags",
    
    "leadership_archetype": "Leadership archetype (e.g., Visionary, Servant Leader, etc.)",
    "leadership_style_sentence": "Description of leadership style",
    "leadership_impact": "How their leadership creates impact",
    "leadership_distinction": "What distinguishes their leadership",
    
    "behavior_1": "Behavioral insight 1",
    "behavior_2": "Behavioral insight 2",
    "behavior_3": "Behavioral insight 3",
    "behavior_4": "Behavioral insight 4",
    "behavior_5": "Behavioral insight 5",
    
    "disc": "Predicted DISC profile (e.g., DI, SC, etc.)",
    "mbti": "Predicted MBTI type",
    "enneagram": "Predicted Enneagram type",
    "culture_talk": "Culture Talk color",
    "culture_index": "Culture Index pattern",
    "strengthsfinder": "Top 5 StrengthsFinder themes"
}

Important: Return ONLY the JSON object, no other text or markdown formatting.`;
}

// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {
    console.log('');
    console.log('🚀 ═══════════════════════════════════════════════════════');
    console.log('   KINSPIRE COREHIRE SERVER STARTED');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log(`   🌐 Open in browser: http://localhost:${PORT}`);
    console.log('');
    
    // Check API key status
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-your-api-key-here') {
        console.log('   ⚠️  WARNING: OpenAI API key not configured!');
        console.log('   📝 Edit the .env file and add your API key');
        console.log('');
    } else {
        console.log('   ✅ OpenAI API key configured');
        console.log(`   🤖 Using model: ${process.env.OPENAI_MODEL || 'gpt-4o-mini'}`);
        console.log('');
    }
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
});
