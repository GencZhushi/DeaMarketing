// Dynamic field updates
document.addEventListener('DOMContentLoaded', function() {
    // Update dynamic fields when inputs change
    const fullNameInput = document.getElementById('full_name');
    const roleTitleInput = document.getElementById('role_title');
    const companyInput = document.getElementById('company');

    fullNameInput.addEventListener('input', function() {
        const value = this.value || '[[FULL_NAME]]';
        document.getElementById('display_full_name_1').textContent = value;
    });

    roleTitleInput.addEventListener('input', function() {
        const value = this.value || '[[ROLE_TITLE]]';
        document.getElementById('display_role_title_1').textContent = value;
        document.getElementById('display_role_title_2').textContent = value;
    });

    companyInput.addEventListener('input', function() {
        const value = this.value || '[[COMPANY]]';
        document.getElementById('display_company_1').textContent = value;
        document.getElementById('display_company_2').textContent = value;
    });

    // PDF Export
    document.getElementById('export-pdf').addEventListener('click', async function() {
        const button = this;
        button.disabled = true;
        button.textContent = 'Generating PDF...';

        try {
            await generatePDF();
            button.textContent = 'Export as PDF';
            button.disabled = false;
        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Error generating PDF. Please try again.');
            button.textContent = 'Export as PDF';
            button.disabled = false;
        }
    });

    // Word Export
    document.getElementById('export-word').addEventListener('click', function() {
        const button = this;
        button.disabled = true;
        button.textContent = 'Generating Word...';

        try {
            generateWord();
            button.textContent = 'Export as Word';
            button.disabled = false;
        } catch (error) {
            console.error('Word generation error:', error);
            alert('Error generating Word document. Please try again.');
            button.textContent = 'Export as Word';
            button.disabled = false;
        }
    });
});

// Generate PDF
async function generatePDF() {
    const { jsPDF } = window.jspdf;
    
    // Create a preview element with filled values
    const previewDiv = createPreviewHTML();
    document.body.appendChild(previewDiv);
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Get all page sections
    const sections = previewDiv.querySelectorAll('.pdf-page');
    
    for (let i = 0; i < sections.length; i++) {
        if (i > 0) {
            pdf.addPage();
        }
        
        const canvas = await html2canvas(sections[i], {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - 20; // margins
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    }
    
    const filename = `Kinspire_CoreHire_${getFieldValue('full_name') || 'Candidate'}.pdf`;
    pdf.save(filename);
    
    // Clean up
    document.body.removeChild(previewDiv);
}

// Generate Word Document
function generateWord() {
    const previewHTML = createPreviewHTML();
    
    const htmlContent = `
        <!DOCTYPE html>
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset="UTF-8">
            <title>Kinspire CoreHire Candidate Profile</title>
            <!--[if gte mso 9]>
            <xml>
                <w:WordDocument>
                    <w:View>Print</w:View>
                    <w:Zoom>100</w:Zoom>
                </w:WordDocument>
            </xml>
            <![endif]-->
            <style>
                @page {
                    margin: 1in;
                }
                body { 
                    font-family: 'Calibri', 'Arial', sans-serif; 
                    margin: 0;
                    padding: 0;
                }
                .header { 
                    display: table;
                    width: 100%;
                    border-bottom: 2px solid #000; 
                    padding-bottom: 20px; 
                    margin-bottom: 30px; 
                }
                .header-left, .header-right {
                    display: table-cell;
                    vertical-align: middle;
                }
                .header-right {
                    text-align: right;
                }
                .logo-text { 
                    font-size: 32px; 
                    font-weight: bold; 
                }
                .get-kinspired { 
                    font-size: 24px; 
                    font-weight: bold; 
                    color: #8B1874; 
                }
                .subtagline { 
                    font-size: 11px; 
                }
                h1 { 
                    color: #8B1874; 
                    font-size: 24px; 
                    margin-top: 20px;
                    margin-bottom: 20px;
                }
                h2 { 
                    color: #8B1874; 
                    font-size: 20px; 
                    margin-top: 30px; 
                    margin-bottom: 15px;
                }
                h3 { 
                    color: #8B1874; 
                    font-size: 16px; 
                    margin-top: 20px; 
                    margin-bottom: 10px;
                }
                .divider { 
                    border-top: 2px solid #000; 
                    margin: 30px 0; 
                }
                .value { 
                    color: #8B1874; 
                    font-weight: bold; 
                }
                .subtitle { 
                    color: #888; 
                    font-size: 14px; 
                }
                .footer { 
                    margin-top: 50px; 
                    border-top: 2px solid #000; 
                    padding-top: 20px; 
                    text-align: center; 
                }
                ul { 
                    list-style-type: disc; 
                    margin-left: 20px; 
                    margin-bottom: 15px;
                }
                li {
                    margin-bottom: 5px;
                }
                p {
                    margin-bottom: 10px;
                }
                .page-break { 
                    page-break-after: always; 
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th {
                    text-align: left;
                    padding: 10px 5px;
                    border-bottom: 2px solid #000;
                }
            </style>
        </head>
        <body>
            ${previewHTML.innerHTML}
        </body>
        </html>
    `;
    
    // Convert HTML to Blob with proper MIME type for Word
    const blob = new Blob(['\ufeff', htmlContent], {
        type: 'application/msword'
    });
    
    const filename = `Kinspire_CoreHire_${getFieldValue('full_name') || 'Candidate'}.doc`;
    
    // Use FileSaver if available, otherwise create download link
    if (typeof saveAs !== 'undefined') {
        saveAs(blob, filename);
    } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Create preview HTML with filled values
function createPreviewHTML() {
    const preview = document.createElement('div');
    preview.className = 'preview-container';
    preview.style.position = 'absolute';
    preview.style.left = '-9999px';
    preview.style.width = '210mm';
    preview.style.background = '#fdf9fa';
    
    // Background style for PDF pages
    const pageBackground = `
        background: #fdf9fa;
        background-image: 
            radial-gradient(circle at 20% 30%, rgba(232, 180, 217, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(232, 180, 217, 0.06) 0%, transparent 40%),
            radial-gradient(circle at 60% 60%, rgba(232, 180, 217, 0.05) 0%, transparent 45%),
            radial-gradient(circle at 30% 80%, rgba(232, 180, 217, 0.07) 0%, transparent 50%);
        min-height: 297mm;
    `;
    
    // Page 1
    preview.innerHTML = `
        <div class="pdf-page" style="${pageBackground}">
            ${createHeader()}
            <div style="padding: 40px 50px;">
                <h1 style="color: #8B1874; font-size: 24px; margin-bottom: 20px;">
                    Kinspire CoreHire™ Candidate Profile: <span class="value">${getFieldValue('full_name')}</span>
                </h1>
                <p><strong>${getFieldValue('headline_tagline')}</strong></p>
                <hr style="border-top: 2px solid #333; margin: 30px 0;">
                <p>This analysis uses Kinspire's proprietary CoreHire™ methodology to evaluate how <span class="value">${getFieldValue('full_name')}</span> aligns with the position of <span class="value">${getFieldValue('role_title')}</span> at <span class="value">${getFieldValue('company')}</span>. CoreHire™ goes beyond resumes to assess values, leadership style, and growth trajectory—offering a predictive view of role fit and long-term success.</p>
                <p><strong>Job Position:</strong> ${getFieldValue('company')} – ${getFieldValue('role_title')}</p>
                <p><strong style="color: #8B1874;">Potential for Success:</strong> ${getFieldValue('success_level')}</p>
                <p>${getFieldValue('opening_narrative')}</p>
                
                <h2 style="color: #8B1874;">Success Factors</h2>
                <ul>
                    <li>${getFieldValue('success_factor_1')}</li>
                    <li>${getFieldValue('success_factor_2')}</li>
                    <li>${getFieldValue('success_factor_3')}</li>
                </ul>
                
                <h2 style="color: #8B1874;">Support Needs</h2>
                <ul>
                    <li>${getFieldValue('support_1')}</li>
                    <li>${getFieldValue('support_2')}</li>
                </ul>
                
                <hr style="border-top: 2px solid #333; margin: 30px 0;">
                
                <h2 style="color: #8B1874;">Candidate & Role Alignment – ${getFieldValue('role_title')}, ${getFieldValue('company')}</h2>
                <p class="subtitle">How the candidate's skills and style align with the role's key responsibilities and success factors.</p>
                
                <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
                    <tr style="border-bottom: 2px solid #333;">
                        <th style="text-align: left; padding: 10px;">Strategic Need</th>
                        <th style="text-align: left; padding: 10px;">Matching Strengths</th>
                    </tr>
                </table>
            </div>
            ${createFooter()}
        </div>
        
        <div class="pdf-page page-break" style="${pageBackground}">
            ${createHeader()}
            <div style="padding: 40px 50px;">
                <h2 style="color: #8B1874;">CoreHire™ Candidate Portrait & Positioning</h2>
                <p class="subtitle">The following provides a multidimensional snapshot of the candidate—highlighting not just skills and experience, but also motivations, leadership style, behavioral profile, and growth potential. Together, these insights tell the story of who the candidate is, how they lead, and where they are best positioned to thrive.</p>
                
                <h3 style="color: #8B1874;">Signature Skills & Superpowers</h3>
                <p class="subtitle">What makes the candidate stand out in leadership and impact.</p>
                <ul>
                    <li>${getFieldValue('skill_1')}</li>
                    <li>${getFieldValue('skill_2')}</li>
                    <li>${getFieldValue('skill_3')}</li>
                    <li>${getFieldValue('skill_4')}</li>
                    <li>${getFieldValue('skill_5')}</li>
                </ul>
                
                <h3 style="color: #8B1874;">Motivators & Values</h3>
                <p class="subtitle">What drives the candidate and underpins their long-term engagement.</p>
                <ul>
                    <li>${getFieldValue('value_1')}</li>
                    <li>${getFieldValue('value_2')}</li>
                    <li>${getFieldValue('value_3')}</li>
                    <li>${getFieldValue('value_4')}</li>
                </ul>
                
                <h3 style="color: #8B1874;">Ideal Work Environment</h3>
                <p class="subtitle">Cultural and organizational conditions that bring out their best performance.</p>
                <ul>
                    <li>${getFieldValue('env_1')}</li>
                    <li>${getFieldValue('env_2')}</li>
                    <li>${getFieldValue('env_3')}</li>
                </ul>
            </div>
            ${createFooter()}
        </div>
        
        <div class="pdf-page page-break" style="${pageBackground}">
            ${createHeader()}
            <div style="padding: 40px 50px;">
                <div class="two-column">
                    <div>
                        <p>${getFieldValue('need_1')}</p>
                        <p>${getFieldValue('need_2')}</p>
                        <p>${getFieldValue('need_3')}</p>
                        <p>${getFieldValue('need_4')}</p>
                        <p>${getFieldValue('need_5')}</p>
                    </div>
                    <div>
                        <p>${getFieldValue('match_1')}</p>
                        <p>${getFieldValue('match_2')}</p>
                        <p>${getFieldValue('match_3')}</p>
                        <p>${getFieldValue('match_4')}</p>
                        <p>${getFieldValue('match_5')}</p>
                    </div>
                </div>
                
                <hr style="border-top: 2px solid #333; margin: 30px 0;">
                
                <h2 style="color: #8B1874;">Corporate DNA Alignment (Overall Summary)</h2>
                <p class="subtitle">How the candidate's natural strengths align with the company's culture.</p>
                <p><strong>Overall Alignment:</strong> ${getFieldValue('overall_alignment_descriptor')} — ${getFieldValue('overall_alignment_summary')}</p>
                <p><strong>Mission —</strong> ${getFieldValue('mission_descriptor')}: ${getFieldValue('mission_note')}</p>
                <p><strong>Vision —</strong> ${getFieldValue('vision_descriptor')}: ${getFieldValue('vision_note')}</p>
                <p><strong>Values —</strong> ${getFieldValue('values_descriptor')}: ${getFieldValue('values_note')}</p>
                <p><strong>Pillars —</strong> ${getFieldValue('pillars_descriptor')}: ${getFieldValue('pillars_note')}</p>
                
                <hr style="border-top: 2px solid #333; margin: 30px 0;">
                
                <h2 style="color: #8B1874;">Career Highlights</h2>
                <p class="subtitle">Key professional milestones and role achievements that illustrate the candidate's progression, impact, and leadership capacity.</p>
                <ul>
                    <li>${getFieldValue('career_1')}</li>
                    <li>${getFieldValue('career_2')}</li>
                    <li>${getFieldValue('career_3')}</li>
                    <li>${getFieldValue('career_4')}</li>
                    <li>${getFieldValue('career_5')}</li>
                </ul>
            </div>
            ${createFooter()}
        </div>
        
        <div class="pdf-page page-break" style="${pageBackground}">
            ${createHeader()}
            <div style="padding: 40px 50px;">
                <h2 style="color: #8B1874;">Growth & Integration Path</h2>
                <p class="subtitle">The candidate's growth direction, what fuels them, blind spots to navigate, and practices that support alignment.</p>
                <ul>
                    <li><strong>Growth Vector:</strong> ${getFieldValue('growth_vector')}</li>
                    <li><strong>Motivators:</strong> ${getFieldValue('growth_motivators')}</li>
                    <li><strong>Potential Blind Spots:</strong> ${getFieldValue('blind_spots')}</li>
                    <li><strong>Integration Practices:</strong> ${getFieldValue('practices')}</li>
                </ul>
                
                <hr style="border-top: 2px solid #333; margin: 30px 0;">
                
                <h2 style="color: #8B1874;">Public Records & Online Footprint</h2>
                <p class="subtitle">Summary of the candidate's professional presence and any publicly available records that may inform employer evaluation.</p>
                <ul>
                    <li>${getFieldValue('public_1')}</li>
                    <li>${getFieldValue('public_2')}</li>
                    <li>${getFieldValue('public_3')}</li>
                    <li>${getFieldValue('public_4')}</li>
                </ul>
                
                <h2 style="color: #8B1874;">Risk Assessment Summary</h2>
                <p>☑️ <strong>Reputation Risk:</strong> ${getFieldValue('risk_reputation_text')}</p>
                <p>⚠️ <strong>Professional Tone:</strong> ${getFieldValue('risk_tone_text')}</p>
                <p>☐ <strong>Content Risk:</strong> ${getFieldValue('risk_content_text')}</p>
                <p>✓ <strong>Background Red Flags:</strong> ${getFieldValue('risk_background_text')}</p>
                
                <p style="font-size: 12px; font-style: italic; margin-top: 20px;"><em>This risk assessment is based on publicly available information and proprietary analysis. Kinspire recommends that employers conduct independent verification prior to any hiring decision. Kinspire is not liable for outcomes resulting from incomplete vetting.</em></p>
            </div>
            ${createFooter()}
        </div>
        
        <div class="pdf-page" style="${pageBackground}">
            ${createHeader()}
            <div style="padding: 40px 50px;">
                <h2 style="color: #8B1874;">Leadership Style that Fuels Success</h2>
                <p class="subtitle">How the candidate naturally leaders and inspires others.</p>
                <p><strong>**Leadership Archetype:**</strong> ${getFieldValue('leadership_archetype')}</p>
                <ul>
                    <li>${getFieldValue('leadership_style_sentence')}</li>
                    <li>${getFieldValue('leadership_impact')}</li>
                    <li>${getFieldValue('leadership_distinction')}</li>
                </ul>
                
                <h2 style="color: #8B1874;">Behavioral & Communication Insights</h2>
                <p class="subtitle">How the candidate naturally connects, influences, and makes decisions.</p>
                <ul>
                    <li>${getFieldValue('behavior_1')}</li>
                    <li>${getFieldValue('behavior_2')}</li>
                    <li>${getFieldValue('behavior_3')}</li>
                    <li>${getFieldValue('behavior_4')}</li>
                    <li>${getFieldValue('behavior_5')}</li>
                </ul>
                
                <h2 style="color: #8B1874;">Predicted Assessment Profile</h2>
                <p class="subtitle">Based on observed behaviors, career trajectory, and leadership presence.</p>
                <p><strong>DISC:</strong> ${getFieldValue('disc')}</p>
                <p><strong>MBTI:</strong> ${getFieldValue('mbti')}</p>
                <p><strong>Enneagram:</strong> ${getFieldValue('enneagram')}</p>
                <p><strong>Culture Talk:</strong> ${getFieldValue('culture_talk')}</p>
                <p><strong>Culture Index:</strong> ${getFieldValue('culture_index')}</p>
                <p><strong>StrengthsFinder:</strong> ${getFieldValue('strengthsfinder')}</p>
            </div>
            ${createFooter()}
        </div>
    `;
    
    return preview;
}

// Create header HTML
function createHeader() {
    return `
        <div class="header" style="display: flex; justify-content: space-between; padding: 30px 50px; background: transparent;">
            <div class="logo" style="display: flex; align-items: center; gap: 10px;">
                <svg width="60" height="60" viewBox="0 0 120 80">
                    <circle cx="50" cy="35" r="8" fill="#8B1874"/>
                    <path d="M 50 43 L 45 55 L 42 70" stroke="#8B1874" stroke-width="4" fill="none"/>
                    <path d="M 50 43 L 55 55 L 60 68" stroke="#8B1874" stroke-width="4" fill="none"/>
                    <path d="M 50 43 L 48 55 L 35 62" stroke="#8B1874" stroke-width="4" fill="none"/>
                    <path d="M 35 62 L 25 58 L 20 50" stroke="#8B1874" stroke-width="4" fill="none"/>
                </svg>
                <span style="font-size: 32px; font-weight: bold;">inspire</span>
            </div>
            <div class="tagline" style="text-align: right;">
                <div style="font-size: 28px; font-weight: bold; color: #8B1874; line-height: 1.2;">GET<br>KINSPIRED.</div>
                <div style="font-size: 11px; letter-spacing: 1px;">WHERE KINSPIRED LEADERS THRIVE</div>
            </div>
        </div>
    `;
}

// Create footer HTML
function createFooter() {
    return `
        <div class="footer" style="position: relative; height: 180px; margin-top: 30px; overflow: hidden;">
            <!-- Left decorative shape - Dark purple abstract angular shape -->
            <div style="position: absolute; bottom: 0; left: 0; width: 130px; height: 180px;">
                <svg viewBox="0 0 150 200" preserveAspectRatio="xMinYMax meet" style="width: 100%; height: 100%;">
                    <path d="M0 200 L0 100 L25 70 L25 0 L50 0 L50 50 L35 80 L60 120 L85 200 L55 200 L35 150 L35 200 Z" fill="#3D1E33"/>
                    <path d="M65 200 L90 140 L115 200 Z" fill="#3D1E33"/>
                </svg>
            </div>
            <!-- Right decorative shape - Pink pac-man style circle -->
            <div style="position: absolute; bottom: 0; right: 0; width: 110px; height: 180px;">
                <svg viewBox="0 0 120 200" preserveAspectRatio="xMaxYMax meet" style="width: 100%; height: 100%;">
                    <path d="M120 130 A70 70 0 1 0 120 135 L60 130 L60 50 L120 50 Z" fill="#F5A3C7"/>
                </svg>
            </div>
            <!-- Contact info -->
            <div style="position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); text-align: left; z-index: 10; font-size: 12px;">
                <p style="margin: 5px 0; display: flex; align-items: center; gap: 8px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#4CAF50">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                    </svg>
                    +1.520.488.7277
                </p>
                <p style="margin: 5px 0; display: flex; align-items: center; gap: 8px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#EA4335">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    getkinspired@gmail.com
                </p>
            </div>
        </div>
    `;
}

// Helper function to get field value
function getFieldValue(fieldId) {
    const element = document.getElementById(fieldId);
    if (!element) return '';
    return element.value || `[[${fieldId.toUpperCase()}]]`;
}
