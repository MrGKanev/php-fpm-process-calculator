# PHP-FPM Process Calculator - Claude Context

## Project Overview
A web-based calculator tool for optimizing PHP-FPM pool settings and Nginx configurations. Helps users calculate optimal `pm.max_children`, `pm.start_servers`, and other PHP-FPM settings based on their server's available RAM.

## Tech Stack
- **Frontend**: Pure HTML, CSS (Tailwind-like utility classes), Vanilla JavaScript
- **Styling**: Utility-first CSS with dark mode support
- **Deployment**: GitHub Pages via GitHub Actions
- **No Build Process**: Static files served directly

## File Structure
```
/
├── index.html              # Main calculator application (46KB optimized)
├── assets/
│   ├── style.min.css      # Minified styles
│   ├── script.js          # Calculator logic
│   ├── favicon.svg        # Site favicon
│   └── icon.svg           # App icons
├── .github/
│   └── workflows/
│       └── static.yml     # GitHub Pages deployment workflow
├── .claude/               # Claude AI context and configuration
├── readme.md              # Project documentation
└── package.json           # NPM configuration (for linting/formatting)
```

## Key Features
1. **Multi-Pool Management**: Users can create and manage multiple PHP-FPM pools
2. **Real-time Calculations**: Instant feedback as users adjust sliders
3. **Dark Mode**: Full dark mode support with system preference detection
4. **Export/Import**: Save and load pool configurations as JSON
5. **Advanced Metrics**: Memory leak impact and burst capacity calculations
6. **Mobile-First**: Responsive design for all screen sizes
7. **Accessibility**: ARIA labels, skip links, keyboard navigation

## Calculator Logic
- **Available RAM** = Total RAM - Reserved RAM - (Buffer % of Total RAM)
- **Max Children** = Available RAM (MB) / Process Size (MB)
- **Start Servers** = Max Children / 4
- **Min Spare** = Max Children / 8
- **Max Spare** = Max Children / 2

## Recent Optimizations (2025-11-25)
1. **HTML Minification**: Reduced index.html from 48KB to 46KB (3.5% reduction)
   - Minified inline SVG icons (dark mode toggle, warning icon, copy button, FAQ arrows)
   - Removed duplicate comments and empty lines
   - Consolidated whitespace
2. **Dark Mode Improvements**: Added missing dark mode classes to form inputs
3. **GitHub Actions Fix**: Updated action versions
   - `actions/configure-pages@v5` (was v6)
   - `actions/deploy-pages@v4` (was v5)
   - `actions/upload-pages-artifact@v3` (was v4)

## Development Guidelines

### Code Style
- Use semantic HTML5 elements
- Maintain accessibility (ARIA labels, alt text, keyboard navigation)
- Follow mobile-first responsive design patterns
- Keep JavaScript vanilla (no frameworks)
- Minify SVGs inline for better performance

### Performance Considerations
- Keep index.html under 50KB for fast loading
- Minimize external dependencies
- Use CSS utility classes for consistency
- Lazy-load non-critical resources
- Optimize SVG markup (no xmlns for inline SVGs)

### Testing Checklist
- [ ] Calculator produces accurate results for various RAM configurations
- [ ] Dark mode toggles correctly and persists
- [ ] Export/Import functionality works with valid JSON
- [ ] Mobile responsiveness (320px to 4K screens)
- [ ] FAQ accordion expands/collapses smoothly
- [ ] Copy to clipboard functionality works
- [ ] All external links open in new tabs with security attributes

### Security Headers
The application includes comprehensive security headers:
- Content Security Policy (CSP)
- X-Frame-Options (DENY)
- X-Content-Type-Options (nosniff)
- Referrer-Policy
- Permissions-Policy

### SEO Optimizations
- Meta descriptions and keywords
- Open Graph tags for social sharing
- Twitter Card metadata
- Canonical URL
- Structured data ready
- robots.txt and sitemap.xml

## Common Tasks

### Updating Calculator Logic
Edit `/assets/script.js` and look for calculation functions:
- `calculatePoolSettings()`
- `updateResults()`
- `validateInputs()`

### Adding New FAQ Items
Add to the FAQ accordion section in `index.html` (around line 387-665)
Use the existing FAQ item structure with minified SVG arrow.

### Modifying Styles
Edit `/assets/style.min.css` or add inline utility classes following the existing pattern.

### Deployment
Changes pushed to `master` branch automatically deploy via GitHub Actions.
Workflow file: `.github/workflows/static.yml`

## Useful Links
- [PHP-FPM Documentation](https://www.php.net/manual/en/install.fpm.configuration.php)
- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Tailwind CSS](https://tailwindcss.com/) (for utility class reference)

## Known Issues / Future Enhancements
- Consider adding server load simulation
- Add OPcache and realpath_cache calculators
- Implement configuration history/versioning
- Add more preset configurations for common frameworks
- Create downloadable PHP-FPM config files

## Contact
- **Author**: Gabriel Kanev
- **GitHub**: [@MrGKanev](https://github.com/MrGKanev)
- **Website**: [gkanev.com](https://gkanev.com)
