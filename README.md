# Kinspire CoreHire™ Candidate Profile Form

A web-based form application that allows you to fill out a Kinspire CoreHire™ Candidate Profile and export it as PDF or Word document with the exact same design as the original template.

## Features

- ✅ **Exact Design Match**: Recreates the Kinspire CoreHire™ document design with precise colors, fonts, and layout
- 📝 **Interactive Form**: Fill in all bracketed fields with a user-friendly web interface
- 📄 **PDF Export**: Download a professionally formatted PDF with your filled-in data
- 📎 **Word Export**: Download a Microsoft Word document (.docx) with your data
- 🎨 **Brand Consistent**: Maintains all original branding elements including logo, colors, and geometric designs

## How to Use

### 1. Open the Application

Simply open the `index.html` file in your web browser:
- Double-click on `index.html`, or
- Right-click and select "Open with" → Your preferred browser (Chrome, Firefox, Edge, etc.)

### 2. Fill Out the Form

The form includes all fields from the original document with brackets `[[FIELD_NAME]]`. Fill in each field:

**Page 1 - Candidate Overview:**
- Full Name
- Headline/Tagline
- Job Position (Company & Role Title)
- Potential for Success
- Opening Narrative
- Success Factors (3 items)
- Support Needs (2 items)

**Page 2 - Candidate Portrait:**
- Signature Skills & Superpowers (5 items)
- Motivators & Values (4 items)
- Ideal Work Environment (3 items)

**Page 3 - Alignment & DNA:**
- Strategic Needs (5 items)
- Matching Strengths (5 items)
- Corporate DNA Alignment details
- Career Highlights (5 items)

**Page 4 - Growth & Risk:**
- Growth Vector, Motivators, Blind Spots, Integration Practices
- Public Records & Online Footprint (4 items)
- Risk Assessment Summary (4 checkboxes with descriptions)

**Page 5 - Leadership & Assessment:**
- Leadership Archetype and Style (3 items)
- Behavioral & Communication Insights (5 items)
- Predicted Assessment Profile (DISC, MBTI, Enneagram, etc.)

### 3. Export Your Document

Once you've filled out all the necessary fields:

**For PDF Export:**
1. Click the **"Export as PDF"** button at the bottom of the form
2. Wait for the generation process to complete
3. The PDF will automatically download to your default downloads folder
4. Filename format: `Kinspire_CoreHire_[Candidate Name].pdf`

**For Word Export:**
1. Click the **"Export as Word"** button at the bottom of the form
2. The Word document will automatically download
3. Filename format: `Kinspire_CoreHire_[Candidate Name].docx`

## Design Elements

The application preserves all original design elements:

- **Colors**: 
  - Primary Purple: `#8B1874`
  - Accent Pink: `#E8B4D9`
  - Dark Purple: `#3D1E33`

- **Typography**: Professional sans-serif fonts matching the original

- **Layout**: 
  - Header with Kinspire logo and "GET KINSPIRED" tagline
  - Structured sections with proper spacing
  - Footer with geometric design elements

- **Branding**: 
  - Original Kinspire logo (stick figure design)
  - Contact information footer
  - Professional dividers and section breaks

## Technical Details

### Technologies Used

- **HTML5**: Semantic structure
- **CSS3**: Styling and layout
- **JavaScript (ES6+)**: Interactive functionality
- **jsPDF**: PDF generation
- **html2canvas**: HTML to canvas conversion for PDF
- **html-docx-js**: Word document generation

### Browser Compatibility

The application works best in modern browsers:
- ✅ Google Chrome (recommended)
- ✅ Mozilla Firefox
- ✅ Microsoft Edge
- ✅ Safari

### File Structure

```
mdea/
├── index.html       # Main HTML form
├── styles.css       # Styling and design
├── script.js        # JavaScript functionality
└── README.md        # This file
```

## Tips for Best Results

1. **Fill All Fields**: For the best-looking output, fill in all fields before exporting
2. **Review Before Export**: Double-check all entries for accuracy
3. **Use Descriptive Text**: The more detailed your entries, the more professional the output
4. **Check Your Browser**: Use a modern, updated browser for best compatibility
5. **Save Your Work**: The form doesn't automatically save, so keep your source data elsewhere if needed

## Troubleshooting

**PDF generation is slow:**
- This is normal for multi-page documents. Wait for the "Generating PDF..." message to complete.

**Word document doesn't look right:**
- Open the .docx file in Microsoft Word for best results
- Some formatting may vary in other word processors

**Export button is disabled:**
- Wait for any current export to complete
- Refresh the page if the button stays disabled

**Missing images in export:**
- Ensure you have an internet connection (for loading external libraries)
- Check that JavaScript is enabled in your browser

## Support

For issues or questions, contact:
- 📞 +1.520.488.7277
- ✉️ getkinspired@gmail.com

---

**Version**: 1.0  
**Last Updated**: 2024  
**Created for**: Kinspire CoreHire™ Candidate Profiling
