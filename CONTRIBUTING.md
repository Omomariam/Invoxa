# Contributing to Invoxa

Thank you for your interest in contributing to Invoxa! We welcome contributions from the community.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check the issue list to avoid duplicates.

**When reporting a bug, include:**
- Clear and descriptive title
- Detailed description of the behavior
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots or error logs
- Environment information (OS, Node version, wallet software)

### Suggesting Enhancements

We welcome feature suggestions. Please provide:
- Clear and descriptive title
- Detailed description of the feature
- Use cases and benefits
- Possible implementation approach

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit with clear messages (`git commit -m 'feat: add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

#### PR Guidelines

- Write clear, descriptive commit messages
- Include tests for new features
- Update documentation as needed
- Follow the existing code style
- Ensure all tests pass
- Link to related issues

### Development Guidelines

#### Code Style
- Use TypeScript for type safety
- Follow Prettier formatting (run `npm run format`)
- Use meaningful variable and function names
- Add comments for complex logic

#### Commit Messages
```
type(scope): subject

body

footer
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build, dependencies, etc.

**Example:**
```
feat(invoice): add QR code generation

Implement QR code generation for invoice sharing
Fixes #123
```

#### Testing

Before submitting a PR:

```bash
# Frontend
cd frontend
npm run lint
npm run build

# Contracts
cd contracts
npm run compile
npm run test
```

## Community Standards

### Be Respectful
- Be respectful and professional
- Consider different perspectives
- Help others learn and grow

### Quality Focus
- Write clean, maintainable code
- Provide thorough testing
- Document your changes
- Consider edge cases and error handling

### Security
- Never commit private keys or secrets
- Report security issues privately
- Follow security best practices

## Getting Help

- Check [DEVELOPMENT.md](./DEVELOPMENT.md) for setup instructions
- Review existing documentation
- Ask in GitHub Discussions or Issues
- Reach out to the maintainers

## License

By contributing to Invoxa, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Invoxa! 🙏
