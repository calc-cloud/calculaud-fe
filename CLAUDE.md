# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands

- `npm run dev` - Start development server on port 8080
- `npm run build` - Production build
- `npm run build:dev` - Development build with dev optimizations
- `npm run lint` - Run ESLint for code quality checks
- `npm run preview` - Preview production build locally

### Package Management

- Uses both `npm` and `bun` (bun.lockb present)
- Dependencies managed through package.json

## Architecture Overview

### Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC plugin for fast compilation
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme configuration
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: React Router DOM v6
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation

### Project Structure

#### Core Application

- `src/App.tsx` - Main app component with routing setup
- `src/main.tsx` - Application entry point
- `src/pages/` - Route components (Search, Dashboard, Admin, NotFound)

#### Component Architecture

- `src/components/ui/` - shadcn/ui component library (50+ components)
- `src/components/common/` - Shared business components (filters, file upload, selectors)
- `src/components/dashboard/` - Dashboard-specific chart components
- `src/components/admin/` - Admin management components for hierarchies, materials, suppliers
- `src/components/layout/` - App layout wrapper

#### Data Layer

- `src/services/` - API service classes for different entities
- `src/hooks/` - Custom React hooks for data fetching and mutations
- `src/contexts/AdminDataContext.tsx` - Shared context for admin data
- `src/config/api.ts` - API configuration and endpoints

#### Types and Utilities

- `src/types/` - TypeScript type definitions organized by domain
- `src/utils/` - Utility functions (filters, formatters, CSV export, date handling)
- `src/lib/utils.ts` - Core utility functions (cn for class merging)

### Key Design Patterns

#### Data Fetching

- React Query for all API calls with proper caching
- Custom hooks pattern: `useHierarchies`, `useMaterials`, etc.
- Mutation hooks for create/update operations: `useHierarchyMutations`

#### Component Organization

- Domain-driven folder structure under `src/components/`
- UI components separated from business logic components
- Unified filter system across Search and Dashboard pages

#### State Management

- React Query for server state
- React Context for shared admin data
- Local state with React hooks for UI interactions

### API Integration

#### Configuration

- Base URL: `https://calcloud-api-production.up.railway.app/api/v1`
- Centralized in `src/config/api.ts`
- Generic API service class with REST methods

#### Data Models

- **Purpose**: Main entity with contents, EMFs, files, and metadata
- **Hierarchy**: Organizational structure
- **Materials/Services**: Items that can be procured
- **Suppliers**: Vendor information
- **ServiceTypes**: Categorization of services

### Development Notes

#### Path Aliases

- `@/*` maps to `src/*` (configured in both tsconfig.json and vite.config.ts)

#### Styling System

- Tailwind CSS with extensive custom theme
- CSS custom properties for dynamic theming
- shadcn/ui design system with consistent spacing and colors

#### TypeScript Configuration

- Relaxed strict mode (noImplicitAny: false, strictNullChecks: false)
- Allows unused parameters and locals for rapid development

#### Build Configuration

- Vite with React SWC plugin for fast builds
- Lovable integration for development workflow
- Component tagging in development mode

### Key Business Logic

#### Filtering System

- Unified filter component used across Search and Dashboard
- Support for date ranges, hierarchies, suppliers, service types, and materials
- Filter state management with proper URL integration

#### Data Export

- CSV export functionality in `src/utils/csvExport.ts`
- Supports exporting filtered data sets

#### Admin Management

- CRUD operations for hierarchies, materials, suppliers, and service types
- Modal-based editing interfaces
- Real-time data updates via React Query mutations