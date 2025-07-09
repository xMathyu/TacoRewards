# 🚀 TacoBot Deployment Guide

This guide will help you deploy TacoBot to production and configure it for your Discord server.

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- MongoDB database (local or cloud)
- Discord Application with Bot Token
- Cloud hosting platform (Railway, Heroku, DigitalOcean, etc.)

## 🤖 Discord Bot Setup

### 1. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section
4. Click "Add Bot"
5. Copy the bot token (keep this secret!)

### 2. Configure Bot Permissions

Required permissions:
- Send Messages
- Use Slash Commands
- Add Reactions
- Embed Links
- Read Message History

### 3. Generate Invite Link

1. Go to "OAuth2" > "URL Generator"
2. Select scopes: `bot` and `applications.commands`
3. Select the permissions listed above
4. Copy the generated URL and use it to invite the bot to your server

## 🗄️ Database Setup

### Option 1: MongoDB Atlas (Recommended)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Set up database user and password
4. Whitelist your IP address (or use 0.0.0.0/0 for anywhere)
5. Get the connection string

### Option 2: Local MongoDB

```bash
# Install MongoDB locally
# macOS with Homebrew
brew install mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb

# Start MongoDB service
sudo systemctl start mongod
```

Connection string: `mongodb://localhost:27017/tacobot`

## 🌐 Deployment Options

### Option 1: Railway (Recommended)

1. **Connect Repository**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway init
   railway up
   ```

2. **Set Environment Variables**
   ```
   DISCORD_TOKEN=your_bot_token_here
   DISCORD_CLIENT_ID=your_client_id_here
   MONGODB_URI=your_mongodb_connection_string
   NODE_ENV=production
   MAX_DAILY_TACOS=5
   ```

3. **Deploy Commands**
   ```bash
   # After deployment, register slash commands
   railway run npm run deploy-commands
   ```

### Option 2: Heroku

1. **Create Heroku App**
   ```bash
   # Install Heroku CLI
   npm install -g heroku
   
   # Login and create app
   heroku login
   heroku create your-tacobot-name
   ```

2. **Configure Environment**
   ```bash
   heroku config:set DISCORD_TOKEN=your_token
   heroku config:set DISCORD_CLIENT_ID=your_client_id
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set NODE_ENV=production
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Option 3: DigitalOcean/VPS

1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   sudo npm install -g pm2
   ```

2. **Deploy Application**
   ```bash
   # Clone repository
   git clone https://github.com/yourusername/tacobot-discord.git
   cd tacobot-discord
   
   # Install dependencies and build
   npm install
   npm run build
   
   # Set up environment variables
   cp .env.example .env
   # Edit .env with your configuration
   
   # Start with PM2
   pm2 start dist/index.js --name tacobot
   pm2 startup
   pm2 save
   ```

## ⚙️ Post-Deployment Configuration

### 1. Register Slash Commands

```bash
# Make sure your bot is deployed and running
npm run deploy-commands
```

### 2. Test the Bot

In your Discord server:
```
/give @someone 1 for being awesome!
/my-stats
/leaderboard
```

### 3. Configure Server Settings

Use the `/setup` command (admin only) to configure:
- Daily taco limits
- Achievement notifications
- Custom messages

## 📊 Monitoring and Maintenance

### Logging

TacoBot uses Winston for logging:
- Error logs: `logs/error.log`
- Combined logs: `logs/combined.log`
- Console output in development

### Health Checks

Monitor these endpoints/metrics:
- Bot uptime and responsiveness
- Database connection status
- Command execution success rates
- Memory and CPU usage

### Backup Strategy

**Database Backups:**
```bash
# MongoDB backup
mongodump --uri="your_mongodb_uri" --out=backup/$(date +%Y%m%d)
```

**Code Backups:**
- Use Git for version control
- Regular commits and tags
- Automated backups of configuration

## 🔧 Troubleshooting

### Common Issues

**Bot Not Responding:**
1. Check bot token is correct
2. Verify bot has proper permissions
3. Ensure slash commands are registered
4. Check application logs

**Database Connection Errors:**
1. Verify MongoDB URI is correct
2. Check IP whitelist (for Atlas)
3. Ensure database user has proper permissions
4. Test connection manually

**Permission Errors:**
1. Check bot role hierarchy
2. Verify channel permissions
3. Ensure bot has required permissions

### Debug Mode

Enable debug logging:
```bash
# Set environment variable
LOG_LEVEL=debug

# Or in .env file
LOG_LEVEL=debug
```

### Performance Issues

1. **Database Optimization:**
   - Add indexes for frequently queried fields
   - Implement connection pooling
   - Monitor query performance

2. **Memory Management:**
   - Monitor memory usage
   - Implement cleanup for old data
   - Use caching for frequently accessed data

## 🔄 Updates and Maintenance

### Regular Updates

1. **Update Dependencies:**
   ```bash
   npm update
   npm audit fix
   ```

2. **Bot Updates:**
   ```bash
   git pull origin main
   npm install
   npm run build
   pm2 restart tacobot
   ```

3. **Database Maintenance:**
   - Regular backups
   - Index optimization
   - Data cleanup for old records

### Version Management

Use semantic versioning:
- `1.0.0` - Major releases
- `1.1.0` - New features
- `1.1.1` - Bug fixes

## 📞 Support

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Search existing [GitHub issues](https://github.com/yourusername/tacobot-discord/issues)
3. Join our [Discord support server](https://discord.gg/your-invite)
4. Create a new issue with detailed information

---

🌮 Happy taco serving! Your community will love the positive vibes TacoBot brings!
