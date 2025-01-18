# 🛡️ Capybara - AI-Powered Email Security

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://github.com/yourusername/capybara/actions/workflows/tests.yml/badge.svg)](https://github.com/yourusername/capybara/actions)
[![Coverage Status](https://coveralls.io/repos/github/yourusername/capybara/badge.svg?branch=main)](https://coveralls.io/github/yourusername/capybara?branch=main)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

Capybara is a Chrome extension that leverages advanced AI to protect users from phishing attempts and malicious emails in Gmail. By analyzing email content in real-time, it provides instant risk assessments and security recommendations.

## 🌟 Features

- 🤖 Real-time AI-powered email analysis
- 🔒 Privacy-focused design with local processing
- ⚡ Instant risk assessment for incoming emails
- 🎨 Clean, unobtrusive UI integration with Gmail
- 📱 Responsive design that works across devices
- 🔐 Zero data collection - all processing happens locally

## 📋 Prerequisites

- Node.js (v18 or higher)
- Chrome Browser (v88 or higher)
- ImageMagick (for icon generation)

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

3. Generate extension icons:

   ```bash
   ./create_icons.sh
   ```

4. Build the extension:

   ```bash
   npm run build
   ```

5. Load the extension in Chrome:
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

## 🔒 Privacy

Capybara is designed with privacy in mind:

- No data collection
- All processing happens locally
- No external API calls
- No tracking or analytics

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
