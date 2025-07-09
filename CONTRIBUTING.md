# 🌮 TacoBot Discord - Contributing Guide

Thank you for your interest in contributing to TacoBot! We're excited to have you help make this bot even more awesome! 🎉

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- MongoDB (local or cloud)
- Discord Bot Token
- Git

### Setup Development Environment

1. **Fork and Clone**
```bash
git clone https://github.com/yourusername/tacobot-discord.git
cd tacobot-discord
```

2. **Install Dependencies**
```bash
npm install
```

3. **Set Up Environment**
```bash
cp .env.example .env
# Edit .env with your Discord bot token and MongoDB URI
```

4. **Start Development Server**
```bash
npm run dev
```

## 📝 Development Guidelines

### Code Style
- We use TypeScript with strict type checking
- ESLint and Prettier for code formatting
- Follow existing naming conventions
- Write clear, descriptive comments

### Commit Message Format
```
type(scope): description

feat(commands): add new taco history command
fix(database): resolve connection timeout issue
docs(readme): update installation instructions
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Branch Naming
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical fixes
- `docs/description` - Documentation updates

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Writing Tests
- Write unit tests for all new functions
- Test both success and error cases
- Mock external dependencies
- Aim for >80% coverage

Example test:
```typescript
describe('TacoService', () => {
  it('should give tacos successfully', async () => {
    const tacoService = new TacoService();
    const result = await tacoService.giveTacos({
      giverId: 'user1',
      receiverId: 'user2',
      guildId: 'guild1',
      amount: 3,
      reason: 'Being awesome!'
    });
    
    expect(result.amount).toBe(3);
    expect(result.reason).toBe('Being awesome!');
  });
});
```

## 📂 Project Structure

```
src/
├── commands/          # Slash commands organized by category
│   ├── taco/         # Taco-related commands
│   ├── stats/        # Statistics commands
│   └── admin/        # Admin commands
├── events/           # Discord event handlers
├── services/         # Business logic services
├── database/         # Database models and connection
│   └── models/       # Mongoose schemas
├── utils/            # Utility functions
├── types/            # TypeScript type definitions
└── test/             # Test files
```

## 🆕 Adding New Features

### Adding a New Command

1. **Create Command File**
```typescript
// src/commands/category/command-name.ts
import { SlashCommandBuilder, CommandInteraction, Client } from 'discord.js';
import type { Command } from '@/types/command';

const myCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('my-command')
    .setDescription('Description of what this command does'),
    
  async execute(interaction: CommandInteraction, client: Client): Promise<void> {
    // Command logic here
  },
};

export default myCommand;
```

2. **Add Tests**
```typescript
// src/commands/category/__tests__/command-name.test.ts
import myCommand from '../command-name';

describe('MyCommand', () => {
  it('should execute successfully', async () => {
    // Test implementation
  });
});
```

### Adding a New Service

1. **Create Service Class**
```typescript
// src/services/MyService.ts
export class MyService {
  async doSomething(): Promise<void> {
    // Service logic
  }
}
```

2. **Add Service Tests**
```typescript
// src/services/__tests__/MyService.test.ts
import { MyService } from '../MyService';

describe('MyService', () => {
  it('should do something correctly', async () => {
    // Test implementation
  });
});
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Clear Description**: What happened vs. what you expected
2. **Steps to Reproduce**: Detailed steps to recreate the issue
3. **Environment**: Node.js version, OS, etc.
4. **Screenshots**: If applicable
5. **Logs**: Any error messages or relevant log output

Use our bug report template in GitHub Issues.

## 💡 Feature Requests

For new features:

1. **Check Existing Issues**: Avoid duplicates
2. **Clear Use Case**: Explain why this feature would be valuable
3. **Implementation Ideas**: If you have thoughts on how to implement
4. **Mockups**: Visual examples if applicable

## 📋 Pull Request Process

1. **Create Feature Branch**
```bash
git checkout -b feature/amazing-new-feature
```

2. **Make Changes**
- Follow code style guidelines
- Add tests for new functionality
- Update documentation if needed

3. **Test Everything**
```bash
npm run lint
npm run test
npm run build
```

4. **Commit Changes**
```bash
git commit -m "feat(commands): add amazing new feature"
```

5. **Push and Create PR**
```bash
git push origin feature/amazing-new-feature
```

6. **PR Requirements**
- [ ] Tests pass
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
- [ ] Descriptive PR title and description

## 🏆 Recognition

Contributors will be:
- Added to the CONTRIBUTORS.md file
- Mentioned in release notes for significant contributions
- Given the "Contributor" role in our Discord server

## 📞 Getting Help

- **Discord**: Join our [support server](https://discord.gg/your-invite)
- **GitHub Issues**: For bugs and feature requests
- **Email**: dev@tacobot.example.com

## 📜 Code of Conduct

- Be respectful and inclusive
- Help others learn and grow
- Give constructive feedback
- Have fun building awesome things! 🌮

---

Thank you for contributing to TacoBot! Every taco makes the community better! 🌮💕
