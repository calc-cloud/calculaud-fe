# Calculaud - Procurement Management System

A comprehensive procurement management and analytics dashboard for tracking purposes, materials, services, and expenditures across organizational hierarchies.

## 🚀 Features

### 📊 **Dashboard & Analytics**
- **Cost Over Time Charts** - Track expenditure trends and patterns
- **Service Type Distribution** - Visualize spending across different service categories
- **Hierarchy Distribution** - Analyze costs by organizational structure
- **Service Quantity Analytics** - Monitor service usage and quantities

### 🔍 **Search & Filtering**
- **Advanced Search** - Find purposes by multiple criteria
- **Unified Filters** - Filter by service types, suppliers, hierarchies, materials, and date ranges
- **Smart Sorting** - Sort results by various fields with customizable order
- **Pagination** - Efficient browsing through large datasets

### 🎯 **Purpose Management**
- **Purpose Creation & Editing** - Manage procurement purposes with detailed information
- **EMF (Expenditure Management Framework)** - Track costs across multiple currencies (ILS, USD Support, USD Available)
- **Contents Tracking** - Monitor materials, services, and quantities
- **Status Management** - Track purpose progress (In Progress, Completed)

### ⚙️ **Administration**
- **Service Type Management** - Configure and manage service categories
- **Supplier Management** - Maintain supplier database and relationships
- **Material Management** - Organize materials and services catalog
- **Hierarchy Management** - Structure organizational hierarchies and permissions

### 📈 **Data Management**
- **CSV Export** - Export purpose data for external analysis
- **Multi-currency Support** - Handle ILS, USD Support, and USD Available currencies
- **Date Range Filtering** - Analyze data by custom date periods
- **Real-time Updates** - Live data synchronization with backend API

## 🛠️ Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd calculaud-fe

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with the following variables:

```bash
# API Configuration
VITE_API_BASE_URL=https://your-api-endpoint.com/api/v1

# Development Server
VITE_DEV_SERVER_PORT=8080
VITE_DEV_SERVER_HOST=::
```

## 🏗️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development experience
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing and navigation

### UI & Styling
- **shadcn/ui** - Modern, accessible component library
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Beautiful icon library

### Data Management
- **TanStack Query** - Powerful data fetching and caching
- **React Hook Form** - Performant forms with easy validation
- **Date-fns** - Modern JavaScript date utility library

### Charts & Visualization
- **Recharts** - Composable charting library for React

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin-specific components
│   ├── common/         # Shared components
│   ├── dashboard/      # Dashboard charts and widgets
│   ├── modals/         # Modal dialogs
│   ├── sections/       # Page sections
│   ├── tables/         # Data tables and pagination
│   └── ui/             # shadcn/ui components
├── hooks/              # Custom React hooks
├── pages/              # Route components
├── services/           # API service layer
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── contexts/           # React context providers
```

## 🚀 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run build:dev       # Build with development optimizations
npm run preview         # Preview production build
npm run lint            # Run ESLint

# Environment specific builds
NODE_ENV=production npm run build    # Production build
NODE_ENV=development npm run build   # Development build
```

## 🌐 Deployment

### Build for Production
```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory, ready for deployment to any static hosting service.

### Supported Platforms
- **Vercel** - Zero-configuration deployment
- **Netlify** - Static site hosting with forms and serverless functions
- **Railway** - Full-stack application deployment
- **GitHub Pages** - Free static site hosting

## 🔧 Configuration

### API Integration
The application connects to a backend API for data management. Configure the API endpoint in your environment variables:

```bash
VITE_API_BASE_URL=https://your-backend-api.com/api/v1
```

### Supported Endpoints
- `/service-types/` - Service type management
- `/suppliers/` - Supplier data
- `/hierarchies/` - Organizational hierarchies
- `/services/` - Service and material catalog

## 📝 License

This project is private and proprietary.
