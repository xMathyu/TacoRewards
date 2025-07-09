# 🌮 TacoRewards - TacoBot Discord

A fun and engaging Discord bot that brings peer-to-peer recognition and rewards to Discord servers, similar to HeyTaco for Slack.

## ✨ Features

- 🌮 **Taco Giving System**: Give tacos to recognize team members
- 📊 **Leaderboards**: Track top contributors and givers
- 🏆 **Achievement System**: Unlock badges and milestones
- 📈 **Personal Stats**: Individual progress tracking
- ⚙️ **Admin Controls**: Server customization and management
- 🎨 **Rich UI**: Beautiful embeds with emojis and formatting

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- MongoDB database
- Discord Bot Token

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/tacobot-discord.git
cd tacobot-discord
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Build and start the bot
```bash
npm run build
npm start
```

### Development

```bash
# Start in development mode with hot reload
npm run dev

# Run tests
npm test

# Lint and format code
npm run lint
npm run format
```

## 📋 Commands

### User Commands
- `/taco @user [amount] [reason]` - Give tacos to a user
- `/my-stats` - View your taco statistics
- `/leaderboard` - View server leaderboards
- `/achievements` - View your achievements

### Admin Commands
- `/setup` - Initial bot configuration
- `/config` - Modify bot settings
- `/admin-stats` - View server analytics

## 🔧 Configuration

The bot can be configured through environment variables:

```env
DISCORD_TOKEN=your_bot_token_here
MONGODB_URI=mongodb://localhost:27017/tacobot
PREFIX=!
MAX_DAILY_TACOS=5
ENABLE_ACHIEVEMENTS=true
LOG_LEVEL=info
```

## 🏗️ Project Structure

```
src/
├── commands/           # Slash commands
├── events/            # Discord event handlers
├── database/          # Database models and connections
├── services/          # Business logic services
├── utils/             # Utility functions
├── types/             # TypeScript type definitions
└── index.ts           # Main entry point
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📖 Documentation

- [PRD (Product Requirements Document)](./PRD.md)
- [API Documentation](./docs/API.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by HeyTaco for Slack
- Built with Discord.js
- Community feedback and contributions

## 📞 Support

- Discord: [Join our support server](https://discord.gg/your-invite)
- Issues: [GitHub Issues](https://github.com/yourusername/tacobot-discord/issues)
- Email: support@tacobot.example.com

---

Made with 💖 and 🌮 by the TacoBot team
