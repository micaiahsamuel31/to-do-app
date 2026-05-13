# Mend Frontend

A modern, responsive web application built with **React** and **Vite**, featuring a JavaScript-heavy codebase paired with Python backend services.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Python 3.8+ (for backend services)

### Installation

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The development server will start at `http://localhost:5173` with Hot Module Replacement (HMR) enabled for a smooth development experience.

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 📋 Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API service layer
│   ├── utils/          # Utility functions
│   ├── assets/         # Images, fonts, and static files
│   ├── styles/         # Global CSS and styling
│   ├── App.jsx         # Main App component
│   └── main.jsx        # Entry point
├── public/             # Static assets served as-is
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
├── eslint.config.js    # ESLint configuration
└── README.md           # This file
```

## 📊 Technology Stack & Language Composition

### Language Distribution
- **JavaScript: 65.7%** - React components, utilities, and core frontend logic
- **Python: 33.8%** - Backend APIs and services
- **HTML: 0.5%** - Static markup
- **CSS** - Integrated with JavaScript for styling

### Core Technologies

#### Frontend Framework
- **React 18+** - Component-based UI library with hooks
- **Vite** - Next-generation frontend build tool with lightning-fast HMR
- **JavaScript (ES6+)** - Modern JavaScript with async/await, destructuring, modules

#### Styling
- **CSS3** - Component styling and responsive design
- **CSS Modules** - Optional scoped styling approach
- **Responsive Design** - Mobile-first CSS patterns

#### Backend Integration
- **Python APIs** - RESTful services for data and business logic
- **Fetch API / Axios** - HTTP client for API communication

#### Development Tools
- **ESLint** - Code quality and consistency enforcement
- **Vite HMR** - Hot Module Replacement for instant updates
- **React DevTools** - Browser debugging extension
- **React Compiler** - Optimized component compilation

### Build Plugins
- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) - Uses [Oxc](https://oxc.rs) for React support
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) - Alternative using [SWC](https://swc.rs/)

## 🎨 Styling Guide

**JavaScript comprises 65.7%** of the frontend, making it the dominant language. Styling is achieved through:

```bash
# CSS organization
src/styles/
├── global.css        # Global resets and base styles
├── variables.css     # CSS variables and theme definitions
├── components/       # Component-specific stylesheets
└── utilities.css     # Utility classes and helpers
```

### CSS Best Practices

- Clean, maintainable stylesheets
- Responsive design patterns (mobile-first)
- CSS variables for theming and consistency
- Component-scoped styling where applicable
- Performance-optimized production builds

## 🚀 Features

- ⚡ **Fast Development** - Instant HMR feedback with Vite
- 📱 **Responsive Design** - Mobile-first CSS approach
- ♿ **Accessible** - Built with accessibility best practices
- 🔒 **Security** - Secure component architecture and API integration
- 🎯 **Performance** - Optimized production builds with tree-shaking
- 🔄 **Hot Module Replacement** - Update code without losing application state
- 🐍 **Backend Integration** - Seamless Python API communication

## 📖 Available Scripts

```bash
# Start development server with HMR
npm run dev

# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview

# Lint code with ESLint
npm run lint

# Format code (if configured)
npm run format

# Run tests (if configured)
npm run test
```

## 🔧 Configuration

### Vite Configuration
Edit `vite.config.js` to customize:
- Build behavior and output
- Environment variables
- Plugin settings
- Dev server options

### ESLint Configuration
The project includes ESLint rules for code quality. For production applications, consider enabling TypeScript with type-aware lint rules. See `eslint.config.js`.

### Environment Variables
Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
VITE_ENV=development
VITE_APP_TITLE=Mend
VITE_DEBUG=false
```

Access in code using: `import.meta.env.VITE_API_URL`

## 🌐 Backend Integration

The frontend communicates with the **Python backend** (33.8% of codebase). Ensure proper setup:

1. Backend API is running and accessible
2. CORS is properly configured on the backend
3. API endpoints are correctly configured in environment variables

### Example API Integration

```javascript
// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL;

export async function fetchData(endpoint) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

## 📦 Dependencies Management

View all dependencies:
```bash
npm list
```

Update dependencies:
```bash
npm update
```

Check for outdated packages:
```bash
npm outdated
```

Add new package:
```bash
npm install package-name
```

## 🧪 Testing (Optional Setup)

To add testing capabilities:

```bash
# Install testing libraries
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

# Create test file
touch src/components/MyComponent.test.jsx

# Run tests
npm run test
```

## 📝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and follow code style (ESLint)
3. Run linter: `npm run lint`
4. Test your changes: `npm run test` (if applicable)
5. Commit changes: `git commit -am 'Add new feature'`
6. Push to branch: `git push origin feature/your-feature`
7. Open a Pull Request with detailed description

## 🐛 Troubleshooting

### Port 5173 already in use
```bash
npm run dev -- --port 5174
```

### Module not found errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### HMR not working
- Ensure `vite.config.js` has proper HMR configuration
- Check firewall settings for WebSocket connections
- Restart the dev server

### API connection errors
- Verify Python backend is running
- Check CORS configuration on backend
- Validate `VITE_API_URL` environment variable
- Review browser console for detailed error messages

### Build errors
```bash
# Clear Vite cache
rm -rf .vite dist
npm run build
```

## 📚 Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [JavaScript MDN Reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [CSS3 Guide](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [React Compiler Guide](https://react.dev/learn/react-compiler)
- [Vite Plugin React](https://github.com/vitejs/vite-plugin-react)

## 📄 License

This project is part of the Mend application. Please refer to the main repository's LICENSE file for details.

## 👥 Support

For issues or questions:
1. Check existing issues in the repository
2. Create a new issue with a detailed description
3. Include error messages and reproduction steps
4. Contact the development team

---

**Last Updated:** 2026-05-13  
**Language Composition:** JavaScript 65.7% | Python 33.8% | HTML 0.5%  
**Maintainer:** micaiahsamuel31  
**Framework:** React + Vite
