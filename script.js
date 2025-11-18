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
    preview.style.background = 'white';
    
    // Page 1
    preview.innerHTML = `
        <div class="pdf-page">
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
        
        <div class="pdf-page page-break">
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
        
        <div class="pdf-page page-break">
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
        
        <div class="pdf-page page-break">
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
        
        <div class="pdf-page">
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
        <div class="header" style="display: flex; justify-content: space-between; padding: 30px 50px; border-bottom: 1px solid #e0e0e0;">
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
        <div class="footer" style="position: relative; height: 150px; margin-top: 30px;">
            <div style="position: absolute; bottom: 0; left: 0; width: 200px; height: 150px; background: #3D1E33; clip-path: polygon(0 100%, 100% 0, 100% 100%);"></div>
            <div style="position: absolute; bottom: 20px; right: 50px; width: 60px; height: 60px; border-radius: 50%; background: #E8B4D9;"></div>
            <div style="position: absolute; bottom: 30px; right: 20px; width: 0; height: 0; border-left: 80px solid transparent; border-bottom: 100px solid #E8B4D9; transform: rotate(-25deg);"></div>
            <div style="position: absolute; bottom: 30px; left: 50%; transform: translateX(-50%); text-align: center; z-index: 10; font-size: 12px;">
                <p>📞 +1.520.488.7277</p>
                <p>✉️ getkinspired@gmail.com</p>
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
