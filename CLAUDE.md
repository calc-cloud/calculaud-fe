# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on port 8080
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui + Radix UI primitives
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query) + React Context
- **Routing**: React Router DOM
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Notifications**: Sonner + Radix Toast

## Architecture Overview

This is a procurement management system frontend that connects to a Railway-hosted API at `https://calcloud-api-production.up.railway.app/api/v1`.

### Core Pages
- **Search** (`/`) - Main search interface for purposes/procurement items
- **Dashboard** (`/dashboard`) - Analytics and reporting charts
- **Admin** (`/admin`) - Management interface for hierarchies, suppliers, service types, and services

### Key Architectural Patterns

**Data Layer:**
- `src/services/` - API service classes for each entity type
- `src/hooks/` - Custom hooks wrapping TanStack Query for data fetching
- `src/contexts/AdminDataContext.tsx` - Global state for admin data (hierarchies, suppliers, service types, services)

**Component Organization:**
- `src/components/admin/` - Admin page components
- `src/components/dashboard/` - Dashboard charts and filters
- `src/components/common/` - Shared components (FileUpload, FilterBar, HierarchySelector)
- `src/components/ui/` - shadcn/ui components (button, dialog, table, etc.)

**Type System:**
- `src/types/` - TypeScript interfaces organized by domain
- Main entities: Purpose, EMF, Hierarchy, ServiceType, Service, Supplier
- Hierarchies have 5 levels: Unit → Center → Anaf → Mador → Team

## Data Flow

1. **API Configuration**: `src/config/api.ts` defines base URL and endpoints
2. **Service Layer**: `src/services/apiService.ts` provides generic HTTP client
3. **Entity Services**: Domain-specific services (hierarchyService, purposeService, etc.)
4. **React Query Hooks**: Custom hooks in `src/hooks/` for data fetching/mutations
5. **Context**: AdminDataContext provides global state for reference data

## Key Features

- **Hierarchical Data**: 5-level organizational hierarchy with drill-down navigation
- **Advanced Filtering**: Multi-select filters for hierarchy, service types, suppliers, status
- **File Management**: Upload/download capabilities for purpose attachments
- **EMF Tracking**: Financial tracking with multiple currencies (USD, ILS)
- **Analytics**: Dashboard with distribution charts and metrics
- **CSV Export**: Export functionality for data analysis

## Development Notes

- Path alias `@/` maps to `src/`
- ESLint configured with React hooks and TypeScript rules
- Unused TypeScript variables are ignored in ESLint config
- Component tagging enabled in development mode via lovable-tagger
- Purpose data structure includes nested contents array for service quantities

## API Integration

Backend expects:
- Hierarchy IDs as strings but API returns them as numbers
- Service types, suppliers, and hierarchies are managed via admin interface
- Purpose contents link to services with quantity information
- EMF records track financial workflows with multiple currency support