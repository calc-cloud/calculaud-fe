# calculaud-fe

[![CI](https://github.com/calc-cloud/calculaud-fe/actions/workflows/ci.yml/badge.svg)](https://github.com/calc-cloud/calculaud-fe/actions/workflows/ci.yml)
[![CD](https://github.com/calc-cloud/calculaud-fe/actions/workflows/cd.yml/badge.svg)](https://github.com/calc-cloud/calculaud-fe/actions/workflows/cd.yml)
[![Release](https://github.com/calc-cloud/calculaud-fe/actions/workflows/release.yml/badge.svg)](https://github.com/calc-cloud/calculaud-fe/actions/workflows/release.yml)

Procurement Management System frontend built with React and TypeScript.

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

## 🚀 Docker Deployment

This project includes automated Docker image building and publishing to DockerHub via GitHub Actions.

### Setup Instructions

1. **Configure GitHub Secrets**
   
   Go to your repository Settings → Secrets and variables → Actions, and add:
   - `DOCKERHUB_USERNAME`: Your DockerHub username
   - `DOCKERHUB_TOKEN`: Your DockerHub access token (not password)

2. **Configure Repository Variables** (Optional)
   
   Go to your repository Settings → Secrets and variables → Actions → Variables tab:
   - `DOCKER_IMAGE_NAME`: Custom image name (defaults to repository name)

3. **Generate DockerHub Access Token**
   
   1. Go to DockerHub → Account Settings → Security
   2. Click "New Access Token"
   3. Give it a descriptive name (e.g., "GitHub Actions")
   4. Copy the token and add it as `DOCKERHUB_TOKEN` secret

### How It Works

The CI/CD pipeline consists of three workflows:

**CI Pipeline** (`ci.yml`):
- Runs on all pushes and pull requests
- Performs code quality checks: linting (ESLint), build verification (Vite)
- Must pass before merging PRs

**CD Pipeline** (`cd.yml`):
- Runs on pushes to `main` branch only
- Waits for CI workflow to complete successfully
- Builds production-optimized Docker image
- Pushes to DockerHub with development tags:
  - `latest` (for main branch)
  - `main-{timestamp}` (for main branch with timestamp)
  - `{git-sha}` (for specific commits)

**Release Pipeline** (`release.yml`):
- Runs when a GitHub release is published
- Waits for CI workflow to complete successfully
- Builds production-optimized Docker image with version
- Pushes to DockerHub with release tags:
  - `v{version}` (e.g., `v1.0.0`)
  - `{version}` (e.g., `1.0.0`)
  - `latest` (updated to release version)

### Manual Deployment

You can also trigger the CD deployment manually:
1. Go to Actions → CD - Build and Deploy
2. Click "Run workflow"
3. Optionally specify a custom tag

## 🚀 Release Process

### Creating a New Release

1. **Prepare Release Branch**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b release/v1.0.0
   ```

2. **Update Version** (if needed)
   - Update version in `package.json`
   - Update any documentation

3. **Create Pull Request**
   ```bash
   git add .
   git commit -m "chore: prepare release v1.0.0"
   git push -u origin release/v1.0.0
   ```
   - Create PR from release branch to main
   - Wait for CI to pass and get approval

4. **Merge and Create GitHub Release**
   - Merge PR to main
   - Go to GitHub → Releases → "Create a new release"
   - Choose tag: `v1.0.0` (will be created)
   - Release title: `v1.0.0`
   - Use the template from `.github/release_template.md`
   - Click "Publish release"

5. **Automatic Deployment**
   - Release workflow automatically triggers
   - Docker images are built and pushed with proper tags
   - Check Actions tab for deployment status

### Release Tags

Each release creates multiple Docker tags:
- `youruser/calculaud-fe:v1.0.0`
- `youruser/calculaud-fe:1.0.0`
- `youruser/calculaud-fe:latest` (updated to release)

### Running Locally

```bash
# Build the image
docker build -t calculaud-fe .

# Run the container
docker run -p 8080:8080 calculaud-fe
```

### Runtime Environment Variables

The application supports runtime environment variable injection using `RUNTIME_` prefixed variables:

```bash
docker run -p 8080:8080 \
  -e RUNTIME_API_BASE_URL=https://calcloud-api-production.up.railway.app/api/v1 \
  -e RUNTIME_AUTH_AUTHORITY=https://adfs.contoso.com/adfs \
  -e RUNTIME_AUTH_CLIENT_ID=00001111-aaaa-2222-bbbb-3333cccc4444 \
  -e RUNTIME_AUTH_REDIRECT_URI=http://localhost:8080/ \
  -e RUNTIME_AUTH_RESPONSE_TYPE=code \
  -e RUNTIME_AUTH_RESPONSE_MODE=query \
  -e RUNTIME_AUTH_SCOPE=openid \
  calculaud-fe
```

### Docker Image Features

- Multi-stage build (Node.js → nginx)
- Non-root user for security
- Runtime environment variable injection
- OpenShift compatibility
- AMD64 architecture support
- Optimized layer caching

### Build for Production
```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory, ready for deployment to any static hosting service.

### Supported Platforms

- **Docker** - Containerized deployment with runtime environment injection
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
