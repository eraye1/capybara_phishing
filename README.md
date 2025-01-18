# 🛡️ Capybara - AI-Powered Email Security

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/eraye1/capybara_phishing/actions/workflows/ci.yml/badge.svg)](https://github.com/eraye1/capybara_phishing/actions)
[![codecov](https://codecov.io/gh/eraye1/capybara_phishing/branch/main/graph/badge.svg)](https://codecov.io/gh/eraye1/capybara_phishing)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

Capybara is a Chrome extension that leverages advanced AI to protect users from phishing attempts and malicious emails in Gmail. By analyzing email content in real-time, it provides instant risk assessments and security recommendations.

## 🌟 Features

- 🤖 Advanced AI-powered email analysis using GPT-4
- 🔒 Privacy-focused with minimal data collection
- ⚡ Instant risk assessment for incoming emails
- 🎯 Context-aware analysis of business communication
- 🎨 Clean, unobtrusive UI integration with Gmail
- 📱 Responsive design that works across devices
- 🔐 Secure by design - your API key stays local
- 💻 Optional local LLM mode using WebLLM (reduced accuracy)

## 📋 Prerequisites

- Node.js (v18 or higher)
- Chrome Browser (v88 or higher)
- ImageMagick (for icon generation)
- OpenAI API key for AI analysis

## 🔐 Configuration

1. Copy the template configuration file:

   ```bash
   cp config.template.js config.js
   ```

2. Edit `config.js` with your settings:

   ```javascript
   export const CONFIG = {
     // For OpenAI API mode (default, recommended):
     OPENAI_API_KEY: 'your-api-key-here',

     // To use local LLM mode instead:
     provider: 'webllm', // Change to 'openai' for API mode
     // Note: Local mode requires a GPU and has reduced accuracy
   };
   ```

> ⚠️ SECURITY NOTE: Never commit your `config.js` file or share your API keys. The file is listed in `.gitignore` to prevent accidental commits.

For CI/CD pipelines, set the following secrets in your GitHub repository:

- `OPENAI_API_KEY`: Your OpenAI API key (not needed if using local LLM mode)
- `CODECOV_TOKEN`: Your Codecov token

## 🚀 Quick Start

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/capybara.git
   cd capybara
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up configuration (see Configuration section above)

4. Generate extension icons:

   ```bash
   ./create_icons.sh
   ```

5. Build the extension:

   ```bash
   npm run build
   ```

6. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` directory

## 🛠️ Development

Start the development server with hot reload:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Generate test coverage report:

```bash
npm run coverage
```

## 🧪 Testing

We maintain high test coverage and quality standards:

- Unit tests using Jest
- Integration tests for Chrome API interactions
- End-to-end tests for Gmail integration
- Coverage thresholds: 95% statements, 90% branches

Run the full test suite:

```bash
npm run test:all
```

## 🏗️ Architecture

The extension is built with a modular architecture:

- `src/content/` - Gmail integration and UI components
- `src/background/` - Chrome extension background scripts
- `src/ml/` - Machine learning model integration
- `src/utils/` - Shared utilities and helpers

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details. Key points:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Privacy & Security

Capybara is designed with privacy and security in mind:

- Two operation modes:

  1. OpenAI API Mode (Default, Recommended):
     - Email content is sent to OpenAI's API for analysis
     - The following data is sent:
       - Email subject
       - Email body content
       - Attachment names and types (but not the files themselves)
     - The data is sent as part of a structured prompt that asks for phishing analysis
     - All API calls use encrypted HTTPS
     - Your OpenAI API key is stored locally and never shared
  2. Local LLM Mode (Privacy-Focused):
     - Uses WebLLM to run a smaller model locally on your GPU
     - No data leaves your computer
     - Significantly reduced accuracy and performance
     - Higher system requirements
     - Limited to simpler analysis patterns

- No data persistence
  - Analysis results are shown in the UI but not stored
  - No tracking or analytics
  - No user behavior monitoring
- Local processing where possible
  - UI rendering and DOM manipulation happen locally
  - Email parsing is done in the browser
  - Results caching is temporary and in-memory only

### Data Flow

1. When an email is opened, the extension extracts:
   - Subject line
   - Email body content
   - List of attachments (names and types only)
2. This content is analyzed either:
   - By OpenAI's GPT-4 API (default mode) with a prompt that asks for:
     - Phishing risk assessment
     - Analysis of business communication patterns
     - Evaluation of attachments risk
     - Context-aware false positive reduction
   - OR by WebLLM locally (if configured) with a simpler analysis model
3. The API/local model returns a structured analysis with risk levels and explanations
4. The assessment is displayed in the UI
5. All data is cleared from memory when you close the email

> ⚠️ Note: While we take security seriously, using this extension means either trusting OpenAI with your email content (in default mode) or accepting reduced accuracy with local processing (in WebLLM mode). Please review OpenAI's privacy policy and make an informed decision. If you handle sensitive information, consider using the local LLM mode despite its limitations.

## 🙋 Support

- 📫 For bugs and features, open an issue
- 💬 For questions, start a discussion
- 🤝 For contributing, see CONTRIBUTING.md

## ⭐ Show Your Support

If you find this project useful, please consider giving it a star on GitHub!

## 🙏 Acknowledgments

- [WebLLM](https://github.com/mlc-ai/web-llm) for the local ML processing
- All our amazing contributors
- The open-source community

---

Made with ❤️ by the Capybara team
