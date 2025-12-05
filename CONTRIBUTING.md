# Contributing Guide

Thank you for your interest in contributing to the Pharmacy E-commerce Platform!

## Development Setup

1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/yourusername/pharma.git
cd pharma
```

3. Install dependencies:
```bash
npm run install:all
```

4. Set up environment variables:
   - Copy `.env.example` to `.env` in both `client` and `server` directories
   - Fill in your configuration values

5. Start development servers:
```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:client
```

## Code Style

- Use ES6+ JavaScript features
- Follow existing code patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## Commit Messages

Use clear, descriptive commit messages:
```
feat: Add product search functionality
fix: Resolve cart update issue
docs: Update deployment guide
refactor: Improve payment service structure
```

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Update documentation if needed
5. Submit a pull request with a clear description

## Testing

Before submitting:
- Test all affected features
- Check for console errors
- Verify responsive design
- Test on different browsers

## Questions?

Open an issue for questions or discussions.

