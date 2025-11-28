# Kinspire CoreHire™ AI-Powered Candidate Profile

An intelligent web application that uses **OpenAI GPT** to automatically analyze CVs and job descriptions, then auto-fills a complete Kinspire CoreHire™ Candidate Profile ready for PDF export.

---

## ✨ Features

- 🤖 **AI-Powered Analysis**: Upload a CV and job description, and GPT automatically fills out the entire profile
- 📄 **CV Text Extraction**: Supports PDF, DOC, DOCX, and TXT file formats
- 📝 **Smart Form Filling**: AI analyzes candidate skills, experience, and cultural fit
- 📎 **PDF Export**: Download professionally formatted PDFs matching the original Kinspire design
- 📎 **Word Export**: Export to Microsoft Word format
- 🔒 **Secure API Key Storage**: Your OpenAI API key stays in the `.env` file, never exposed to browsers

---

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
- **OpenAI API Key** - [Get one here](https://platform.openai.com/api-keys)

### Step 1: Install Dependencies

Open a terminal in this folder and run:

```bash
npm install
```

This installs the required packages (Express, OpenAI SDK, etc.)

### Step 2: Configure Your API Key

1. Open the `.env` file in this folder
2. Find this line:
   ```
   OPENAI_API_KEY=sk-your-api-key-here
   ```
3. Replace `sk-your-api-key-here` with your actual OpenAI API key:
   ```
   OPENAI_API_KEY=sk-proj-abc123...your-actual-key...
   ```
4. Save the file

> ⚠️ **Important**: Never share your `.env` file or commit it to version control. The `.gitignore` file is already configured to exclude it.

### Step 3: Start the Server

```bash
npm start
```

You should see:
```
🚀 ═══════════════════════════════════════════════════════
   KINSPIRE COREHIRE SERVER STARTED
═══════════════════════════════════════════════════════════

   🌐 Open in browser: http://localhost:3000

   ✅ OpenAI API key configured
   🤖 Using model: gpt-4o-mini
```

### Step 4: Open the Application

Open your browser and go to: **http://localhost:3000**

---

## 📋 How to Use the AI Analysis

### 1. Check Server Status

At the top of the page, you'll see a status indicator:
- ✅ **Green**: Server connected, API key configured - ready to use!
- ⚠️ **Orange**: Server connected but API key missing - edit `.env` file
- ❌ **Red**: Server not running - run `npm start`

### 2. Upload a CV

- Click the upload area or drag & drop a file
- Supported formats: **PDF** (recommended), DOC, DOCX, TXT
- The extracted text will appear in a preview box

### 3. Enter Job Description

Choose one of two methods:
- **Paste Full Description**: Copy/paste the entire job posting
- **Enter Key Details**: Fill in structured fields (title, company, requirements)

### 4. Analyze & Fill Profile

1. Click the **"🔍 Analyze & Fill Profile"** button
2. Wait 10-30 seconds while AI analyzes the data
3. Watch as all form fields are automatically filled
4. Review and edit any fields if needed

### 5. Export

- Click **"Export as PDF"** for a professional PDF document
- Click **"Export as Word"** for an editable Word document

---

## 📁 File Structure

```
mdea/
├── .env                 # Your API key (KEEP SECRET!)
├── .gitignore           # Prevents .env from being shared
├── package.json         # Node.js dependencies
├── server.js            # Backend server (handles AI requests)
├── ai-integration.js    # Frontend AI logic
├── index.html           # Main web page
├── styles.css           # Styling
├── script.js            # PDF/Word export functionality
└── README.md            # This file
```

---

## ⚙️ Configuration Options

Edit the `.env` file to customize:

```env
# Your OpenAI API key (required)
OPENAI_API_KEY=sk-your-api-key-here

# AI Model (optional)
# gpt-4o-mini = Faster, cheaper (~$0.001 per analysis)
# gpt-4o = More accurate, detailed (~$0.01 per analysis)
OPENAI_MODEL=gpt-4o-mini

# Server port (optional, default 3000)
PORT=3000
```

---

## 💰 API Costs

The application uses OpenAI's pay-per-use API:

| Model | Cost per Analysis | Quality |
|-------|------------------|---------|
| gpt-4o-mini | ~$0.001-0.005 | Good |
| gpt-4o | ~$0.01-0.03 | Excellent |

Most analyses cost less than 1 cent with gpt-4o-mini.

---

## 🔧 Troubleshooting

### "Server not running" error
- Make sure you ran `npm start` in the terminal
- Check that no other application is using port 3000

### "API key not configured" warning
- Open `.env` and add your real OpenAI API key
- Restart the server after editing `.env`

### "Invalid API key" error
- Verify your API key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Make sure you copied the entire key (starts with `sk-`)

### "Insufficient credits" error
- Add a payment method at [platform.openai.com/account/billing](https://platform.openai.com/account/billing)
- OpenAI requires prepaid credits

### CV text not extracting
- **PDF**: Should work automatically
- **DOC/DOCX**: Try converting to PDF first for best results
- **TXT**: Works directly

### PDF export looks different
- Use Google Chrome for best results
- Wait for all content to load before exporting

---

## 🔒 Security Notes

1. **API Key Protection**: Your API key is stored only in `.env` and read by the server. It never goes to the browser.

2. **Git Safety**: The `.gitignore` file prevents `.env` from being committed to version control.

3. **Local Processing**: CV text is sent to OpenAI for analysis but not stored anywhere permanently.

4. **No Data Collection**: This application doesn't collect or store any user data.

---

## 🛠️ Development

### Running in Development Mode
```bash
npm start
```

### Changing the Port
Edit `.env`:
```
PORT=8080
```

### Using a Different AI Model
Edit `.env`:
```
OPENAI_MODEL=gpt-4o
```

---

## 📞 Support

For issues or questions, contact:
- 📞 +1.520.488.7277
- ✉️ getkinspired@gmail.com

---

**Version**: 2.0 (AI-Powered)  
**Last Updated**: November 2025  
**Created for**: Kinspire CoreHire™ Candidate Profiling
