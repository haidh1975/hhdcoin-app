# replit.md

## Overview

HHDcoin is a Vietnamese Bitcoin investment platform that combines AI-powered market analysis with modern web technologies. The application provides real-time Bitcoin price tracking, investment package management, market analysis, and community features. It's built as a full-stack web application with a React frontend and Express backend, targeting Vietnamese users interested in cryptocurrency investment.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom design tokens and Vietnamese-optimized color scheme
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints following conventional patterns
- **Validation**: Zod schemas for request/response validation
- **Development**: Hot module replacement via Vite integration in development mode

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Neon Database serverless PostgreSQL for production hosting
- **In-Memory Storage**: Fallback memory storage implementation for development/testing

### Database Schema Design
- **Users Table**: Basic user authentication with username/password
- **Contact Messages**: Customer inquiry and support message storage
- **Investment Packages**: Configurable investment plans with rate ranges and features
- **Data Types**: Proper use of decimal types for financial data, UUID primary keys, and timestamp tracking

### API Structure
- **Investment Packages**: GET endpoint for retrieving available investment plans
- **Contact Form**: POST endpoint for customer inquiries with validation
- **Bitcoin Price**: Mock API endpoint for cryptocurrency market data (ready for real API integration)
- **Error Handling**: Centralized error middleware with proper HTTP status codes

### Development and Build System
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation
- **Development Server**: Integrated development environment with HMR and proxy setup
- **TypeScript Configuration**: Shared types between frontend and backend via shared schema directory
- **Path Aliases**: Configured import aliases for clean code organization

### Deployment Architecture
- **Static Assets**: Frontend builds to dist/public for static serving
- **Server Bundle**: Backend compiles to single ESM bundle for production
- **Environment Configuration**: Environment-based configuration with proper fallbacks
- **Replit Integration**: Custom plugins and development tooling for Replit environment

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect support

### UI and Component Libraries
- **Radix UI**: Comprehensive collection of accessible React components
- **Shadcn/ui**: Pre-built component library with Tailwind CSS integration
- **Lucide React**: Icon library for consistent iconography
- **React Icons**: Additional icon sets including Bitcoin and social media icons

### Development Tools
- **Vite**: Fast build tool with React plugin and TypeScript support
- **TanStack Query**: Powerful data synchronization library for React
- **Wouter**: Minimalist routing library for React applications
- **React Hook Form**: Performant form library with validation support

### Validation and Type Safety
- **Zod**: TypeScript-first schema validation library
- **Drizzle Zod**: Integration between Drizzle ORM and Zod for schema validation
- **TypeScript**: Full-stack type safety with shared schema definitions

### Styling and Design
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Class Variance Authority**: Component variant management
- **PostCSS**: CSS processing with Tailwind and Autoprefixer plugins

### Runtime and Build
- **Express.js**: Web application framework for Node.js
- **ESBuild**: Fast JavaScript/TypeScript bundler for production builds
- **Connect PG Simple**: PostgreSQL session store for Express sessions