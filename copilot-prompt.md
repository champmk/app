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
│   │   ├── WorkoutPlanViewer.tsx # Full plan display
│   │   ├── SessionTable.tsx      # Individual session display
│   │   └── WeekSelector.tsx      # Week navigation chips
│   ├── forms/
│   │   ├── NumberInput.tsx       # Validated number input
│   │   ├── SelectInput.tsx       # Dropdown/picker
│   │   ├── MultiSelectInput.tsx  # Checkbox group
│   │   └── TextAreaInput.tsx     # Multi-line text
│   └── ui/
│       ├── LoadingOverlay.tsx    # Full-screen loading
│       ├── ErrorBanner.tsx       # Error display
│       └── EmptyState.tsx        # No data placeholder
├── services/
│   ├── api.ts                    # API client configuration
│   ├── workout.ts                # Workout generation API calls
│   └── storage.ts                # Database operations
├── db/
│   ├── schema.ts                 # SQLite table definitions
│   ├── migrations.ts             # Database setup
│   └── queries.ts                # Reusable queries
├── types/
│   ├── workout.ts                # Workout-related types
│   ├── database.ts               # Database types
│   └── api.ts                    # API response types
├── utils/
│   ├── validation.ts             # Zod schemas
│   ├── formatting.ts             # Display formatters
│   └── constants.ts              # App constants
├── hooks/
│   ├── useWorkoutPlans.ts        # Plans data hook
│   ├── useDatabase.ts            # Database hook
│   └── useForm.ts                # Form state hook
├── assets/
│   ├── icon.png
│   ├── splash.png
│   └── adaptive-icon.png
├── .env.development
├── .env.production
├── app.json
├── tsconfig.json
└── package.json
```

---

## CORE IMPLEMENTATION REQUIREMENTS

### PART 1: Type System & Validation Schemas

**File: `types/workout.ts`**

Translate these schemas from the Next.js codebase exactly:
- Copy `workoutGenerationSchema` from `src/server/services/workouts.ts` lines 9-32
- Copy `sessionLiftSchema` from lines 34-76
- Copy `workoutPlanSchema` from lines 77-103
- Export TypeScript types: `WorkoutRequest`, `WorkoutPlan`, `WorkoutSession`, `SessionLift`

**Critical:** Maintain the exact same field names, enums, and validation rules. The mobile app must send requests in the exact format the backend expects.

Example structure:
```typescript
import { z } from 'zod';

export const workoutGenerationSchema = z.object({
  trainingFocus: z.enum(['Bodybuilding', 'Powerlifting', 'Strength', 'Hybrid']),
  experienceLevel: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  sessionsPerWeek: z.coerce.number().min(1).max(7),
  durationWeeks: z.coerce.number().min(1).max(12),
  // ... continue with ALL fields from the original schema
});

export type WorkoutRequest = z.infer<typeof workoutGenerationSchema>;
// ... export all other types
```

**File: `utils/constants.ts`**

Copy these constants from `src/components/ModuleOnboarding.tsx`:
- Training focus options (lines 254-377 in `workoutStepConfigs`)
- Experience level options
- Equipment options
- Default values

---

### PART 2: Database Layer

**File: `db/schema.ts`**

Create SQLite schema mirroring `prisma/schema.prisma`:

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const workoutPlans = sqliteTable('workout_plans', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().default('demo-user'),
  programName: text('program_name').notNull(),
  requestPayload: text('request_payload').notNull(), // JSON string
  responsePayload: text('response_payload'), // JSON string
  artifactPath: text('artifact_path'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const featureSelections = sqliteTable('feature_selections', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().default('demo-user'),
  workoutProgrammer: integer('workout_programmer', { mode: 'boolean' }).default(true),
  journaling: integer('journaling', { mode: 'boolean' }).default(false),
  calendar: integer('calendar', { mode: 'boolean' }).default(false),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});
```

**File: `db/migrations.ts`**

Create database initialization:
```typescript
import * as SQLite from 'expo-sqlite';

export async function initializeDatabase() {
  const db = await SQLite.openDatabaseAsync('neural-adapt.db');
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS workout_plans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'demo-user',
      program_name TEXT NOT NULL,
      request_payload TEXT NOT NULL,
      response_payload TEXT,
      artifact_path TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_user_created ON workout_plans(user_id, created_at DESC);
    
    CREATE TABLE IF NOT EXISTS feature_selections (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL DEFAULT 'demo-user',
      workout_programmer INTEGER DEFAULT 1,
      journaling INTEGER DEFAULT 0,
      calendar INTEGER DEFAULT 0,
      updated_at INTEGER NOT NULL
    );
  `);
  
  return db;
}
```

**File: `services/storage.ts`**

Implement CRUD operations:
```typescript
import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { eq, desc } from 'drizzle-orm';
import { workoutPlans, featureSelections } from '../db/schema';
import type { WorkoutPlan, WorkoutRequest } from '../types/workout';

const db = drizzle(SQLite.openDatabaseSync('neural-adapt.db'));

export async function saveWorkoutPlan(
  request: WorkoutRequest,
  response: WorkoutPlan,
  userId: string = 'demo-user'
) {
  const id = crypto.randomUUID();
  const now = Date.now();
  
  await db.insert(workoutPlans).values({
    id,
    userId,
    programName: response.programName,
    requestPayload: JSON.stringify(request),
    responsePayload: JSON.stringify(response),
    createdAt: new Date(now),
    updatedAt: new Date(now),
  });
  
  return id;
}

export async function getWorkoutPlans(userId: string = 'demo-user') {
  const plans = await db
    .select()
    .from(workoutPlans)
    .where(eq(workoutPlans.userId, userId))
    .orderBy(desc(workoutPlans.createdAt));
  
  return plans.map(plan => ({
    ...plan,
    requestPayload: JSON.parse(plan.requestPayload),
    responsePayload: plan.responsePayload ? JSON.parse(plan.responsePayload) : null,
  }));
}

export async function getWorkoutPlanById(id: string) {
  const plan = await db
    .select()
    .from(workoutPlans)
    .where(eq(workoutPlans.id, id))
    .limit(1);
  
  if (!plan[0]) return null;
  
  return {
    ...plan[0],
    requestPayload: JSON.parse(plan[0].requestPayload),
    responsePayload: plan[0].responsePayload ? JSON.parse(plan[0].responsePayload) : null,
  };
}

export async function deleteWorkoutPlan(id: string) {
  await db.delete(workoutPlans).where(eq(workoutPlans.id, id));
}

export async function getFeatureSelections(userId: string = 'demo-user') {
  const selections = await db
    .select()
    .from(featureSelections)
    .where(eq(featureSelections.userId, userId))
    .limit(1);
  
  return selections[0] || null;
}

export async function updateFeatureSelections(
  selections: Partial<typeof featureSelections.$inferInsert>,
  userId: string = 'demo-user'
) {
  const existing = await getFeatureSelections(userId);
  
  if (existing) {
    await db
      .update(featureSelections)
      .set({ ...selections, updatedAt: new Date() })
      .where(eq(featureSelections.userId, userId));
  } else {
    await db.insert(featureSelections).values({
      id: crypto.randomUUID(),
      userId,
      ...selections,
      updatedAt: new Date(),
    });
  }
}
```

---

### PART 3: API Service Layer

**File: `services/api.ts`**

Create API client that connects to the Next.js backend:

```typescript
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 2 minutes for AI generation
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('[API] Response error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('[API] No response received:', error.request);
    } else {
      console.error('[API] Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);
```

**File: `services/workout.ts`**

Implement workout generation that calls the Next.js backend:

```typescript
import { apiClient } from './api';
import { workoutGenerationSchema, type WorkoutRequest, type WorkoutPlan } from '../types/workout';
import { saveWorkoutPlan } from './storage';

export async function generateWorkoutPlan(request: WorkoutRequest): Promise<{
  plan: WorkoutPlan;
  planId: string;
}> {
  // Validate request locally
  const validated = workoutGenerationSchema.parse(request);
  
  // Call backend API (matches the Next.js server action endpoint)
  const response = await apiClient.post<{
    success: boolean;
    plan: WorkoutPlan;
    artifactPath?: string;
  }>('/api/workout/generate', validated);
  
  if (!response.data.success || !response.data.plan) {
    throw new Error('Failed to generate workout plan');
  }
  
  // Save to local database
  const planId = await saveWorkoutPlan(validated, response.data.plan);
  
  return {
    plan: response.data.plan,
    planId,
  };
}

export async function downloadWorkoutArtifact(planId: string): Promise<string> {
  // Call backend to get artifact
  const response = await apiClient.get(`/api/workout/artifact/${planId}`, {
    responseType: 'blob',
  });
  
  // Save to device and return local path
  // Implementation depends on expo-file-system
  // Return local file URI
  return 'local-file-uri';
}
```

---

### PART 4: UI Components - Form Stepper

**File: `components/workout/WorkoutStepper.tsx`**

Build multi-step form exactly mirroring `src/components/ModuleOnboarding.tsx` lines 415-513:

```typescript
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Text, ProgressBar, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';

export interface WorkoutStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  validate: () => Promise<boolean> | boolean;
  onNext?: () => Promise<void> | void;
}

interface WorkoutStepperProps {
  steps: WorkoutStep[];
  onComplete: () => Promise<void>;
}

export function WorkoutStepper({ steps, onComplete }: WorkoutStepperProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const progress = (currentStep + 1) / steps.length;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;
  
  const handleNext = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      // Add remaining steps...
  ];
  
  const handleComplete = async () => {
    const formData = watch();
    await generateWorkoutPlan(formData);
    // Navigation handled by WorkoutStepper
  };
  
  return <WorkoutStepper steps={steps} onComplete={handleComplete} />;
}
```

---

### PART 7: Plan Viewer Component

**File: `components/workout/WorkoutPlanViewer.tsx`**

Replicate `src/components/workout-plan-viewer.tsx` lines 1-272:

```typescript
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Text, Chip, DataTable, Divider, Surface } from 'react-native-paper';
import type { WorkoutPlan } from '../../types/workout';
import { format } from 'date-fns';

interface WorkoutPlanViewerProps {
  plan: WorkoutPlan;
}

export function WorkoutPlanViewer({ plan }: WorkoutPlanViewerProps) {
  const [selectedWeek, setSelectedWeek] = useState(0);
  
  const currentWeek = plan.weeks[selectedWeek];
  
  return (
    <ScrollView style={styles.container}>
      {/* Program Overview */}
      <Surface style={styles.header} elevation={1}>
        <Text variant="headlineMedium" style={styles.programName}>
          {plan.programName}
        </Text>
        <View style={styles.metadataRow}>
          <Chip icon="calendar" mode="outlined" compact>
            {plan.programType}
          </Chip>
          <Chip icon="dumbbell" mode="outlined" compact>
            {plan.weeks.length} weeks
          </Chip>
          <Chip icon="timer" mode="outlined" compact>
            {plan.weeks[0]?.sessions.length || 0}x/week
          </Chip>
        </View>
      </Surface>
      
      {/* Athlete Profile Section */}
      {plan.athleteProfile && (
        <Card style={styles.card}>
          <Card.Title title="Athlete Profile" />
          <Card.Content>
            <View style={styles.profileRow}>
              <Text variant="labelMedium" style={styles.label}>
                Experience:
              </Text>
              <Text variant="bodyMedium">{plan.athleteProfile.experienceLevel}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text variant="labelMedium" style={styles.label}>
                Training Focus:
              </Text>
              <Text variant="bodyMedium">{plan.athleteProfile.trainingFocus}</Text>
            </View>
            {plan.athleteProfile.trainingAge && (
              <View style={styles.profileRow}>
                <Text variant="labelMedium" style={styles.label}>
                  Training Age:
                </Text>
                <Text variant="bodyMedium">{plan.athleteProfile.trainingAge}</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      )}
      
      {/* Methodology Section */}
      {plan.methodology && (
        <Card style={styles.card}>
          <Card.Title title="Training Methodology" />
          <Card.Content>
            <Text variant="bodyMedium" style={styles.methodologyText}>
              {plan.methodology}
            </Text>
          </Card.Content>
        </Card>
      )}
      
      {/* Monitoring Guidelines */}
      {plan.monitoringGuidelines && (
        <Card style={styles.card}>
          <Card.Title title="Monitoring Guidelines" />
          <Card.Content>
            <Text variant="bodyMedium" style={styles.guidelinesText}>
              {plan.monitoringGuidelines}
            </Text>
          </Card.Content>
        </Card>
      )}
      
      {/* Week Selector */}
      <Surface style={styles.weekSelectorContainer} elevation={0}>
        <Text variant="titleMedium" style={styles.weekSelectorTitle}>
          Select Week
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weekSelector}
        >
          {plan.weeks.map((week, index) => (
            <Chip
              key={week.weekNumber}
              selected={selectedWeek === index}
              onPress={() => setSelectedWeek(index)}
              style={styles.weekChip}
              mode={selectedWeek === index ? 'flat' : 'outlined'}
            >
              Week {week.weekNumber}
            </Chip>
          ))}
        </ScrollView>
      </Surface>
      
      {/* Sessions for Selected Week */}
      <View style={styles.sessionsContainer}>
        {currentWeek.sessions.map((session, sessionIndex) => (
          <Card key={sessionIndex} style={styles.sessionCard}>
            <Card.Title 
              title={session.sessionName}
              subtitle={`Session ${sessionIndex + 1} of ${currentWeek.sessions.length}`}
            />
            <Card.Content>
              {/* Readiness Cues */}
              {session.readinessCues && session.readinessCues.length > 0 && (
                <View style={styles.cuesContainer}>
                  <Text variant="labelMedium" style={styles.cuesLabel}>
                    Readiness Cues:
                  </Text>
                  <Text variant="bodySmall" style={styles.cuesText}>
                    {session.readinessCues.join(', ')}
                  </Text>
                </View>
              )}
              
              {/* Lifts Table */}
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title style={styles.exerciseColumn}>Exercise</DataTable.Title>
                  <DataTable.Title numeric style={styles.smallColumn}>Sets</DataTable.Title>
                  <DataTable.Title numeric style={styles.smallColumn}>Reps</DataTable.Title>
                  <DataTable.Title numeric style={styles.mediumColumn}>Intensity</DataTable.Title>
                </DataTable.Header>
                
                {session.lifts.map((lift, liftIndex) => (
                  <DataTable.Row key={liftIndex}>
                    <DataTable.Cell style={styles.exerciseColumn}>
                      <View>
                        <Text variant="bodyMedium">{lift.exercise}</Text>
                        {lift.notes && (
                          <Text variant="bodySmall" style={styles.liftNotes}>
                            {lift.notes}
                          </Text>
                        )}
                      </View>
                    </DataTable.Cell>
                    <DataTable.Cell numeric style={styles.smallColumn}>
                      {lift.sets}
                    </DataTable.Cell>
                    <DataTable.Cell numeric style={styles.smallColumn}>
                      {lift.reps}
                    </DataTable.Cell>
                    <DataTable.Cell numeric style={styles.mediumColumn}>
                      <Text variant="bodySmall">
                        {lift.intensity || '-'}
                      </Text>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
              
              {/* Additional Session Info */}
              {(lift.tempo || lift.rest) && (
                <View style={styles.sessionFooter}>
                  {lift.tempo && (
                    <Text variant="bodySmall" style={styles.footerText}>
                      Tempo: {lift.tempo}
                    </Text>
                  )}
                  {lift.rest && (
                    <Text variant="bodySmall" style={styles.footerText}>
                      Rest: {lift.rest}
                    </Text>
                  )}
                </View>
              )}
              
              {/* Accessory Work */}
              {session.accessoryWork && session.accessoryWork.length > 0 && (
                <View style={styles.accessoryContainer}>
                  <Divider style={styles.divider} />
                  <Text variant="labelMedium" style={styles.accessoryLabel}>
                    Accessory Work:
                  </Text>
                  {session.accessoryWork.map((accessory, idx) => (
                    <Text key={idx} variant="bodySmall" style={styles.accessoryText}>
                      • {accessory}
                    </Text>
                  ))}
                </View>
              )}
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  programName: {
    fontWeight: '700',
    marginBottom: 12,
  },
  metadataRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  card: {
    margin: 16,
    marginBottom: 0,
  },
  profileRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  label: {
    width: 120,
    color: '#666',
  },
  methodologyText: {
    lineHeight: 22,
    color: '#444',
  },
  guidelinesText: {
    lineHeight: 22,
    color: '#444',
  },
  weekSelectorContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    marginTop: 16,
  },
  weekSelectorTitle: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  weekSelector: {
    paddingHorizontal: 16,
    gap: 8,
  },
  weekChip: {
    marginRight: 0,
  },
  sessionsContainer: {
    padding: 16,
    paddingTop: 8,
  },
  sessionCard: {
    marginBottom: 16,
  },
  cuesContainer: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  cuesLabel: {
    color: '#1565c0',
    marginBottom: 4,
  },
  cuesText: {
    color: '#1976d2',
  },
  exerciseColumn: {
    flex: 2,
  },
  smallColumn: {
    flex: 0.5,
    justifyContent: 'center',
  },
  mediumColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  liftNotes: {
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  sessionFooter: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 16,
  },
  footerText: {
    color: '#666',
  },
  accessoryContainer: {
    marginTop: 12,
  },
  divider: {
    marginBottom: 12,
  },
  accessoryLabel: {
    marginBottom: 8,
    color: '#666',
  },
  accessoryText: {
    color: '#666',
    marginLeft: 8,
    marginBottom: 4,
  },
});
```

---

### PART 8: Dashboard Screen

**File: `app/(tabs)/index.tsx`**

Display list of saved workout plans:

```typescript
import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { FAB, Card, Text, IconButton, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { getWorkoutPlans, deleteWorkoutPlan } from '../../services/storage';
import { EmptyState } from '../../components/ui/EmptyState';
import { format } from 'date-fns';

export default function DashboardScreen() {
  const [plans, setPlans] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    loadPlans();
  }, []);
  
  const loadPlans = async () => {
    try {
      const loadedPlans = await getWorkoutPlans();
      setPlans(loadedPlans);
    } catch (error) {
      console.error('Failed to load plans:', error);
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPlans();
    setRefreshing(false);
  };
  
  const handleDeletePlan = async (planId: string) => {
    try {
      await deleteWorkoutPlan(planId);
      await loadPlans();
    } catch (error) {
      console.error('Failed to delete plan:', error);
    }
  };
  
  const renderPlanCard = ({ item }) => {
    const plan = item.responsePayload;
    const request = item.requestPayload;
    
    return (
      <Card 
        style={styles.card}
        onPress={() => router.push(`/plan/${item.id}`)}
      >
        <Card.Title
          title={plan.programName}
          subtitle={`Created ${format(item.createdAt, 'MMM d, yyyy')}`}
          right={(props) => (
            <IconButton
              {...props}
              icon="delete"
              onPress={() => handleDeletePlan(item.id)}
            />
          )}
        />
        <Card.Content>
          <View style={styles.planMeta}>
            <Text variant="bodySmall" style={styles.metaText}>
              {request.trainingFocus} • {request.experienceLevel}
            </Text>
            <Text variant="bodySmall" style={styles.metaText}>
              {plan.weeks.length} weeks • {request.sessionsPerWeek}x/week
            </Text>
          </View>
        </Card.Content>
      </Card>
    );
  };
  
  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={1}>
        <Text variant="headlineMedium" style={styles.title}>
          My Workout Plans
        </Text>
      </Surface>
      
      {plans.length === 0 ? (
        <EmptyState
          icon="dumbbell"
          title="No Workout Plans Yet"
          description="Create your first AI-powered workout plan to get started"
          actionLabel="Create Plan"
          onAction={() => router.push('/(tabs)/generate')}
        />
      ) : (
        <FlatList
          data={plans}
          renderItem={renderPlanCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
      
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/(tabs)/generate')}
        label="New Plan"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  planMeta: {
    gap: 4,
  },
  metaText: {
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
```

---

### PART 9: Plan Detail Screen

**File: `app/plan/[id].tsx`**

```typescript
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Share, Alert } from 'react-native';
import { Button, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, Stack } from 'expo-router';
import { getWorkoutPlanById } from '../../services/storage';
import { WorkoutPlanViewer } from '../../components/workout/WorkoutPlanViewer';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadPlan();
  }, [id]);
  
  const loadPlan = async () => {
    try {
      const loadedPlan = await getWorkoutPlanById(id as string);
      setPlan(loadedPlan);
    } catch (error) {
      console.error('Failed to load plan:', error);
      Alert.alert('Error', 'Failed to load workout plan');
    } finally {
      setLoading(false);
    }
  };
  
  const handleExport = async () => {
    try {
      // Generate Excel file locally or download from backend
      // Implementation depends on your chosen strategy from Phase 8
      const fileUri = await generateExcelFile(plan.responsePayload);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Sharing not available', 'Unable to share on this device');
      }
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert('Export Failed', 'Could not export workout plan');
    }
  };
  
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my ${plan.responsePayload.programName} workout plan!`,
        title: plan.responsePayload.programName,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  
  if (!plan) {
    return (
      <View style={styles.errorContainer}>
        <Text>Plan not found</Text>
      </View>
    );
  }
  
  return (
    <>
      <Stack.Screen
        options={{
          title: plan.responsePayload.programName,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <Button onPress={handleShare}>Share</Button>
              <Button onPress={handleExport}>Export</Button>
            </View>
          ),
        }}
      />
      <WorkoutPlanViewer plan={plan.responsePayload} />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
});
```

---

### PART 10: Root Layout & Navigation

**File: `app/_layout.tsx`**

```typescript
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { useEffect } from 'react';
import { initializeDatabase } from '../db/migrations';

export default function RootLayout() {
  useEffect(() => {
    // Initialize database on app start
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

```typescript
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="generate"
        options={{
          title: 'Generate',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="plus-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

---

### PART 11: Configuration Files

**File: `app.json`**

```json
{
  "expo": {
    "name": "Neural Adapt",
    "slug": "neural-adapt-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.neuraladapt"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourcompany.neuraladapt",
      "permissions": []
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
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

**File: `.env.development`**

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
EXPO_PUBLIC_ENV=development
```

**File: `.env.production`**

```env
EXPO_PUBLIC_API_URL=https://your-production-api.vercel.app
EXPO_PUBLIC_ENV=production
```

**File: `tsconfig.json`**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
```

---

## CRITICAL IMPLEMENTATION NOTES

### 1. Exact Schema Matching
The TypeScript types and Zod schemas MUST match the Next.js backend exactly. Copy these files directly:
- `src/server/services/workouts.ts` lines 9-103 → `types/workout.ts`
- All enum values must be identical
- All optional fields must remain optional
- Field names must match character-for-character

### 2. API Endpoint Mapping
The backend server action `submitWorkoutGeneration` in `src/app/actions.ts` needs a corresponding API endpoint. You have two options:

**Option A:** Keep using Next.js backend
- Deploy your existing Next.js app to Vercel
- The React Native app calls it via HTTP
- Update `EXPO_PUBLIC_API_URL` to your Vercel URL

**Option B:** Extract to standalone backend
- Create a new Express/Fastify server
- Copy the `generateWorkoutPlan` function from `src/server/services/workouts.ts`
- Create POST endpoint at `/api/workout/generate`

### 3. Android Emulator Network Access
When testing locally:
- Android emulator cannot access `localhost:3000`
- Use `10.0.2.2:3000` instead (this is Android's alias for host machine)
- Update `.env.development` accordingly

### 4. Form Validation Behavior
React Native forms behave differently than web forms:
- No native HTML5 validation
- Must use react-hook-form + Zod for all validation
- Error messages must be explicitly rendered
- Keyboard types must be specified (numeric, email, etc.)

### 5. Step Configuration Mapping
Reference `src/components/ModuleOnboarding.tsx` lines 254-377 for the exact step configuration:
```typescript
const workoutStepConfigs = [
  {
    id: 'training-focus',
    title: 'Training Focus',
    description: 'Select your primary training goal...',
    // Copy description text exactly
  },
  // ... all other steps
];
```

### 6. Conditional 1RM Fields
The Powerlifting focus requires optional 1RM stats (lines 101-125 in `actions.ts`):
```typescript
if (trainingFocus === 'Powerlifting') {
  // Show additional fields for squat1RM, bench1RM, deadlift1RM
  // These should be optional number inputs
}
```

### 7. Excel Artifact Strategy
Choose one approach:

**Backend Generation (Recommended):**
- Keep `createWorkoutArtifact` in Next.js backend
- Backend returns a download URL
- React Native downloads and shares the file

**Client Generation:**
- Use `xlsx` library in React Native
- Generate Excel file locally
- More complex but works offline

### 8. Error Handling Standards
All async operations must have try-catch blocks:
```typescript
try {
  const result = await generateWorkoutPlan(data);
  // success flow
} catch (error) {
  if (error.response?.status === 429) {
    // Rate limit error
    Alert.alert('Rate Limit', 'Please try again in a few minutes');
  } else if (error.response?.status === 500) {
    // Server error
    Alert.alert('Server Error', 'Failed to generate plan. Please try again.');
  } else {
    // Generic error
    Alert.alert('Error', error.message || 'Something went wrong');
  }
}
```

### 9. Loading States
Every API call must show loading indicator:
```typescript
const [isGenerating, setIsGenerating] = useState(false);

const handleGenerate = async () => {
  setIsGenerating(true);
  try {
    await generateWorkoutPlan(data);
  } finally {
    setIsGenerating(false);
  }
};
```

### 10. Performance Optimization
- Use `React.memo` on `WorkoutPlanCard` components
- Use `FlatList` for plan lists (not `ScrollView`)
- Implement pagination if user has >20 plans
- Cache workout plans in memory with React Query or SWR

---

## TESTING CHECKLIST

Before considering the app complete, verify:

- [ ] All form steps navigate correctly
- [ ] Validation shows appropriate error messages
- [ ] Back button preserves form data
- [ ] API calls succeed with valid data
- [ ] API calls fail gracefully with invalid data
- [ ] Generated plans save to local database
- [ ] Plans persist after app restart
- [ ] Plan list shows all saved plans
- [ ] Plan detail view displays all workout data
- [ ] Week selector changes visible sessions
- [ ] Session tables show all lift details
- [ ] Delete plan removes from database and UI
- [ ] Export button creates shareable file
- [ ] App handles network errors gracefully
- [ ] App handles low/no internet connectivity
- [ ] Loading indicators show during operations
- [ ] Keyboard dismisses when tapping outside inputs
- [ ] ScrollViews scroll smoothly without lag
- [ ] No console errors or warnings

---

## BUILD & DEPLOYMENT COMMANDS

### Development Build
```bash
# Start development server
npx expo start

# Run on Android emulator
npx expo start --android

# Run on iOS simulator (Mac only)
npx expo start --ios

# Clear cache if issues arise
npx expo start -c
```

### Production Build
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure EAS
eas build:configure

# Build for Android (creates APK/AAB)
eas build --profile production --platform android

# Build for iOS (creates IPA)
eas build --profile production --platform ios

# Submit to Google Play
eas submit --platform android

# Submit to App Store
eas submit --platform ios
```

---

## EXPECTED FILE SIZES

After implementation:
- **node_modules**: ~400-500 MB
- **App size (dev build)**: ~50-80 MB
- **App size (production)**: ~20-30 MB
- **Local database**: <1 MB (even with 50+ plans)

---

## FINAL VALIDATION

The app is complete when:
1. ✅ You can generate a workout plan from start to finish
2. ✅ The generated plan saves to the database
3. ✅ You can view the plan in the dashboard
4. ✅ You can open and view all weeks/sessions
5. ✅ You can delete a plan
6. ✅ The app works after closing and reopening
7. ✅ The app builds successfully with `eas build`
8. ✅ The APK installs and runs on a physical Android device

---

## SUCCESS CRITERIA

This React Native app successfully replicates the Next.js AI Workout Programmer when:

- User experience matches the web version (same steps, same validation, same output)
- All API requests use identical payloads to the Next.js backend
- Generated plans have the exact same structure as the web version
- The app works offline for viewing saved plans
- The app can generate new plans when online
- All TypeScript types are properly enforced
- No runtime errors or crashes occur during normal use
- The app passes basic security review (no exposed API keys, proper permissions)

---

## IMPLEMENTATION ORDER

Build in this exact sequence to minimize debugging:

1. ✅ Project setup + dependencies
2. ✅ Types and validation schemas (copy from web)
3. ✅ Database schema and storage layer
4. ✅ API client configuration
5. ✅ Simple form inputs (one at a time)
6. ✅ Stepper component (start with 2 steps)
7. ✅ Full generation flow (all steps)
8. ✅ API integration and error handling
9. ✅ Dashboard list view
10. ✅ Plan detail viewer
11. ✅ Polish (loading states, empty states, error messages)
12. ✅ Testing on Android emulator
13. ✅ Production build and deployment

Building in this order ensures each piece works before adding complexity.

---

## COMMON PITFALLS TO AVOID

### ❌ DON'T:
- Use `localStorage` or `sessionStorage` (doesn't exist in React Native)
- Use CSS or HTML elements (`<div>`, `<span>`, `className`)
- Import Next.js-specific modules (`next/navigation`, `next/image`)
- Use `window` object without checking if it exists
- Forget to handle keyboard dismissal on mobile
- Use absolute positioning without considering safe areas
- Ignore Android back button behavior
- Use synchronous database operations (always use async/await)

### ✅ DO:
- Use React Native's `<View>`, `<Text>`, `<ScrollView>` components
- Use `StyleSheet.create()` for all styling
- Use Expo's built-in APIs (`expo-sqlite`, `expo-file-system`, etc.)
- Handle loading and error states explicitly
- Test on physical devices (emulators can hide issues)
- Use `KeyboardAvoidingView` on forms
- Respect safe areas with `react-native-safe-area-context`
- Implement proper error boundaries

---

## ENVIRONMENT VARIABLES SETUP

Create these files in your project root:

**`.env.development`** (for testing with local backend):
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000
EXPO_PUBLIC_OPENAI_KEY=
EXPO_PUBLIC_ENV=development
```

**`.env.production`** (for deployed backend):
```env
EXPO_PUBLIC_API_URL=https://your-app.vercel.app
EXPO_PUBLIC_ENV=production
```

**IMPORTANT:** Never commit API keys. The OpenAI key should stay server-side only.

---

## DEBUGGING TOOLS

Install these for easier development:

```bash
# React Native Debugger (standalone app)
# Download from: https://github.com/jhen0409/react-native-debugger

# Flipper (Meta's debugging platform)
# Download from: https://fbflipper.com

# Reactotron (development tool)
npm install --save-dev reactotron-react-native
```

Enable debugging in your app:
```typescript
// Only in development
if (__DEV__) {
  import('./ReactotronConfig').then(() => console.log('Reactotron Configured'));
}
```

---

## PERFORMANCE MONITORING

Add basic performance tracking:

```typescript
// utils/performance.ts
export function measureAPICall(name: string) {
  const start = Date.now();
  
  return () => {
    const duration = Date.now() - start;
    console.log(`[Performance] ${name}: ${duration}ms`);
    
    if (duration > 5000) {
      console.warn(`[Performance] Slow API call: ${name} took ${duration}ms`);
    }
  };
}

// Usage
const done = measureAPICall('generateWorkoutPlan');
await generateWorkoutPlan(data);
done();
```

---

## ADDITIONAL FEATURES TO CONSIDER (POST-MVP)

Once the core functionality works, consider adding:

1. **Offline Mode**
   - Queue workout generation requests when offline
   - Sync when connection returns

2. **Push Notifications**
   - Remind users to complete workouts
   - Notify when plan generation completes

3. **Progress Tracking**
   - Log completed workouts
   - Track weight progression
   - Show performance charts

4. **Social Features**
   - Share plans with friends
   - Community workout library

5. **In-App Purchases**
   - Premium features (unlimited plans, advanced analytics)
   - Remove ads

6. **Biometric Authentication**
   - Fingerprint/Face ID for app access

7. **Apple Watch / Wear OS Integration**
   - View workouts on smartwatch
   - Track sets/reps during workout

---

## ACCESSIBILITY REQUIREMENTS

Ensure the app is accessible:

```typescript
// Add accessibility labels
<Button
  accessibilityLabel="Generate workout plan"
  accessibilityHint="Creates a new AI-powered workout program"
  onPress={handleGenerate}
>
  Generate
</Button>

// Use proper heading hierarchy
<Text accessibilityRole="header" accessibilityLevel={1}>
  {plan.programName}
</Text>

// Provide text alternatives for icons
<IconButton
  icon="delete"
  accessibilityLabel="Delete workout plan"
  onPress={handleDelete}
/>
```

---

## STORE LISTING REQUIREMENTS

Prepare these for app store submission:

### Google Play Store
- **Short description** (80 chars): "AI-powered workout plans tailored to your goals"
- **Full description** (4000 chars): Detailed app description
- **Screenshots**: 2-8 screenshots (phone + tablet if supported)
- **Feature graphic**: 1024x500px banner image
- **App icon**: 512x512px
- **Privacy policy URL**: Required
- **Content rating**: Complete questionnaire

### Apple App Store
- **Subtitle** (30 chars): "Personalized Training Programs"
- **Description** (4000 chars): Same as Google Play
- **Keywords** (100 chars): "workout,fitness,training,gym,ai,planner"
- **Screenshots**: 
  - iPhone 6.5": 1242x2688px (3-10 images)
  - iPhone 5.5": 1242x2208px
  - iPad Pro 12.9": 2048x2732px (if supporting tablets)
- **App icon**: 1024x1024px
- **Privacy policy URL**: Required
- **App review notes**: Instructions for testing

---

## POST-LAUNCH MONITORING

Set up these services (all have free tiers):

1. **Sentry** - Error tracking
```bash
npm install @sentry/react-native
npx sentry-wizard -i reactNative -p ios android
```

2. **Analytics** - Usage tracking
```bash
npx expo install expo-firebase-analytics
# OR
npm install @amplitude/analytics-react-native
```

3. **Crash Reporting** - Built into Expo
```bash
# Automatically enabled with EAS builds
# View in Expo dashboard
```

---

## BUDGET ESTIMATION

**Development Costs:**
- Your time: ~160 hours (8 weeks × 20 hrs/week)

**Service Costs (Monthly):**
- Expo EAS Build: $0 (free tier) or $29/month (hobby)
- Vercel Backend: $0 (free tier)
- OpenAI API: ~$10-50 (depends on usage)
- Database: $0 (SQLite local) or $5-25 (cloud)
- Analytics: $0 (free tier)
- Error Tracking: $0 (free tier)

**One-Time Costs:**
- Google Play Store: $25 (lifetime)
- Apple Developer: $99/year
- App icon design: $50-200 (Fiverr/Upwork)

**Total First Year: ~$200-400**

---

## LEGAL REQUIREMENTS

### Privacy Policy (Required)
Must include:
- What data you collect (user inputs, workout data)
- How you use it (generate plans, store locally)
- Third-party services (OpenAI API)
- Data retention (how long you keep data)
- User rights (delete account, export data)

Use a generator like:
- https://www.privacypolicies.com
- https://app-privacy-policy-generator.firebaseapp.com

### Terms of Service
Should include:
- Acceptable use policy
- Liability limitations (not medical advice)
- Subscription terms (if applicable)
- Account termination policy

### App Store Compliance
- No medical claims without FDA approval
- Clear that it's for educational/informational purposes
- Disclaimer: "Consult physician before starting any exercise program"

---

## FINAL CHECKLIST BEFORE SUBMISSION

### Technical
- [ ] App builds successfully with EAS
- [ ] No console errors or warnings in production build
- [ ] App size is under 100MB
- [ ] All features work on Android 5.0+ (API 21+)
- [ ] All features work on iOS 13.0+
- [ ] App handles poor network conditions gracefully
- [ ] App works in airplane mode (for viewing saved plans)
- [ ] Deep links work correctly (if implemented)
- [ ] Push notifications work (if implemented)

### Legal
- [ ] Privacy policy published and linked in app
- [ ] Terms of service published and linked in app
- [ ] Health disclaimer included
- [ ] Age gate if collecting data from minors
- [ ] Cookie consent (if using analytics)

### Design
- [ ] App follows platform design guidelines (Material Design for Android, Human Interface Guidelines for iOS)
- [ ] All text is readable (minimum 12pt font)
- [ ] Touch targets are minimum 44x44 points
- [ ] Color contrast meets WCAG AA standards
- [ ] App is usable in light and dark mode
- [ ] App respects system text size settings

### Content
- [ ] All placeholder text removed
- [ ] All TODO comments addressed
- [ ] All console.log statements removed from production
- [ ] Test accounts/data removed
- [ ] App store screenshots are accurate
- [ ] App description is clear and accurate

---

## SUCCESS METRICS TO TRACK

Once launched, monitor:

1. **Technical Metrics**
   - Crash rate (target: <0.1%)
   - API success rate (target: >99%)
   - App load time (target: <2 seconds)
   - Plan generation time (target: <30 seconds)

2. **User Engagement**
   - Daily active users (DAU)
   - Plans generated per user
   - Plans completed/tracked
   - Retention rate (D1, D7, D30)

3. **Quality Metrics**
   - App store rating (target: >4.5 stars)
   - Review sentiment
   - Support ticket volume
   - Uninstall rate

---

## WHEN TO CALL IT DONE

The app is production-ready when:

1. ✅ All features from the web version work
2. ✅ App has been tested on 3+ physical devices
3. ✅ No critical bugs in the last week of testing
4. ✅ Privacy policy and terms are published
5. ✅ Store listings are complete with screenshots
6. ✅ Error tracking is configured
7. ✅ Backend is deployed and stable
8. ✅ You've generated 10+ test workouts successfully
9. ✅ Friends/family can use it without your help
10. ✅ You're proud to show it to people

**Don't wait for perfection.** Ship when it's good enough, then iterate based on user feedback.

---

## YOUR FIRST DAY ACTION ITEMS

Right now, in the next hour, do this:

1. ✅ Install Android Studio and set up an emulator (30 min)
2. ✅ Run `npx create-expo-app` and see "Hello World" (10 min)
3. ✅ Create a simple button that shows an alert (10 min)
4. ✅ Deploy your existing Next.js app to Vercel (10 min)

By the end of today, you should have:
- Working Android emulator
- Basic React Native app running
- Backend deployed and accessible
- Confidence that this is achievable

**Start now. Build iteratively. Ship fast. 🚀** Validate current step
      const isValid = await steps[currentStep].validate();
      if (!isValid) {
        setIsLoading(false);
        return;
      }
      
      // Execute step-specific logic
      if (steps[currentStep].onNext) {
        await steps[currentStep].onNext!();
      }
      
      if (isLastStep) {
        // Final submission
        await onComplete();
        router.replace('/(tabs)');
      } else {
        // Move to next step
        setCurrentStep(currentStep + 1);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBack = () => {
    if (!isFirstStep) {
      setError(null);
      setCurrentStep(currentStep - 1);
    }
  };
  
  const CurrentStepComponent = steps[currentStep].component;
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Progress Bar */}
      <Surface style={styles.header} elevation={1}>
        <View style={styles.progressContainer}>
          <Text variant="labelSmall" style={styles.stepCounter}>
            Step {currentStep + 1} of {steps.length}
          </Text>
          <ProgressBar progress={progress} style={styles.progressBar} />
        </View>
      </Surface>
      
      {/* Step Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="headlineMedium" style={styles.title}>
          {steps[currentStep].title}
        </Text>
        <Text variant="bodyMedium" style={styles.description}>
          {steps[currentStep].description}
        </Text>
        
        {error && (
          <Surface style={styles.errorBanner} elevation={0}>
            <Text style={styles.errorText}>{error}</Text>
          </Surface>
        )}
        
        <CurrentStepComponent />
      </ScrollView>
      
      {/* Navigation Buttons */}
      <Surface style={styles.footer} elevation={2}>
        <View style={styles.buttonContainer}>
          {!isFirstStep && (
            <Button 
              mode="outlined" 
              onPress={handleBack}
              disabled={isLoading}
              style={styles.button}
            >
              Back
            </Button>
          )}
          <Button 
            mode="contained" 
            onPress={handleNext}
            loading={isLoading}
            disabled={isLoading}
            style={[styles.button, styles.nextButton]}
          >
            {isLastStep ? 'Generate Workout' : 'Next'}
          </Button>
        </View>
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
  },
  progressContainer: {
    padding: 16,
  },
  stepCounter: {
    marginBottom: 8,
    color: '#666',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    marginBottom: 8,
    fontWeight: '600',
  },
  description: {
    marginBottom: 24,
    color: '#666',
    lineHeight: 22,
  },
  errorBanner: {
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#c00',
  },
  errorText: {
    color: '#c00',
  },
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  button: {
    flex: 1,
  },
  nextButton: {
    // Primary button gets more prominence
  },
});
```

---

### PART 5: Form Input Components

**File: `components/forms/NumberInput.tsx`**

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { Controller, Control } from 'react-hook-form';

interface NumberInputProps {
  control: Control<any>;
  name: string;
  label: string;
  rules?: any;
  error?: any;
  min?: number;
  max?: number;
  helperText?: string;
}

export function NumberInput({ 
  control, 
  name, 
  label, 
  rules, 
  error,
  min,
  max,
  helperText 
}: NumberInputProps) {
  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              label={label}
              value={value?.toString() || ''}
              onChangeText={(text) => {
                const num = parseInt(text) || 0;
                if (min !== undefined && num < min) return;
                if (max !== undefined && num > max) return;
                onChange(text ? parseInt(text) : '');
              }}
              onBlur={onBlur}
              keyboardType="number-pad"
              mode="outlined"
              error={!!error}
              right={
                (min !== undefined && max !== undefined) ? (
                  <TextInput.Affix text={`${min}-${max}`} />
                ) : null
              }
            />
            {helperText && !error && (
              <HelperText type="info">{helperText}</HelperText>
            )}
            {error && (
              <HelperText type="error">{error.message}</HelperText>
            )}
          </>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
});
```

**File: `components/forms/SelectInput.tsx`**

```typescript
import React, { useState } from 'react';
import { View, StyleSheet, Modal, FlatList, TouchableOpacity } from 'react-native';
import { TextInput, HelperText, List, Divider } from 'react-native-paper';
import { Controller, Control } from 'react-hook-form';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectInputProps {
  control: Control<any>;
  name: string;
  label: string;
  options: SelectOption[];
  rules?: any;
  error?: any;
  helperText?: string;
}

export function SelectInput({
  control,
  name,
  label,
  options,
  rules,
  error,
  helperText,
}: SelectInputProps) {
  const [modalVisible, setModalVisible] = useState(false);
  
  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field: { onChange, value } }) => (
          <>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <TextInput
                label={label}
                value={options.find(opt => opt.value === value)?.label || ''}
                editable={false}
                mode="outlined"
                error={!!error}
                right={<TextInput.Icon icon="chevron-down" />}
                pointerEvents="none"
              />
            </TouchableOpacity>
            
            {helperText && !error && (
              <HelperText type="info">{helperText}</HelperText>
            )}
            {error && (
              <HelperText type="error">{error.message}</HelperText>
            )}
            
            <Modal
              visible={modalVisible}
              animationType="slide"
              transparent
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <List.Item
                    title="Select an option"
                    right={props => (
                      <List.Icon {...props} icon="close" onPress={() => setModalVisible(false)} />
                    )}
                  />
                  <Divider />
                  <FlatList
                    data={options}
                    keyExtractor={(item) => item.value}
                    renderItem={({ item }) => (
                      <List.Item
                        title={item.label}
                        onPress={() => {
                          onChange(item.value);
                          setModalVisible(false);
                        }}
                        left={props => 
                          value === item.value ? 
                            <List.Icon {...props} icon="check" /> : 
                            null
                        }
                      />
                    )}
                  />
                </View>
              </View>
            </Modal>
          </>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
});
```

**File: `components/forms/MultiSelectInput.tsx`**

Similar pattern for checkbox groups - implement multi-select for equipment options.

---

### PART 6: Workout Generation Screen

**File: `app/(tabs)/generate.tsx`**

This is the main screen that uses the stepper. Reference `src/components/ModuleOnboarding.tsx` lines 254-377 for step configurations:

```typescript
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { WorkoutStepper, WorkoutStep } from '../../components/workout/WorkoutStepper';
import { NumberInput } from '../../components/forms/NumberInput';
import { SelectInput } from '../../components/forms/SelectInput';
import { MultiSelectInput } from '../../components/forms/MultiSelectInput';
import { workoutGenerationSchema, type WorkoutRequest } from '../../types/workout';
import { generateWorkoutPlan } from '../../services/workout';
import { View } from 'react-native';

export default function GenerateScreen() {
  const { control, handleSubmit, watch, formState: { errors } } = useForm<WorkoutRequest>({
    resolver: zodResolver(workoutGenerationSchema),
    defaultValues: {
      trainingFocus: 'Bodybuilding',
      experienceLevel: 'Intermediate',
      sessionsPerWeek: 4,
      durationWeeks: 8,
      includeDeload: true,
      equipment: [],
      limitations: '',
    },
  });
  
  const trainingFocus = watch('trainingFocus');
  
  // Step 1: Training Focus
  const TrainingFocusStep = () => (
    <SelectInput
      control={control}
      name="trainingFocus"
      label="Training Focus"
      options={[
        { label: 'Bodybuilding', value: 'Bodybuilding' },
        { label: 'Powerlifting', value: 'Powerlifting' },
        { label: 'Strength', value: 'Strength' },
        { label: 'Hybrid', value: 'Hybrid' },
      ]}
      rules={{ required: 'Training focus is required' }}
      error={errors.trainingFocus}
      helperText="Choose your primary training goal"
    />
  );
  
  // Step 2: Experience Level
  const ExperienceLevelStep = () => (
    <SelectInput
      control={control}
      name="experienceLevel"
      label="Experience Level"
      options={[
        { label: 'Beginner (< 1 year)', value: 'Beginner' },
        { label: 'Intermediate (1-3 years)', value: 'Intermediate' },
        { label: 'Advanced (3+ years)', value: 'Advanced' },
      ]}
      rules={{ required: 'Experience level is required' }}
      error={errors.experienceLevel}
      helperText="How long have you been training consistently?"
    />
  );
  
  // Step 3: Training Frequency
  const FrequencyStep = () => (
    <View>
      <NumberInput
        control={control}
        name="sessionsPerWeek"
        label="Sessions Per Week"
        min={1}
        max={7}
        rules={{ 
          required: 'Sessions per week is required',
          min: { value: 1, message: 'Minimum 1 session' },
          max: { value: 7, message: 'Maximum 7 sessions' },
        }}
        error={errors.sessionsPerWeek}
        helperText="How many days per week can you train?"
      />
      
      <NumberInput
        control={control}
        name="durationWeeks"
        label="Program Duration (weeks)"
        min={1}
        max={12}
        rules={{ 
          required: 'Duration is required',
          min: { value: 1, message: 'Minimum 1 week' },
          max: { value: 12, message: 'Maximum 12 weeks' },
        }}
        error={errors.durationWeeks}
        helperText="Total length of the training program"
      />
    </View>
  );
  
  // Step 4: Equipment & Preferences
  // Implement equipment multi-select, deload toggle, limitations text area
  
  // Step 5: 1RM Stats (conditional on trainingFocus === 'Powerlifting')
  // Implement conditional rendering based on trainingFocus
  
  const steps: WorkoutStep[] = [
    {
      id: 'training-focus',
      title: 'Training Focus',
      description: 'Select your primary training goal to customize your program',
      component: TrainingFocusStep,
      validate: () => !!watch('trainingFocus'),
    },
    {
      id: 'experience',
      title: 'Experience Level',
      description: 'Help us tailor the program to your training history',
      component: ExperienceLevelStep,
      validate: () => !!watch('experienceLevel'),
    },
    {
      id: 'frequency',
      title: 'Training Schedule',
      description: 'Define your weekly training commitment',
      component: FrequencyStep,
      validate: () => {
        const sessions = watch('sessionsPerWeek');
        const weeks = watch('durationWeeks');
        return sessions >= 1 && sessions <= 7 && weeks >= 1 && weeks <= 12;
      },
    },
    //