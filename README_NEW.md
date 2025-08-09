# 🚀 BlueKit.io - Visual Stack Builder Platform

<div align="center">
  <img src="public/logo.svg" alt="BlueKit.io Logo" width="200"/>
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.4-black?logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?logo=supabase)](https://supabase.com/)
  [![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
  
  **Build, visualize, and share your perfect tech stack with an intuitive drag-and-drop interface**
  
  [Live Demo](https://bluekit.io) • [Documentation](docs/) • [Contributing](#contributing) • [Roadmap](#roadmap)
</div>

---

## 🎯 Vision

BlueKit.io is an interactive platform for developers to **visually design, compare, and share technology stacks**. Think of it as Figma meets npm - a collaborative space where you can drag and drop technologies to build your perfect architecture, get instant compatibility feedback, and export production-ready configurations.

## ✨ Key Features

### 🎨 **Visual Stack Builder**
- **Drag & Drop Canvas**: Intuitive ReactFlow-powered interface with zoom, pan, and grid snap
- **Smart Connections**: Visual links between technologies with compatibility validation
- **Compact/Extended Views**: Toggle between simple and detailed node displays
- **Container Support**: Docker and Kubernetes nodes with resource configuration
- **Real-time Validation**: Instant feedback on technology compatibility

### 📦 **Component Library**
- **30+ Pre-configured Stacks**: MERN, JAMStack, T3, and more ready-to-use templates
- **150+ Technologies**: Comprehensive library covering frontend, backend, databases, DevOps
- **Smart Search**: Filter by category, difficulty, pricing, and setup time
- **Custom Components**: Add your own technologies and configurations

### 🔄 **Import/Export System**
- **Multiple Formats**: Export as JSON, README.md, or Docker Compose
- **Stack Templates**: Save and share your architectures with the community
- **Version Control**: Full undo/redo support with keyboard shortcuts
- **Auto-save**: Never lose your work with local and cloud persistence

### 👥 **Community Features**
- **Public/Private Stacks**: Share your creations or keep them private
- **User Profiles**: Showcase your tech expertise and stack collection
- **Collaborative Editing**: Real-time collaboration (coming soon)
- **Reviews & Ratings**: Community validation system (coming soon)

### 🎯 **Developer Experience**
- **Step-by-Step Guides**: Generated installation instructions for any stack
- **Cost Calculator**: Estimate setup time, difficulty, and infrastructure costs
- **Comparison Tool**: Side-by-side stack comparison with pros/cons
- **Presentation Mode**: Share and present your architectures professionally

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account (free tier works)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/bluekit.io.git
cd bluekit.io

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run database migrations
npm run db:migrate

# Seed initial data (optional but recommended)
npm run db:seed

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application running.

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ENVIRONMENT=development
```

## 🏗️ Tech Stack

### Frontend
- **Framework**: [Next.js 15.4](https://nextjs.org/) with App Router
- **Language**: [TypeScript 5.7](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom Design System
- **UI Components**: Custom components + [Headless UI](https://headlessui.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Visual Builder**: [ReactFlow](https://reactflow.dev/)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)

### Backend & Database
- **Authentication**: [Supabase Auth](https://supabase.com/auth)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **API**: Next.js API Routes
- **Real-time**: Supabase Realtime (planned)

### State Management
- **Global State**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Persistence**: Local Storage + Supabase
- **Form State**: React Hook Form + Zod

### Development Tools
- **Component Development**: [Storybook](https://storybook.js.org/)
- **Testing**: [Cypress](https://www.cypress.io/) for E2E
- **Code Quality**: ESLint + Prettier
- **Version Control**: Git with conventional commits

## 📁 Project Structure

```
bluekit.io/
├── app/                      # Next.js App Router pages
│   ├── (auth)/              # Authentication pages
│   ├── admin/               # Admin dashboard
│   ├── builder/             # Main stack builder
│   ├── profile/             # User profiles
│   └── stacks/              # Stack gallery
├── components/              
│   ├── ui/                  # Reusable UI components
│   ├── builder/             # Builder-specific components
│   └── layout/              # Layout components
├── lib/
│   ├── api/                 # API utilities
│   ├── supabase/            # Supabase client & utilities
│   └── stores/              # Zustand stores
├── public/                  # Static assets
├── styles/                  # Global styles
└── types/                   # TypeScript definitions
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run E2E tests with Cypress
npm run test:e2e

# Run E2E tests in headless mode
npm run test:e2e:headless

# Run component tests
npm run test:components

# Run Storybook for visual testing
npm run storybook
```

## 📖 Documentation

- **[Architecture Overview](docs/ARCHITECTURE.md)** - System design and technical decisions
- **[Component Library](docs/COMPONENTS.md)** - UI component documentation
- **[API Reference](docs/API.md)** - Backend API endpoints
- **[Database Schema](docs/DATABASE.md)** - Database structure and relationships
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions

## 🗺️ Roadmap

### Phase 1: Foundation ✅ (Completed)
- [x] Basic drag-and-drop builder
- [x] Component library with 30+ stacks
- [x] User authentication
- [x] Stack persistence
- [x] Export functionality

### Phase 2: Enhancement ✅ (Completed)
- [x] Advanced node system with containers
- [x] Undo/redo functionality
- [x] Presentation mode
- [x] Cost calculator
- [x] Import from JSON

### Phase 3: Community 🚧 (In Progress)
- [ ] Real-time collaboration
- [ ] Comments and discussions
- [ ] Stack versioning
- [ ] Public API
- [ ] Stack marketplace

### Phase 4: Intelligence 📅 (Planned)
- [ ] AI-powered recommendations
- [ ] Automatic compatibility checking
- [ ] Performance predictions
- [ ] Security analysis
- [ ] One-click deployment

### Phase 5: Enterprise 🔮 (Future)
- [ ] Team workspaces
- [ ] SSO integration
- [ ] Advanced analytics
- [ ] White-label solution
- [ ] SLA support

## 🤝 Contributing

We love contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Guide

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow

```bash
# Create a new feature branch
git checkout -b feature/your-feature

# Make your changes and test
npm run dev
npm run test

# Check code quality
npm run lint
npm run type-check

# Commit with conventional commits
git commit -m "feat: add new awesome feature"

# Push and create PR
git push origin feature/your-feature
```

## 🐛 Bug Reports

Found a bug? Please [open an issue](https://github.com/yourusername/bluekit.io/issues) with:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser and OS information

## 💡 Feature Requests

Have an idea? We'd love to hear it! [Open a feature request](https://github.com/yourusername/bluekit.io/issues) with:
- Clear description of the feature
- Use cases and benefits
- Mockups or examples if available

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [ReactFlow](https://reactflow.dev/) for the amazing graph library
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Vercel](https://vercel.com/) for hosting and deployment
- [Tailwind CSS](https://tailwindcss.com/) for the styling system
- All our [contributors](https://github.com/yourusername/bluekit.io/graphs/contributors)

## 📞 Contact & Support

- **Website**: [https://bluekit.io](https://bluekit.io)
- **Email**: support@bluekit.io
- **Twitter**: [@bluekitio](https://twitter.com/bluekitio)
- **Discord**: [Join our community](https://discord.gg/bluekit)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/bluekit.io&type=Date)](https://star-history.com/#yourusername/bluekit.io&Date)

---

<div align="center">
  Made with ❤️ by the BlueKit.io team
  
  If you find this project useful, please consider giving it a ⭐!
</div>