# Neural Adapt Mobile

A React Native mobile application for AI-powered workout planning and training management.

## Overview

Neural Adapt is a mobile fitness application built with React Native and Expo that helps users create personalized workout plans. The app features an AI-powered workout programmer that generates customized training programs based on individual goals, experience level, and equipment availability.

## Features

- **AI-Powered Workout Generation**: Create personalized workout plans tailored to your goals
- **Training Programs**: Support for Powerlifting, Bodybuilding, and General Fitness
- **Periodization Support**: Microcycle, Mesocycle, Macrocycle, and Block periodization models
- **Workout Tracking**: View and manage your workout plans
- **Excel Export**: Export workout plans to Excel format for offline use
- **Profile Management**: Configure feature access and preferences
- **Local Storage**: All data stored locally using SQLite

## Tech Stack

- **Framework**: React Native with Expo (~54.0.23)
- **Language**: TypeScript (~5.9.2)
- **UI Components**: React Native Paper (^5.12.4)
- **Navigation**: Expo Router (~6.0.14)
- **Database**: Expo SQLite (~16.0.9) with Drizzle ORM (^0.44.7)
- **Forms**: React Hook Form (^7.66.0) with Zod (^4.1.12) validation
- **Date Handling**: date-fns (^4.1.0)
- **Excel Export**: XLSX (^0.18.5)
- **State Management**: React hooks and local state

## Project Structure

```
app/
├── app/                    # App screens and navigation
│   ├── (tabs)/            # Tab-based navigation screens
│   │   ├── index.tsx      # Dashboard with workout plans list
│   │   ├── profile.tsx    # Profile and settings
│   │   └── _layout.tsx    # Tab navigation layout
│   ├── plan/              # Workout plan details
│   │   └── [id].tsx       # Individual plan viewer and export
│   └── _layout.tsx        # Root layout with database initialization
├── components/            # Reusable UI components
│   ├── forms/            # Form input components
│   ├── ui/               # Generic UI components
│   └── workout/          # Workout-specific components
├── db/                   # Database setup
│   └── migrations.ts     # SQLite database initialization
├── services/             # Business logic and data services
│   └── storage.ts        # Database CRUD operations
├── types/                # TypeScript type definitions
│   ├── database.ts       # Database types
│   ├── workout.ts        # Workout plan schemas
│   └── api.ts           # API types
└── reference/            # Reference implementations (not used in app)
```

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Emulator (for Android development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/champmk/app.git
cd app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on a specific platform:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Environment Variables

The app uses environment-specific configuration files:

- `.env.development` - Development environment settings
- `.env.production` - Production environment settings

Available variables:
- `EXPO_PUBLIC_API_URL` - Backend API URL
- `EXPO_PUBLIC_ENV` - Environment name

## Database Schema

The app uses SQLite with two main tables:

### workout_plans
- `id` (TEXT, PRIMARY KEY)
- `user_id` (TEXT)
- `program_name` (TEXT)
- `request_payload` (TEXT, JSON)
- `response_payload` (TEXT, JSON)
- `artifact_path` (TEXT)
- `created_at` (INTEGER, timestamp)
- `updated_at` (INTEGER, timestamp)

### feature_selections
- `id` (TEXT, PRIMARY KEY)
- `user_id` (TEXT)
- `workout_programmer` (INTEGER, boolean)
- `journaling` (INTEGER, boolean)
- `calendar` (INTEGER, boolean)
- `updated_at` (INTEGER, timestamp)

## Key Components

### Database (db/migrations.ts)
Handles SQLite database initialization and schema creation.

### Storage Service (services/storage.ts)
Provides CRUD operations for workout plans and feature selections:
- `getWorkoutPlans()` - Fetch all workout plans
- `getWorkoutPlanById(id)` - Fetch a specific plan
- `createWorkoutPlan(plan)` - Create a new plan
- `deleteWorkoutPlan(id)` - Delete a plan
- `getFeatureSelections()` - Get user feature preferences
- `updateFeatureSelections(updates)` - Update feature preferences

### Workout Types (types/workout.ts)
Defines Zod schemas for workout generation requests and responses, ensuring type safety throughout the application.

## Development

### Type Checking
```bash
npx tsc --noEmit
```

### Building for Production
```bash
npx expo export --platform android
npx expo export --platform ios
```

## License

Private - All rights reserved

## Contributing

This is a private repository. Please contact the repository owner for contribution guidelines.
