/**
 * AI Integration Module for Kinspire CoreHire
 * 
 * This module handles:
 * 1. CV file upload and text extraction (PDF, DOC, DOCX, TXT)
 * 2. Backend server communication (API key is stored securely in .env)
 * 3. Auto-filling form fields based on AI analysis
 */

// =====================================================
// CONFIGURATION & STATE
// =====================================================

const ServerConfig = {
    baseUrl: window.location.origin, // Uses same origin as the page
    analyzeEndpoint: '/api/analyze',
    statusEndpoint: '/api/status'
};

const AppState = {
    cvText: '',
    cvFileName: '',
    jobDescription: '',
    serverReady: false,
    apiKeyConfigured: false,
    isAnalyzing: false
};

// =====================================================
// INITIALIZATION
// =====================================================

document.addEventListener('DOMContentLoaded', function() {
    initializeAIModule();
});

function initializeAIModule() {
    // Check server status (API key is in .env file)
    checkServerStatus();
    
    // Setup event listeners
    setupFileUploadHandlers();
    setupJobDescriptionHandlers();
    setupAnalysisHandlers();
    
    // Check if analyze button should be enabled
    updateAnalyzeButtonState();
}

// =====================================================
// SERVER STATUS CHECK
// =====================================================

async function checkServerStatus() {
    const statusDiv = document.getElementById('api-status');
    
    try {
        const response = await fetch(ServerConfig.statusEndpoint);
        const data = await response.json();
        
        AppState.serverReady = data.status === 'ok';
        AppState.apiKeyConfigured = data.apiKeyConfigured;
        
        if (statusDiv) {
            if (AppState.apiKeyConfigured) {
                statusDiv.innerHTML = `
                    <span class="status-icon success">✅</span>
                    <span class="status-text">Server connected • API key configured • Model: ${data.model}</span>
                `;
                statusDiv.className = 'api-status success';
            } else {
                statusDiv.innerHTML = `
                    <span class="status-icon warning">⚠️</span>
                    <span class="status-text">Server connected but API key not configured. Edit the <code>.env</code> file.</span>
                `;
                statusDiv.className = 'api-status warning';
            }
        }
        
        updateAnalyzeButtonState();
        
    } catch (error) {
        console.error('Server status check failed:', error);
        AppState.serverReady = false;
        AppState.apiKeyConfigured = false;
        
        if (statusDiv) {
            statusDiv.innerHTML = `
                <span class="status-icon error">❌</span>
                <span class="status-text">Server not running. Start with: <code>npm start</code></span>
            `;
            statusDiv.className = 'api-status error';
        }
        
        updateAnalyzeButtonState();
    }
}

// =====================================================
// FILE UPLOAD & TEXT EXTRACTION
// =====================================================

function setupFileUploadHandlers() {
    const dropZone = document.getElementById('cv-drop-zone');
    const fileInput = document.getElementById('cv-upload');
    const browseBtn = document.getElementById('cv-browse-btn');
    const removeBtn = document.getElementById('cv-remove-btn');
    
    // Browse button click
    browseBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        fileInput.click();
    });
    
    // Click on drop zone
    dropZone.addEventListener('click', function() {
        fileInput.click();
    });
    
    // File selected
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            handleFileUpload(this.files[0]);
        }
    });
    
    // Drag and drop
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });
    
    // Remove file
    removeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        clearUploadedFile();
    });
}

async function handleFileUpload(file) {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ];
    
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
        showNotification('Please upload a PDF, DOC, DOCX, or TXT file', 'error');
        return;
    }
    
    // Show file preview
    document.querySelector('.upload-placeholder').style.display = 'none';
    document.getElementById('cv-preview').style.display = 'flex';
    document.getElementById('cv-file-name').textContent = file.name;
    AppState.cvFileName = file.name;
    
    // Extract text based on file type
    try {
        let extractedText = '';
        
        if (fileExtension === '.pdf') {
            extractedText = await extractTextFromPDF(file);
        } else if (fileExtension === '.txt') {
            extractedText = await extractTextFromTXT(file);
        } else if (fileExtension === '.doc' || fileExtension === '.docx') {
            extractedText = await extractTextFromDOC(file);
        }
        
        if (extractedText) {
            AppState.cvText = extractedText;
            
            // Show extracted text preview
            document.getElementById('cv-text-preview').style.display = 'block';
            document.getElementById('cv-extracted-text').value = extractedText;
            
            showNotification('CV text extracted successfully!', 'success');
            updateAnalyzeButtonState();
        } else {
            showNotification('Could not extract text from file. Please try a different format.', 'error');
        }
    } catch (error) {
        console.error('Error extracting text:', error);
        showNotification('Error processing file: ' + error.message, 'error');
    }
}

async function extractTextFromPDF(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const typedArray = new Uint8Array(e.target.result);
                const pdf = await pdfjsLib.getDocument(typedArray).promise;
                
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    fullText += pageText + '\n\n';
                }
                
                resolve(fullText.trim());
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

async function extractTextFromTXT(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            resolve(e.target.result);
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

async function extractTextFromDOC(file) {
    // For DOC/DOCX files, we'll use a simplified approach
    // For full support, you would need a library like mammoth.js
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                // Try to extract text (works better with DOCX)
                const arrayBuffer = e.target.result;
                const text = await parseDocx(arrayBuffer);
                resolve(text);
            } catch (error) {
                // Fallback: Ask user to copy-paste or use TXT/PDF
                reject(new Error('DOC/DOCX extraction limited. Please use PDF or TXT format, or copy-paste the CV text.'));
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// Simple DOCX parser (extracts text from XML)
async function parseDocx(arrayBuffer) {
    try {
        // DOCX is a ZIP file containing XML
        const JSZip = window.JSZip;
        if (!JSZip) {
            throw new Error('For DOCX support, please use PDF format instead.');
        }
        
        const zip = await JSZip.loadAsync(arrayBuffer);
        const documentXml = await zip.file('word/document.xml').async('text');
        
        // Extract text from XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(documentXml, 'text/xml');
        const textElements = xmlDoc.getElementsByTagName('w:t');
        
        let text = '';
        for (let elem of textElements) {
            text += elem.textContent + ' ';
        }
        
        return text.trim();
    } catch (error) {
        throw new Error('Could not parse DOCX file. Please use PDF or TXT format.');
    }
}

function clearUploadedFile() {
    document.querySelector('.upload-placeholder').style.display = 'block';
    document.getElementById('cv-preview').style.display = 'none';
    document.getElementById('cv-text-preview').style.display = 'none';
    document.getElementById('cv-upload').value = '';
    document.getElementById('cv-extracted-text').value = '';
    
    AppState.cvText = '';
    AppState.cvFileName = '';
    
    updateAnalyzeButtonState();
}

// =====================================================
// JOB DESCRIPTION HANDLERS
// =====================================================

function setupJobDescriptionHandlers() {
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // Update button states
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show/hide content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.style.display = 'none';
                content.classList.remove('active');
            });
            
            const targetContent = document.getElementById('tab-' + targetTab);
            targetContent.style.display = 'block';
            targetContent.classList.add('active');
        });
    });
    
    // Listen for job description changes
    document.getElementById('job-description-full').addEventListener('input', function() {
        updateJobDescription();
    });
    
    // Manual fields
    ['job-title-input', 'company-name-input', 'job-responsibilities', 'job-requirements', 'company-culture'].forEach(id => {
        const elem = document.getElementById(id);
        if (elem) {
            elem.addEventListener('input', updateJobDescription);
        }
    });
}

function updateJobDescription() {
    const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
    
    if (activeTab === 'paste') {
        AppState.jobDescription = document.getElementById('job-description-full').value.trim();
    } else {
        // Combine manual fields
        const title = document.getElementById('job-title-input').value;
        const company = document.getElementById('company-name-input').value;
        const responsibilities = document.getElementById('job-responsibilities').value;
        const requirements = document.getElementById('job-requirements').value;
        const culture = document.getElementById('company-culture').value;
        
        AppState.jobDescription = `
Job Title: ${title}
Company: ${company}

Responsibilities:
${responsibilities}

Requirements:
${requirements}

Company Culture/Values:
${culture}
        `.trim();
    }
    
    updateAnalyzeButtonState();
}

// =====================================================
// ANALYSIS CONTROLS
// =====================================================

function setupAnalysisHandlers() {
    document.getElementById('analyze-btn').addEventListener('click', performAnalysis);
    document.getElementById('clear-analysis-btn').addEventListener('click', clearAllInputs);
}

function updateAnalyzeButtonState() {
    const analyzeBtn = document.getElementById('analyze-btn');
    const isReady = AppState.serverReady && AppState.apiKeyConfigured;
    const hasCvText = AppState.cvText.length > 0;
    const hasJobDesc = AppState.jobDescription.length > 0;
    
    analyzeBtn.disabled = !(isReady && hasCvText && hasJobDesc);
    
    // Update button tooltip based on what's missing
    if (!AppState.serverReady) {
        analyzeBtn.title = 'Server not running. Run: npm start';
    } else if (!AppState.apiKeyConfigured) {
        analyzeBtn.title = 'API key not configured. Edit .env file';
    } else if (!hasCvText) {
        analyzeBtn.title = 'Please upload a CV';
    } else if (!hasJobDesc) {
        analyzeBtn.title = 'Please enter job description';
    } else {
        analyzeBtn.title = 'Click to analyze CV against job description';
    }
}

function clearAllInputs() {
    // Clear CV
    clearUploadedFile();
    
    // Clear job description
    document.getElementById('job-description-full').value = '';
    document.getElementById('job-title-input').value = '';
    document.getElementById('company-name-input').value = '';
    document.getElementById('job-responsibilities').value = '';
    document.getElementById('job-requirements').value = '';
    document.getElementById('company-culture').value = '';
    
    AppState.jobDescription = '';
    
    // Hide status
    document.getElementById('analysis-status').style.display = 'none';
    
    updateAnalyzeButtonState();
    showNotification('All inputs cleared', 'success');
}

// =====================================================
// AI ANALYSIS - Server Integration
// =====================================================

async function performAnalysis() {
    if (AppState.isAnalyzing) return;
    
    AppState.isAnalyzing = true;
    
    const analyzeBtn = document.getElementById('analyze-btn');
    const btnText = analyzeBtn.querySelector('.btn-text');
    const btnLoading = analyzeBtn.querySelector('.btn-loading');
    const statusDiv = document.getElementById('analysis-status');
    const statusMessage = statusDiv.querySelector('.status-message');
    const progressFill = statusDiv.querySelector('.progress-fill');
    
    // Update UI
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-flex';
    analyzeBtn.disabled = true;
    
    statusDiv.style.display = 'block';
    statusDiv.className = 'analysis-status';
    statusMessage.textContent = '🔄 Preparing analysis...';
    progressFill.style.width = '10%';
    
    try {
        // Step 1: Prepare the request
        statusMessage.textContent = '📝 Sending CV and job requirements to AI...';
        progressFill.style.width = '30%';
        
        // Step 2: Call our backend server (which calls OpenAI securely)
        statusMessage.textContent = '🤖 AI is analyzing the candidate profile...';
        progressFill.style.width = '50%';
        
        const analysisResult = await callServerAnalysis(AppState.cvText, AppState.jobDescription);
        
        // Step 3: Parse and fill form
        statusMessage.textContent = '📋 Filling in the profile form...';
        progressFill.style.width = '80%';
        
        await fillFormWithAnalysis(analysisResult);
        
        // Complete
        progressFill.style.width = '100%';
        statusDiv.classList.add('success');
        statusMessage.textContent = '✅ Analysis complete! Profile has been filled.';
        
        // Scroll to form
        setTimeout(() => {
            document.getElementById('form-view').scrollIntoView({ behavior: 'smooth' });
        }, 1000);
        
    } catch (error) {
        console.error('Analysis error:', error);
        statusDiv.classList.add('error');
        statusMessage.textContent = '❌ Error: ' + error.message;
        progressFill.style.width = '0%';
    } finally {
        AppState.isAnalyzing = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        analyzeBtn.disabled = false;
    }
}

/**
 * Call our backend server to perform the analysis
 * The server reads the API key from .env file (secure!)
 */
async function callServerAnalysis(cvText, jobDescription) {
    const response = await fetch(ServerConfig.analyzeEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            cvText: cvText,
            jobDescription: jobDescription
        })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        // Handle specific error types
        if (response.status === 401) {
            throw new Error('Invalid API key. Please check your .env file.');
        } else if (response.status === 402) {
            throw new Error('No OpenAI credits. Add payment at platform.openai.com');
        } else if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please wait and try again.');
        } else if (response.status === 500 && data.error === 'API key not configured') {
            throw new Error('API key not configured. Edit the .env file and restart the server.');
        } else {
            throw new Error(data.message || 'Analysis failed');
        }
    }
    
    if (!data.success) {
        throw new Error(data.message || 'Analysis failed');
    }
    
    // Log usage info
    if (data.usage) {
        console.log('📊 API Usage:', data.usage);
    }
    
    return data.data;
}

async function fillFormWithAnalysis(data) {
    // Map of JSON keys to form field IDs
    const fieldMapping = {
        'full_name': 'full_name',
        'headline_tagline': 'headline_tagline',
        'company': 'company',
        'role_title': 'role_title',
        'success_level': 'success_level',
        'opening_narrative': 'opening_narrative',
        'success_factor_1': 'success_factor_1',
        'success_factor_2': 'success_factor_2',
        'success_factor_3': 'success_factor_3',
        'support_1': 'support_1',
        'support_2': 'support_2',
        'need_1': 'need_1',
        'need_2': 'need_2',
        'need_3': 'need_3',
        'need_4': 'need_4',
        'need_5': 'need_5',
        'match_1': 'match_1',
        'match_2': 'match_2',
        'match_3': 'match_3',
        'match_4': 'match_4',
        'match_5': 'match_5',
        'overall_alignment_descriptor': 'overall_alignment_descriptor',
        'overall_alignment_summary': 'overall_alignment_summary',
        'mission_descriptor': 'mission_descriptor',
        'mission_note': 'mission_note',
        'vision_descriptor': 'vision_descriptor',
        'vision_note': 'vision_note',
        'values_descriptor': 'values_descriptor',
        'values_note': 'values_note',
        'pillars_descriptor': 'pillars_descriptor',
        'pillars_note': 'pillars_note',
        'career_1': 'career_1',
        'career_2': 'career_2',
        'career_3': 'career_3',
        'career_4': 'career_4',
        'career_5': 'career_5',
        'skill_1': 'skill_1',
        'skill_2': 'skill_2',
        'skill_3': 'skill_3',
        'skill_4': 'skill_4',
        'skill_5': 'skill_5',
        'value_1': 'value_1',
        'value_2': 'value_2',
        'value_3': 'value_3',
        'value_4': 'value_4',
        'env_1': 'env_1',
        'env_2': 'env_2',
        'env_3': 'env_3',
        'growth_vector': 'growth_vector',
        'growth_motivators': 'growth_motivators',
        'blind_spots': 'blind_spots',
        'practices': 'practices',
        'public_1': 'public_1',
        'public_2': 'public_2',
        'public_3': 'public_3',
        'public_4': 'public_4',
        'risk_reputation_text': 'risk_reputation_text',
        'risk_tone_text': 'risk_tone_text',
        'risk_content_text': 'risk_content_text',
        'risk_background_text': 'risk_background_text',
        'leadership_archetype': 'leadership_archetype',
        'leadership_style_sentence': 'leadership_style_sentence',
        'leadership_impact': 'leadership_impact',
        'leadership_distinction': 'leadership_distinction',
        'behavior_1': 'behavior_1',
        'behavior_2': 'behavior_2',
        'behavior_3': 'behavior_3',
        'behavior_4': 'behavior_4',
        'behavior_5': 'behavior_5',
        'disc': 'disc',
        'mbti': 'mbti',
        'enneagram': 'enneagram',
        'culture_talk': 'culture_talk',
        'culture_index': 'culture_index',
        'strengthsfinder': 'strengthsfinder'
    };
    
    // Fill each field with animation
    for (const [jsonKey, fieldId] of Object.entries(fieldMapping)) {
        const value = data[jsonKey];
        if (value) {
            const element = document.getElementById(fieldId);
            if (element) {
                // Add highlight effect
                element.style.transition = 'background-color 0.3s';
                element.style.backgroundColor = '#fff3e0';
                
                // Set value
                element.value = value;
                
                // Trigger input event for dynamic fields
                element.dispatchEvent(new Event('input', { bubbles: true }));
                
                // Remove highlight after delay
                setTimeout(() => {
                    element.style.backgroundColor = '';
                }, 500);
                
                // Small delay between fields for visual effect
                await new Promise(resolve => setTimeout(resolve, 30));
            }
        }
    }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close">×</button>
    `;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '8px',
        backgroundColor: type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3',
        color: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        zIndex: '10000',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        animation: 'slideIn 0.3s ease'
    });
    
    // Add close handler
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }
`;
document.head.appendChild(style);
