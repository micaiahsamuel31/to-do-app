# Mend Frontend

A modern, responsive web application built with **React** and **Vite**, designed to provide a seamless user experience for the Mend platform.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

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
│   ├── assets/         # Images, fonts, and static files
│   ├── styles/         # Global CSS and styling
│   ├── App.jsx         # Main App component
│   └── main.jsx        # Entry point
├── public/             # Static assets served as-is
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
└── README.md          # This file
```

## 🛠️ Technology Stack

### Core Framework
- **React** - A JavaScript library for building user interfaces with component-based architecture
- **Vite** - Next-generation frontend build tool providing lightning-fast development and optimized production builds

### Styling
- **CSS** - For component styling and responsive design
- **CSS Modules** - Optional scoped styling approach

### Development Tools
- **ESLint** - Code quality and style enforcement
- **React Compiler** - Enabled for optimized component compilation (note: may impact dev/build performance)

### Build Plugins
- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) - Uses [Oxc](https://oxc.rs) for React support
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) - Alternative using [SWC](https://swc.rs/)

## 📊 Project Statistics

- **Language Composition:**
  - JavaScript: 38%
  - CSS: 42.1%
  - Python: 19.6% (backend services)
  - HTML: 0.3%

- **Framework:** React 18+ with Vite
- **Build Tool:** Vite
- **Package Manager:** npm

## 🎨 Styling

The project uses **CSS** as its primary styling approach, comprising **42.1%** of the frontend codebase. This ensures:

- Clean, maintainable stylesheets
- Responsive design patterns
- Performance optimization
- Easy theming and customization

### CSS Best Practices

```bash
# CSS organization
src/styles/
├── global.css       # Global styles and resets
├── variables.css    # CSS variables and theme definitions
├── components/      # Component-specific styles
└── utilities.css    # Utility classes
```

## 🚀 Features

- ⚡ **Fast Development** - Instant feedback with Vite's HMR
- 📱 **Responsive Design** - Mobile-first CSS approach
- ♿ **Accessible** - Built with accessibility best practices
- 🔒 **Security** - Secure component architecture
- 🎯 **Performance** - Optimized production builds
- 🔄 **Hot Module Replacement** - Update code without losing state

## 📖 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint code with ESLint
npm run lint

# Format code (if configured)
npm run format
```

## 🔧 Configuration

### Vite Configuration
Edit `vite.config.js` to customize build behavior, environment variables, and plugin settings.

### ESLint Configuration
The project includes ESLint rules for code quality. For production applications, consider enabling TypeScript with type-aware lint rules.

### Environment Variables
Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3000
VITE_APP_TITLE=Mend
```

Access in code using: `import.meta.env.VITE_API_URL`

## 🧪 Testing (Optional Setup)

To add testing capabilities:

```bash
# Install testing libraries
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom

# Run tests
npm run test
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

## 🌐 Integration with Backend

The frontend communicates with the backend API (Python services). Ensure:

1. Backend API is running and accessible
2. CORS is properly configured on the backend
3. API endpoints are correctly configured in environment variables

Example API call:
```javascript
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/endpoint`);
const data = await response.json();
```

## 📝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run ESLint: `npm run lint`
4. Commit changes: `git commit -am 'Add new feature'`
5. Push to branch: `git push origin feature/your-feature`
6. Open a Pull Request

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
Ensure your `vite.config.js` has proper HMR configuration for your environment.

## 📚 Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [React Compiler Guide](https://react.dev/learn/react-compiler)
- [Vite Plugin React](https://github.com/vitejs/vite-plugin-react)

## 📄 License

This project is part of the Mend application. Please refer to the main repository's LICENSE file for details.

## 👥 Support

For issues or questions:
1. Check existing issues in the repository
2. Create a new issue with detailed description
3. Contact the development team

---

**Last Updated:** 2026-05-13  
**Maintainer:** micaiahsamuel31
