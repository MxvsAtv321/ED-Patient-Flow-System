# WaitWell

Transform Emergency Department waiting into a more bearable experience through accessible real-time information and AI-powered support.

## 🌟 Core Features

### Instant Status Display
- Scan wristband QR code to view status on any display
- No app downloads or account creation needed
- Works on hospital displays and personal devices
- Fully accessible design with screen reader support
- Multi-language support with automatic detection

### Smart AI Assistant
- Real-time updates about wait times and status
- Plain language explanations of medical terms
- Guidance on what to expect next
- Basic assistance requests (water, blankets, etc.)
- Available in multiple languages with voice interface

### Patient Comfort
- Nearby amenities information
- Accessibility assistance options
- Cultural and religious accommodation info

## 🛠 Technical Stack

### Frontend
- React with ShadcnUI
- WebSocket for real-time updates
- Responsive design for all screen sizes
- High contrast, accessible interface
- QR code scanning capability

### Backend
- Flask API
- Redis for caching
- OpenAI integration
- WebSocket server
- IFEM API integration

## 🔒 Privacy & Security
- No personal health information stored
- Temporary session tokens
- HIPAA-compliant
- Automatic session expiry
- Privacy-first design

## 🎯 Why WaitWell?

Emergency departments are stressful environments where waiting is inevitable. WaitWell makes this experience more bearable by:
- Providing clear, accessible information
- Reducing uncertainty and anxiety
- Supporting basic comfort needs
- Respecting privacy and dignity
- Working for everyone, regardless of tech-savviness

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.8+
- Redis

### Installation
1. Clone the repository
```bash
git clone https://github.com/yourusername/waitwell.git
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Install backend dependencies using `poetry`
```bash
cd backend
poetry install
```

4. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Run development servers
```bash
# Frontend
npm run dev

# Backend
bash scripts/run.sh```

## 📈 Success Metrics
- Reduction in status inquiries
- Patient satisfaction scores
- Staff time saved
- Usage statistics
- Chat interaction quality
- Family satisfaction ratings

## 🤝 Contributing
We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments
- IFEM Emergency Department for the challenge
- OpenAI for AI capabilities
- All contributors and supporters

---
Built with ❤️ for Emergency Department patients everywhere
