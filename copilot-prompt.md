# Copilot Agent Prompt: Build React Native AI Workout Programmer

You are building a React Native mobile application using Expo that replicates the AI Workout Programmer functionality from the provided Next.js codebase. This app will run on both iOS and Android, with initial testing on Android.

---

## PROJECT INITIALIZATION

### 1. Create New Expo Project with TypeScript

```bash
npx create-expo-app@latest neural-adapt-mobile --template expo-template-blank-typescript
cd neural-adapt-mobile
```

### 2. Install Core Dependencies

```bash
# Router and navigation
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar

# UI components
npx expo install react-native-paper @react-native-community/datetimepicker
npm install @expo/vector-icons

# Forms and validation
npm install react-hook-form zod

# Database and storage
npx expo install expo-sqlite expo-secure-store expo-file-system
npm install drizzle-orm
npm install -D drizzle-kit

# File handling
npm install xlsx
npx expo install expo-sharing expo-document-picker

# HTTP client
npm install axios

# Date utilities
npm install date-fns
```

---

## PROJECT STRUCTURE

Create this exact folder structure:

```
neural-adapt-mobile/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigation setup
│   │   ├── index.tsx             # Dashboard screen
│   │   ├── generate.tsx          # Workout generation flow
│   │   └── profile.tsx           # User profile/settings
│   ├── plan/
│   │   └── [id].tsx              # Individual plan detail view
│   ├── _layout.tsx               # Root layout with providers
│   └── +not-found.tsx            # 404 screen
├── components/
│   ├── workout/
│   │   ├── WorkoutStepper.tsx    # Multi-step form container
│   │   ├── WorkoutPlanCard.tsx   # Plan summary card
│   │   ├── WorkoutPlanViewer.tsx # Detailed plan viewer
│   │   ├── SessionTable.tsx      # Session display table
│   │   └── WeekSelector.tsx      # Week navigation
│   ├── forms/
│   │   ├── TextAreaInput.tsx     # Textarea with controller
│   │   ├── SelectInput.tsx       # Select dropdown
│   │   ├── MultiSelectInput.tsx  # Multi-select
│   │   └── NumberInput.tsx       # Number input
│   └── ui/
│       ├── LoadingOverlay.tsx    # Full-screen loader
│       ├── ErrorBanner.tsx       # Error display
│       └── EmptyState.tsx        # Empty state component
├── services/
│   ├── api.ts                    # API client setup
│   └── storage.ts                # SQLite operations
├── types/
│   ├── workout.ts                # Workout types
│   ├── database.ts               # Database types
│   └── api.ts                    # API types
├── db/
│   ├── schema.ts                 # Drizzle schema
│   └── migrations.ts             # DB migrations
└── assets/                       # Images and icons
```

---

## CONFIGURATION FILES

### 1. Update package.json

Add expo-router configuration:

```json
{
  "main": "index.ts",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  }
}
```

### 2. Create index.ts

```typescript
import 'expo-router/entry';
```

### 3. Update app.json

```json
{
  "expo": {
    "name": "Neural Adapt",
    "slug": "neural-adapt-mobile",
    "scheme": "neural-adapt",
    "plugins": [
      "expo-router",
      "expo-secure-store"
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

### 4. Create Environment Files

**.env.development**
```
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
EXPO_PUBLIC_ENV=development
```

**.env.production**
```
EXPO_PUBLIC_API_URL=https://your-production-api.vercel.app
EXPO_PUBLIC_ENV=production
```

---

## IMPLEMENTATION GUIDE

### Phase 1: Database & Storage Setup

**File: `db/schema.ts`**
- Define Drizzle ORM schema for workout_plans table
- Define feature_selections table
- Include userId, programName, requestPayload, responsePayload fields

**File: `db/migrations.ts`**
- Create initializeDatabase function
- Set up SQLite database with Drizzle
- Create tables if not exist

**File: `services/storage.ts`**
- Implement getWorkoutPlans()
- Implement getWorkoutPlanById(id)
- Implement saveWorkoutPlan(data)
- Implement deleteWorkoutPlan(id)
- Implement getFeatureSelections()
- Implement updateFeatureSelections(data)

### Phase 2: Type Definitions

**File: `types/workout.ts`**
- Define Zod schemas from reference code
- workoutGenerationSchema: form input validation
- workoutPlanSchema: complete plan structure with nested schemas
- sessionLiftSchema: individual lift structure
- Export TypeScript types from schemas

**File: `types/database.ts`**
- WorkoutPlanRow: database row structure
- StoredWorkoutPlan: hydrated plan with parsed JSON
- FeatureSelectionRow and FeatureSelectionRecord

**File: `types/api.ts`**
- API request/response types
- Error handling types

### Phase 3: Reusable Components

**UI Components (`components/ui/`)**

1. **LoadingOverlay.tsx**
   - Full-screen modal with ActivityIndicator
   - Optional message prop
   - Uses react-native-paper Modal

2. **ErrorBanner.tsx**
   - Dismissible error message banner
   - Uses react-native-paper Banner
   - Auto-dismiss after timeout

3. **EmptyState.tsx**
   - Icon, title, description, and action button
   - Used when no data available
   - Centered layout with proper spacing

**Form Components (`components/forms/`)**

1. **TextAreaInput.tsx**
   - Wraps react-native-paper TextInput
   - Integrates with react-hook-form Controller
   - Multiline prop enabled
   - Error display from form validation

2. **SelectInput.tsx**
   - Dropdown select using Menu component
   - Controller integration
   - Label and error support

3. **MultiSelectInput.tsx**
   - Multiple selection support
   - Chip display for selected items
   - Modal with checkboxes

4. **NumberInput.tsx**
   - Numeric keyboard
   - Min/max validation
   - Step controls (+/- buttons)

**Workout Components (`components/workout/`)**

1. **WorkoutStepper.tsx**
   - Multi-step form navigation
   - Progress indicator
   - Back/Next/Submit buttons
   - Validates current step before proceeding

2. **WorkoutPlanCard.tsx**
   - Summary card for dashboard
   - Shows program name, type, dates
   - Delete button with confirmation
   - Touchable to navigate to detail view

3. **WeekSelector.tsx**
   - Horizontal scroll of week numbers
   - Highlights selected week
   - Smooth scroll to center

4. **SessionTable.tsx**
   - DataTable showing lifts
   - Columns: Exercise, Sets, Reps, Intensity, Rest
   - Expandable for accessory work
   - Responsive layout

5. **WorkoutPlanViewer.tsx**
   - Main detail view component
   - Week selector at top
   - Session cards with SessionTable
   - Athlete profile section
   - Methodology details
   - Phase information
   - Export to Excel functionality

### Phase 4: Screens

**File: `app/_layout.tsx`**
```typescript
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { useEffect } from 'react';
import { initializeDatabase } from '../db/migrations';

export default function RootLayout() {
  useEffect(() => {
    initializeDatabase().catch(console.error);
  }, []);

  return (
    <PaperProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="plan/[id]" options={{ presentation: 'modal' }} />
      </Stack>
    </PaperProvider>
  );
}
```

**File: `app/(tabs)/_layout.tsx`**
- Tab navigator with 3 tabs: Dashboard, Generate, Profile
- MaterialCommunityIcons for tab icons
- Proper tab labels and accessibility

**File: `app/(tabs)/index.tsx` (Dashboard)**
- FlatList of WorkoutPlanCard components
- Load plans from storage on mount
- FAB button to navigate to generate screen
- Pull-to-refresh functionality
- EmptyState when no plans exist
- Delete plan with confirmation dialog

**File: `app/(tabs)/generate.tsx` (Generate Flow)**
- WorkoutStepper with multiple steps:
  1. Basic Info (program name, type, length, frequency)
  2. Athlete Profile (experience, goals, injuries)
  3. Training Details (equipment, focus, session length)
  4. Powerlifting Stats (if applicable)
- Form validation with Zod schemas
- LoadingOverlay during API call
- Error handling with ErrorBanner
- Success: navigate to plan detail view
- Save both request and response to SQLite

**File: `app/(tabs)/profile.tsx`**
- User info display (demo user)
- Feature toggles: Workout Programmer, Journaling, Calendar
- Settings options
- Manage subscription placeholder

**File: `app/plan/[id].tsx` (Plan Detail)**
- Load plan by ID from storage
- WorkoutPlanViewer component
- Export to Excel button
- Share functionality
- Delete plan option in header

### Phase 5: API Integration

**File: `services/api.ts`**
- Axios instance with baseURL from env
- Request interceptors for auth tokens
- Response interceptors for error handling
- generateWorkoutPlan(input: WorkoutRequest): Promise<WorkoutPlan>
- Timeout configuration
- Error parsing and user-friendly messages

### Phase 6: Excel Export

**Implement in WorkoutPlanViewer.tsx**
- Use xlsx library to create workbook
- Multiple sheets: Overview, Weeks, Sessions
- Format with headers and styling
- expo-file-system to save locally
- expo-sharing to share file
- Handle permissions properly

---

## KEY IMPLEMENTATION NOTES

### Database Patterns
- Initialize DB on app load (in root _layout)
- Use Drizzle's select/insert/update/delete
- Parse JSON strings for requestPayload and responsePayload
- Handle migration errors gracefully

### Navigation
- Use `useRouter()` from expo-router
- `router.push()` for navigation
- `router.back()` to go back
- `useLocalSearchParams()` for route params

### State Management
- useState for component state
- useEffect for data loading
- No global state (could add Context if needed)
- Optimistic updates for better UX

### Error Handling
- Try-catch around async operations
- Display errors via ErrorBanner
- Log to console for debugging
- Graceful fallbacks

### Form Validation
- Zod schemas for validation
- react-hook-form for form state
- Controller component for inputs
- Display field-level errors

### Styling
- Use StyleSheet.create()
- react-native-paper theme colors
- Consistent spacing (8, 16, 24)
- Responsive with flexbox
- Platform-specific styles when needed

---

## TESTING CHECKLIST

- [ ] Database initialization works on both iOS/Android
- [ ] All form validations trigger correctly
- [ ] API calls handle success and error states
- [ ] Plans are saved and retrieved correctly
- [ ] Navigation works between all screens
- [ ] Excel export generates proper file
- [ ] Sharing functionality works
- [ ] Delete confirmation prevents accidental deletion
- [ ] Empty states display correctly
- [ ] Loading states show during async operations
- [ ] Error messages are user-friendly
- [ ] Pull-to-refresh updates data
- [ ] Week selector scrolls and highlights properly
- [ ] Session tables display all lift data
- [ ] Feature toggles save preferences

---

## REFERENCE IMPLEMENTATIONS

The `reference/` folder contains example implementations from the Next.js codebase:
- **workouts.ts**: Full workout generation logic and schemas
- **services/workouts.ts**: Backend service implementation
- **services/openai.ts**: OpenAI client setup
- **ModuleOnboarding.tsx**: Onboarding UI patterns
- **workout-plan-viewer.tsx**: Plan display component

Study these files to understand the data structures and business logic. Adapt the patterns for React Native while maintaining the same functionality.

---

## DEVELOPMENT WORKFLOW

1. Start with database setup and types
2. Build reusable UI components
3. Create form components with validation
4. Implement storage service
5. Build dashboard screen
6. Build generate flow with multi-step form
7. Build plan detail view
8. Add API integration
9. Implement Excel export
10. Test thoroughly on Android
11. Test on iOS
12. Polish UI and handle edge cases

---

## COMMON PITFALLS TO AVOID

- Don't forget to initialize database before any storage operations
- Remember Android emulator uses 10.0.2.2 for localhost
- Handle loading and error states for all async operations
- Validate all user input before API calls
- Parse JSON carefully (requestPayload/responsePayload)
- Use proper TypeScript types everywhere
- Test navigation with both push and replace
- Handle keyboard dismissal in forms
- Consider iOS safe areas
- Test on both platforms (styling differences exist)

---

## SUCCESS CRITERIA

The app is complete when:
1. ✅ Users can create workout plans through the generate flow
2. ✅ Plans are saved locally and persist across app restarts
3. ✅ Dashboard displays all saved plans
4. ✅ Plan detail view shows complete program information
5. ✅ Users can export plans to Excel
6. ✅ Users can delete plans with confirmation
7. ✅ Error handling works gracefully
8. ✅ UI is responsive and matches design patterns
9. ✅ All TypeScript types are properly defined
10. ✅ App runs on both iOS and Android

---

**Start building now. Begin with Phase 1 (Database & Storage Setup) and work through each phase systematically.**
