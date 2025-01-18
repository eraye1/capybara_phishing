# 🛡️ Capybara - AI-Powered Email Security

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/eraye1/capybara_phishing/actions/workflows/ci.yml/badge.svg)](https://github.com/eraye1/capybara_phishing/actions)
[![codecov](https://codecov.io/gh/eraye1/capybara_phishing/branch/main/graph/badge.svg)](https://codecov.io/gh/eraye1/capybara_phishing)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Feraye1%2Fcapybara_phishing.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Feraye1%2Fcapybara_phishing?ref=badge_shield)

Capybara: Browser-based Phishing Detection

> Just as the Catholic Church once classified capybaras as "fish" for Lent (despite them being decidedly not fish),
> our Chrome Extension and (soon-to-be-released) AI model helps users identify what is and isn't a phish.
>
> The capybara's historical misclassification makes it the perfect mascot for anti-phishing software!

<p align="center">
  <img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZHl5OTg3MnI0YTk2dmphZDdyODMyOXczdmNhczNtZ2xwdTA0MmtreiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l1Lc7PqTNURA4sR4k/giphy.gif" alt="Capybara" width="400"/>
</p>

Capybara is a Chrome extension that leverages advanced AI to protect users from phishing attempts and malicious emails in Gmail. By analyzing email content in real-time, it provides instant risk assessments and security recommendations.

## 🌟 Features

- 🤖 Advanced AI-powered email analysis using GPT-4
- 🔒 Privacy-focused with minimal data collection
- ⚡ Instant risk assessment for incoming emails
- 🎯 Context-aware analysis of business communication
- 🎨 Clean, unobtrusive UI integration with Gmail
- 📱 Responsive design that works across devices
- 🔐 Secure by design - your API key stays local
- 💻 Optional local LLM mode in production builds

## 📚 Documentation

- [Product Specification](docs/spec.md) - Detailed product requirements and specifications
- [ML Architecture](ml/ML.md) - Technical design document for the ML model
- [WebLLM Integration](docs/webllm_readme.md) - Guide for WebLLM integration and local inference

## 📋 Prerequisites

Common Requirements:

- Node.js (v18 or higher)
- Chrome Browser (v88 or higher)
- ImageMagick (for icon generation)

For OpenAI API Mode (Default):

- OpenAI API key
- Internet connection

For Local LLM Mode:

- NVIDIA GPU requirements:
  - Minimum: NVIDIA GPU with 6GB VRAM
  - Recommended: NVIDIA GPU with 8GB+ VRAM and CUDA support
  - Best Performance: NVIDIA RTX 3070 or better
- Chrome with WebGPU enabled
- Model compatibility varies by GPU:
  - Entry GPUs (6GB VRAM): Limited to heavily quantized models
  - Mid-range GPUs (8GB VRAM): Can run most quantized models
  - High-end GPUs (12GB+ VRAM): Can run larger, more accurate models
- Not all models will work on all GPUs due to:
  - VRAM limitations
  - Compute capabilities
  - Quantization requirements

> 🔬 **Coming Soon**: We're training a specialized SOTA model specifically for email security analysis. This model will:
>
> - Be optimized for phishing detection using a large corpus of real-world data
> - Require less VRAM through advanced quantization techniques
> - Provide better instruction following for security analysis
> - Offer improved accuracy while maintaining small size
> - Support more GPUs through various quantization options

## 🔐 Configuration

1. Copy the template configuration file:

   ```bash
   cp config.template.js config.js
   ```

2. Edit `config.js` with your settings:

   ```javascript
   export const CONFIG = {
     // OpenAI API mode:
     OPENAI_API_KEY: 'your-api-key-here',
     provider: 'openai', // This is the default
     model: 'gpt-4', // Primary model to use
     backupModel: 'gpt-3.5-turbo', // Fallback model for rate limits/overload

     // Or for WebLLM local mode:
     // provider: 'webllm',
     // model: 'SmolLM2-360M-Instruct-q4f16_1-MLC', // Local model to use
   };
   ```

   Available configuration options:

   - `provider`: Either 'openai' (default) or 'webllm'
   - `OPENAI_API_KEY`: Your OpenAI API key (required for OpenAI mode)
   - `model`: The primary model to use
     - For OpenAI: 'gpt-4' (default), 'gpt-3.5-turbo', etc.
     - For WebLLM: Model options depend on your GPU:
       - 6GB VRAM: 'Llama-3.2-3B-Instruct-q4f16_1-MLC' (heavily quantized, but we recommend using the latest MLC LLama model.)
   - `backupModel`: Fallback model for OpenAI mode when rate limited (defaults to 'gpt-3.5-turbo')

> ⚠️ **Local Model Note**: Model compatibility is highly dependent on your GPU's capabilities. Some models may fail to load or run slowly if your GPU doesn't meet the requirements. We recommend starting with the default model and adjusting based on your GPU's performance.

> ⚠️ IMPORTANT NOTE: This extension requires a production build to run (`npm run build`). Development mode is not supported due to Chrome's Content Security Policy restrictions. After any configuration changes, you'll need to rebuild the extension and refresh it in Chrome.

> ⚠️ SECURITY NOTE: Never commit your `config.js` file or share your API keys. The file is listed in `.gitignore` to prevent accidental commits.

For CI/CD pipelines, set the following secrets in your GitHub repository:

- `OPENAI_API_KEY`: Your OpenAI API key
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

Build and watch for changes:

```bash
npm run build
```

In Chrome:

1. Go to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `dist` directory
4. After making changes, run `npm run build` again
5. Click the refresh icon in Chrome's extension page

Run tests:

```bash
npm test
```

> Note: Due to Chrome's Content Security Policy restrictions and WebLLM's requirements, we can only run the extension from production builds. The development server (`npm run dev`) is not supported.

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

Generate test coverage report:

```bash
npm run coverage
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


[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Feraye1%2Fcapybara_phishing.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Feraye1%2Fcapybara_phishing?ref=badge_large)

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
     - Performance and compatibility depends on your GPU:
       - Higher-end GPUs: Better accuracy, more model options
       - Mid-range GPUs: Good balance with quantized models
       - Entry-level GPUs: Limited to smaller, quantized models
     - Model selection impacts:
       - Analysis accuracy
       - Processing speed
       - Memory usage
       - GPU compatibility

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