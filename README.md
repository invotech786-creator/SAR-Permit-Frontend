# SAR PMO Portal Frontend

## Overview
This is the frontend for the SAR PMO Portal, built with Next.js, React, and TypeScript. It provides a comprehensive user interface for project management including user management, company management, job titles, document management, authentication, and localization (English/Arabic). The frontend is designed to work seamlessly with the backend API and can be run locally or in Docker.

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js (v18+)** and **npm (v8+)** or **yarn (v1.22+)**
- **Git** with SSH access to GitLab
- **Backend API** running (see backend README)
- **Docker & Docker Compose** (for containerized setup)

### System Requirements
- **RAM**: Minimum 4GB, Recommended 8GB
- **Storage**: Minimum 10GB free space
- **Network**: Stable internet connection for dependencies
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## Architecture
- **Next.js 13+**: React framework with App Router
- **React 18**: UI framework with hooks and context
- **TypeScript**: Type-safe development
- **Material-UI (MUI)**: Component library with theming
- **Zustand**: State management for complex data flows
- **Formik + Yup**: Form handling and validation
- **Axios/Apisauce**: HTTP client for API communication
- **Tailwind CSS**: Utility-first CSS framework
- **i18next**: Internationalization (English/Arabic)
- **Docker**: Containerization with optimized build process
- **ESLint**: Code quality and consistency

## Project Structure
```
project-root/
├── public/                 # Static assets, images, locales
│   ├── images/             # Images and icons
│   ├── locales/            # Translation files (en.json, ar.json)
│   └── vercel.svg          # Static files
├── src/
│   ├── @core/              # Core components and utilities
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── layouts/        # Layout components
│   │   ├── styles/         # Global styles and themes
│   │   ├── theme/          # MUI theme configuration
│   │   └── utils/          # Utility functions
│   ├── api-config/         # API configuration and network layer
│   ├── components/         # Shared components
│   ├── configs/            # Application configurations
│   ├── iconify-bundle/     # Icon bundle for performance
│   ├── layouts/            # Layout components
│   ├── navigation/         # Navigation configuration
│   ├── pages/              # Next.js pages
│   │   ├── companies/      # Company management pages
│   │   ├── jobtitles/      # Job titles management pages
│   │   ├── users/          # User management pages
│   │   └── components/     # Page-specific components
│   ├── store/              # Zustand state management
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── views/              # View components and pages
├── styles/                 # Global styles
├── Dockerfile              # Optimized Docker build file
├── next.config.js          # Next.js configuration
├── package.json            # NPM dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication with secure token management
- Role-based access control (Super Admin, Admin, User)
- Protected routes with automatic redirection
- Session management and token refresh

### 👥 User Management
- Complete CRUD operations for users
- Profile picture upload with preview
- Advanced filtering and search capabilities
- Bulk operations (delete, status toggle)
- User statistics and analytics
- Responsive data tables with pagination

### 🏢 Company Management
- Full company lifecycle management
- Multi-language support (Arabic/English names)
- Contact information and address management
- Bulk operations and status management
- Advanced data table with sorting and filtering

### 💼 Job Titles Management
- Job title creation and management
- Localized naming (Arabic/English)
- Status management and bulk operations
- Clean and intuitive interface

### 📄 Document Management
- File upload with drag-and-drop
- Document categorization and organization
- Version control and revision tracking
- Evidence management system
- Folder tree view for document organization

### 🌐 Localization
- Complete Arabic/English support
- Dynamic language switching in top bar
- Tajawal font integration for Arabic text
- RTL layout support
- Localized content and messages

### 🎨 UI/UX Features
- Modern, responsive design
- Material-UI components with custom theming
- Loading states and progress indicators
- Form validation with real-time feedback
- Modal dialogs for CRUD operations
- Toast notifications for user feedback
- Dark/light theme support

### 🔧 Technical Features
- TypeScript for type safety
- Optimized bundle size with code splitting
- Server-side rendering (SSR) capabilities
- Progressive Web App (PWA) features
- SEO optimization
- Performance monitoring

## 🛠️ Installation & Setup

### Option 1: Local Development Setup

#### Step 1: Clone and Setup
```bash
# Clone the repository
git clone ssh://git@gitlab.wulooj.com:1394/development/sar-pmo-portal-frontend.git
cd sar-pmo-portal-frontend

# Install dependencies
npm install
# or
yarn install
```

#### Step 2: Environment Configuration
Create a `.env.local` file in the root directory:

```env
# ========================================
# API CONFIGURATION
# ========================================
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# ========================================
# OPTIONAL: ANALYTICS AND MONITORING
# ========================================
NEXT_PUBLIC_GA_ID=your-google-analytics-id
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

#### Step 3: Start the Development Server
```bash
# Start development server
npm run dev
# or
yarn dev
```

#### Step 4: Open Your Browser
Visit `http://localhost:3000`

### Option 2: Docker Setup (Recommended for New Developers)

#### Prerequisites
- Docker Desktop installed and running
- Docker Compose v2+

#### Quick Start with Docker
```bash
# Clone the repository
git clone ssh://git@gitlab.wulooj.com:1394/development/sar-pmo-portal-frontend.git
cd sar-pmo-portal-frontend

# Build and run with Docker
docker build -t sar-pmo-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://localhost:5000/api sar-pmo-frontend

# Or use Docker Compose with backend
cd ../sar-pmo-portal-backend
docker compose up --build
```

#### Docker Configuration
The `Dockerfile` includes:
- **Multi-stage build** for optimized production images
- **Node.js Alpine** base for smaller image size
- **Static file serving** for optimal performance
- **Health checks** for container orchestration

#### Docker Commands
```bash
# Build image
docker build -t sar-pmo-frontend .

# Run container
docker run -p 3000:3000 sar-pmo-frontend

# Run with environment variables
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://localhost:5000/api sar-pmo-frontend

# View logs
docker logs -f <container_id>

# Stop container
docker stop <container_id>
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api` | ✅ |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | - | ❌ |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Enable analytics | `false` | ❌ |

## Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # Run TypeScript type checking
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

### Code Quality
- **ESLint** configuration for code consistency
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Git hooks** for pre-commit validation

### State Management
- **Zustand** for global state management
- **React Context** for theme and locale
- **Local state** for component-specific data
- **Optimized re-renders** with proper state structure

## Performance Optimizations

### Git Performance
- **Optimized SSH configuration** for faster GitLab operations
- **Git LFS** for large file management
- **Compression settings** for faster transfers

### Frontend Optimizations
- **Code splitting** with dynamic imports
- **Image optimization** with Next.js Image component
- **Bundle analysis** for size optimization
- **Lazy loading** for components and routes
- **Memoization** for expensive computations

### API Optimizations
- **Request caching** with Zustand
- **Optimistic updates** for better UX
- **Error boundaries** for graceful error handling
- **Loading states** for better user feedback

## Security Features

- **JWT token management** with secure storage
- **CSRF protection** with proper headers
- **Input sanitization** and validation
- **XSS prevention** with proper escaping
- **Secure file uploads** with type validation

## UI/UX Features

### Responsive Design
- **Mobile-first** approach
- **Breakpoint system** for all screen sizes
- **Touch-friendly** interfaces
- **Accessibility** compliance (WCAG 2.1)

### Component Library
- **Material-UI** components with custom theming
- **Custom components** for specific use cases
- **Consistent design system** across the application
- **Icon system** with Iconify integration

### User Experience
- **Loading states** with spinners and skeletons
- **Error handling** with user-friendly messages
- **Form validation** with real-time feedback
- **Toast notifications** for user actions
- **Modal dialogs** for focused interactions

## Internationalization

### Language Support
- **English** (default)
- **Arabic** with RTL support
- **Tajawal font** for Arabic text
- **Dynamic language switching**

### Translation System
- **i18next** for translation management
- **JSON-based** translation files
- **Namespace organization** for scalability
- **Fallback handling** for missing translations

## Troubleshooting

### Common Issues

**Build errors:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules && npm install

# Check TypeScript errors
npm run type-check
```

**API connection issues:**
- Verify backend is running on correct port (5000)
- Check `NEXT_PUBLIC_API_URL` environment variable
- Ensure CORS is properly configured on backend

**Performance issues:**
```bash
# Use production build
npm run build && npm start

# Check bundle size
npm run analyze

# Optimize images and assets
```

**Git operations are slow:**
- Use the optimized SSH configuration in `~/.ssh/config`
- Consider using HTTPS instead of SSH if network issues persist

**Docker issues:**
```bash
# Clean up Docker resources
docker system prune -a

# Rebuild image
docker build --no-cache -t sar-pmo-frontend .

# Run with fresh container
docker run --rm -p 3000:3000 sar-pmo-frontend
```

**Port already in use:**
```bash
# Check what's using port 3000
netstat -ano | findstr :3000

# Kill the process if needed
taskkill /PID <process_id> /F
```

## Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style and ESLint rules
- Add TypeScript types for new features
- Update documentation for UI changes
- Ensure responsive design for all screen sizes
- Test with both English and Arabic locales

## Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## Performance Metrics

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## License

This project is proprietary software developed for SAR PMO Portal. All rights reserved.

## Contact

For support and questions:
- **Development Team**: SAR PMO Portal Development
- **Email**: [Contact your organization]
- **GitLab**: [Project repository](ssh://git@gitlab.wulooj.com:1394/development/sar-pmo-portal-frontend.git)

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Node.js Version**: 18+
**Next.js Version**: 13+
