# Neural Adapt Mobile - Copilot Development Guide

## Project Overview

**Neural Adapt** is an AI-powered mobile fitness application built with React Native and Expo. It provides personalized workout programming using AI to create comprehensive training plans tailored to individual athletes' goals, experience levels, and constraints.

### Key Features
- **AI-Powered Workout Generation**: Creates customized workout programs using OpenAI
- **Workout Plan Management**: View, track, and manage multiple workout programs
- **Feature Toggles**: Users can enable/disable features like workout programmer, journaling, and calendar sync
- **Offline-First Architecture**: Uses SQLite for local data storage with Expo SQLite
- **Cross-Platform**: Supports iOS, Android, and Web via Expo

## Technology Stack

### Core Technologies
- **React Native**: 0.81.5
- **React**: 19.1.0
- **Expo**: ~54.0.23
- **TypeScript**: ~5.9.2

### Navigation & Routing
- **expo-router**: ~6.0.14 (File-based routing with typed routes)

### UI Framework
- **react-native-paper**: ^5.12.4 (Material Design components)
- **@expo/vector-icons**: ^15.0.3

### Data Management
- **Database**: expo-sqlite (~16.0.9) with drizzle-orm (^0.44.7)
- **Schema Validation**: zod (^4.1.12)
- **Forms**: react-hook-form (^7.66.0)

### API & Utilities
- **axios**: ^1.13.2 (HTTP client)
- **date-fns**: ^4.1.0 (Date utilities)
- **expo-secure-store**: ~15.0.7 (Secure storage)
- **xlsx**: ^0.18.5 (Excel file handling)

### Development Tools
- **drizzle-kit**: ^0.31.7 (Database migrations)

## Project Structure

```
app/
├── app/                          # Expo Router pages
│   ├── (tabs)/                   # Tab navigation screens
│   │   ├── _layout.tsx          # Tab navigator configuration
│   │   ├── index.tsx            # Dashboard screen (workout plans list)
│   │   ├── generate.tsx         # Workout generation form (referenced but not yet created)
│   │   └── profile.tsx          # User profile and settings
│   ├── plan/
│   │   └── [id].tsx            # Individual workout plan detail view
│   ├── _layout.tsx             # Root layout with providers
│   └── +not-found.tsx          # 404 error screen
├── components/                  # Reusable components
│   ├── forms/                  # Form input components
│   │   ├── SelectInput.tsx
│   │   ├── MultiSelectInput.tsx
│   │   ├── NumberInput.tsx
│   │   └── TextAreaInput.tsx
│   ├── ui/                     # Generic UI components
│   │   ├── LoadingOverlay.tsx
│   │   ├── ErrorBanner.tsx
│   │   └── EmptyState.tsx
│   └── workout/                # Workout-specific components
│       ├── WorkoutPlanCard.tsx
│       ├── WorkoutPlanViewer.tsx
│       ├── WorkoutStepper.tsx
│       ├── SessionTable.tsx
│       └── WeekSelector.tsx
├── types/                      # TypeScript type definitions
│   ├── workout.ts             # Workout schemas and types
│   ├── database.ts            # Database types
│   └── api.ts                 # API types
├── services/                  # Service layer (to be implemented)
│   └── storage.ts            # Local storage operations
├── db/                       # Database layer
│   └── migrations/           # Database migrations
├── reference/                # Reference implementations
│   ├── services/            # Backend service examples
│   └── *.tsx               # Component references
├── assets/                  # Static assets (images, icons)
└── index.ts                # Expo entry point
```

## Key Concepts & Architecture

### 1. File-Based Routing (Expo Router)
- Uses file system as the routing mechanism
- `(tabs)` folder creates a tab navigator
- `[id]` creates dynamic routes
- `_layout.tsx` files define layouts and navigation structure

### 2. Type-Safe Schemas (Zod)
All data structures are validated using Zod schemas:
- `workoutGenerationSchema`: Input for workout generation
- `workoutPlanSchema`: Complete workout plan structure
- `sessionLiftSchema`: Individual exercise definition

### 3. Database Architecture
- **SQLite** with **Drizzle ORM** for local storage
- Two main entities:
  - `WorkoutPlanRow`: Stored workout plans
  - `FeatureSelectionRow`: User feature preferences

### 4. Workout Plan Structure
A complete workout plan includes:
- **Program Metadata**: Name, focus, type, duration, dates
- **Athlete Profile**: Summary, goals, constraints
- **Methodology**: Periodization, volume, intensity, frequency strategies
- **Phases**: Training phases with objectives and metrics
- **Weeks**: Weekly breakdown with sessions
  - **Sessions**: Daily workouts with emphasis, duration
    - Main lifts (sets, reps, intensity, rest, tempo)
    - Accessory work
    - Conditioning
    - Recovery protocols
- **Monitoring**: Readiness checks, nutrition, recovery
- **Coaching Notes**: Additional guidance

## Development Guidelines

### Code Style
- Use **TypeScript** for all files
- Use **functional components** with hooks
- Use **react-hook-form** for form management
- Use **react-native-paper** components for UI consistency
- Follow React Native StyleSheet API for styling

### State Management
- Use React hooks (`useState`, `useEffect`, `useReducer`)
- Local state for component-specific data
- Database queries via service layer functions
- No global state management library currently used

### Error Handling
- Use try-catch blocks for async operations
- Log errors to console (replace with proper error tracking in production)
- Show user-friendly error messages via ErrorBanner component
- Graceful degradation for failed API calls

### Navigation Patterns
```typescript
import { useRouter } from 'expo-router';

const router = useRouter();
router.push('/path');           // Navigate to path
router.replace('/path');        // Replace current route
router.back();                  // Go back
```

### Form Patterns
```typescript
import { useForm } from 'react-hook-form';

const { control, handleSubmit } = useForm<FormType>();
```

### Database Patterns
```typescript
// Service layer abstracts database operations
import { getWorkoutPlans, deleteWorkoutPlan } from '../../services/storage';

const plans = await getWorkoutPlans();
await deleteWorkoutPlan(planId);
```

## Common Development Tasks

### Adding a New Screen
1. Create a new `.tsx` file in `app/` or `app/(tabs)/`
2. Export a default React component
3. Update `_layout.tsx` if adding to tab navigation
4. Add types to `types/` if needed

### Creating a New Component
1. Create component in appropriate `components/` subdirectory
2. Use TypeScript for props interface
3. Use StyleSheet API for styling
4. Export named or default component

### Adding a Form Input
1. Create reusable input component in `components/forms/`
2. Accept react-hook-form `control` prop
3. Use react-native-paper components as base
4. Handle validation and error display

### Working with Database
1. Define types in `types/database.ts`
2. Create/update migrations in `db/migrations/`
3. Add service functions in `services/storage.ts`
4. Use service functions in components

### Adding New Workout Features
1. Update schemas in `types/workout.ts`
2. Update UI components in `components/workout/`
3. Update storage service if persistence needed
4. Update plan viewer if display changes needed

## Environment Configuration

### Development
```
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
EXPO_PUBLIC_ENV=development
```

### Production
```
EXPO_PUBLIC_API_URL=https://your-production-api.vercel.app
EXPO_PUBLIC_ENV=production
```

## Available Scripts

```bash
npm start          # Start Expo development server
npm run android    # Start on Android emulator/device
npm run ios        # Start on iOS simulator/device
npm run web        # Start web version
```

## Key Components Reference

### WorkoutPlanCard
Displays a workout plan summary in a card format with delete functionality.

### WorkoutPlanViewer
Complete workout plan viewer with week navigation, session details, and comprehensive plan information display.

### WorkoutStepper
Step-by-step navigation component for multi-step forms.

### SessionTable
Displays workout session details in a table format with lifts, sets, reps, and intensity.

### EmptyState
Generic empty state component with icon, title, description, and action button.

### LoadingOverlay
Full-screen loading indicator overlay.

### ErrorBanner
Error message display component with dismissible banner.

## Data Flow

1. **User Input** → Form (react-hook-form)
2. **Form Submit** → Validation (Zod schemas)
3. **API Call** → Backend service (via axios)
4. **Response** → Parse & validate (Zod schemas)
5. **Store** → SQLite database (via Drizzle ORM)
6. **Display** → UI components (react-native-paper)

## Testing Considerations

- Test on both iOS and Android platforms
- Test offline functionality (SQLite operations)
- Test form validation scenarios
- Test navigation flows
- Test error states and loading states
- Verify responsive layouts

## Performance Best Practices

- Use `FlatList` for long lists (already used in dashboard)
- Memoize expensive computations with `useMemo`
- Optimize re-renders with `React.memo` for pure components
- Lazy load workout plan details
- Optimize images with proper sizing
- Use SQLite indices for frequently queried fields

## Security Considerations

- Use `expo-secure-store` for sensitive data (API keys, tokens)
- Validate all user input with Zod schemas
- Sanitize data before database storage
- Use HTTPS for API calls in production
- Never commit API keys or secrets to repository

## Future Enhancements

Based on feature toggles in profile screen:
- [ ] Workout Programmer (currently implemented)
- [ ] Training Journal (planned)
- [ ] Calendar Sync (planned)

## Troubleshooting

### Common Issues

**Database initialization fails**
- Check if migrations are properly defined
- Verify SQLite is supported on platform
- Check file permissions

**Navigation not working**
- Verify file structure matches Expo Router conventions
- Check `_layout.tsx` configurations
- Ensure typed routes are generated

**Styling issues**
- Use react-native-paper theme for consistency
- Test on both platforms (iOS/Android differences)
- Use flexbox for layouts

**API calls failing**
- Check EXPO_PUBLIC_API_URL environment variable
- Verify network connectivity
- Check CORS configuration for web

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Expo Router](https://expo.github.io/router/docs/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Zod Documentation](https://zod.dev/)

## Contributing

When working with GitHub Copilot:
- Reference this document for project structure and patterns
- Follow established conventions for component and file organization
- Use TypeScript types consistently
- Maintain accessibility standards
- Test changes on multiple platforms
- Update this document when adding major features

---

**Project**: Neural Adapt Mobile
**Version**: 1.0.0
**Last Updated**: November 2025
**Repository**: champmk/app
**Branch**: master
