import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Chip, Divider, Surface, Text } from 'react-native-paper';

import type { WorkoutPlan, WorkoutSession } from '../../types/workout';
import { SessionTable } from './SessionTable';
import { WeekSelector } from './WeekSelector';

interface WorkoutPlanViewerProps {
  plan: WorkoutPlan;
}

export function WorkoutPlanViewer({ plan }: WorkoutPlanViewerProps) {
  const [activeWeek, setActiveWeek] = useState(() => (plan.weeks.length > 0 ? plan.weeks[0].week : null));

  const selectedWeek = useMemo(() => {
    if (activeWeek == null) {
      return null;
    }

    return plan.weeks.find((week) => week.week === activeWeek) ?? null;
  }, [activeWeek, plan.weeks]);

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header} elevation={1}>
        <Text variant="headlineMedium" style={styles.programName}>
          {plan.programName}
        </Text>
        <Text variant="bodyMedium" style={styles.subheading}>
          {plan.trainingFocus} • {plan.programType}
        </Text>
        <Text variant="labelMedium" style={styles.timeline}>
          {plan.startDate} to {plan.endDate} • {plan.cycleLengthWeeks} weeks
        </Text>
        <View style={styles.chipRow}>
          <Chip mode="outlined">{plan.methodology.periodizationModel}</Chip>
          <Chip mode="outlined">{plan.methodology.volumeStrategy}</Chip>
          <Chip mode="outlined">{plan.methodology.intensityStrategy}</Chip>
          <Chip mode="outlined">{plan.methodology.frequencyStrategy}</Chip>
        </View>
      </Surface>

      <View style={styles.contentGrid}>
        <View style={styles.primaryColumn}>
          <Card style={styles.card}>
            <Card.Title title="Methodology" subtitle="How the block is structured" />
            <Card.Content style={styles.methodologyContent}>
              <View style={styles.methodologyItem}>
                <Text variant="labelMedium" style={styles.label}>
                  Periodization
                </Text>
                <Text variant="bodyMedium">{plan.methodology.periodizationModel}</Text>
              </View>
              <View style={styles.methodologyItem}>
                <Text variant="labelMedium" style={styles.label}>
                  Volume Strategy
                </Text>
                <Text variant="bodyMedium">{plan.methodology.volumeStrategy}</Text>
              </View>
              <View style={styles.methodologyItem}>
                <Text variant="labelMedium" style={styles.label}>
                  Intensity Strategy
                </Text>
                <Text variant="bodyMedium">{plan.methodology.intensityStrategy}</Text>
              </View>
              <View style={styles.methodologyItem}>
                <Text variant="labelMedium" style={styles.label}>
                  Frequency Strategy
                </Text>
                <Text variant="bodyMedium">{plan.methodology.frequencyStrategy}</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Title title="Training Phases" subtitle="How adaptation progresses" />
            <Card.Content>
              {plan.phases.map((phase) => (
                <View key={phase.name} style={styles.phaseCard}>
                  <Text variant="titleSmall" style={styles.phaseTitle}>
                    {phase.name}
                  </Text>
                  <Text variant="bodySmall" style={styles.phaseSubtitle}>
                    Weeks {phase.startWeek} - {phase.endWeek}
                    {phase.deloadWeek != null ? ` • Deload: Week ${phase.deloadWeek}` : ''}
                  </Text>
                  <Text variant="labelSmall" style={styles.phaseLabel}>
                    Objectives
                  </Text>
                  {phase.objectives.map((objective) => (
                    <Text key={objective} variant="bodySmall" style={styles.phaseListItem}>
                      • {objective}
                    </Text>
                  ))}
                  <Text variant="labelSmall" style={[styles.phaseLabel, styles.phaseLabelMargin]}>
                    Key Metrics
                  </Text>
                  {phase.keyMetrics.map((metric) => (
                    <Text key={metric} variant="bodySmall" style={styles.phaseListItem}>
                      • {metric}
                    </Text>
                  ))}
                </View>
              ))}
            </Card.Content>
          </Card>
        </View>

        <View style={styles.secondaryColumn}>
          <Card style={styles.card}>
            <Card.Title title="Athlete Profile" />
            <Card.Content>
              <Text variant="bodyMedium" style={styles.profileSummary}>
                {plan.athleteProfile.summary}
              </Text>
              <Text variant="labelSmall" style={styles.sectionHeading}>
                Primary Goals
              </Text>
              {plan.athleteProfile.primaryGoals.map((goal) => (
                <Text key={goal} variant="bodySmall" style={styles.listItem}>
                  • {goal}
                </Text>
              ))}
              {plan.athleteProfile.constraints?.length ? (
                <>
                  <Text variant="labelSmall" style={styles.sectionHeading}>
                    Constraints
                  </Text>
                  {plan.athleteProfile.constraints.map((constraint) => (
                    <Text key={constraint} variant="bodySmall" style={styles.listItem}>
                      • {constraint}
                    </Text>
                  ))}
                </>
              ) : null}
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Title title="Monitoring Playbook" />
            <Card.Content>
              <Text variant="labelSmall" style={styles.sectionHeading}>
                Readiness Checks
              </Text>
              {plan.monitoring.readinessChecks.map((item) => (
                <Text key={item} variant="bodySmall" style={styles.listItem}>
                  • {item}
                </Text>
              ))}
              <Text variant="labelSmall" style={styles.sectionHeading}>
                Nutrition Focus
              </Text>
              {plan.monitoring.nutritionFocus.map((item) => (
                <Text key={item} variant="bodySmall" style={styles.listItem}>
                  • {item}
                </Text>
              ))}
              <Text variant="labelSmall" style={styles.sectionHeading}>
                Recovery Protocols
              </Text>
              {plan.monitoring.recoveryProtocols.map((item) => (
                <Text key={item} variant="bodySmall" style={styles.listItem}>
                  • {item}
                </Text>
              ))}
            </Card.Content>
          </Card>

          <Card style={styles.card}>
            <Card.Title title="Coaching Notes" />
            <Card.Content>
              {plan.coachingNotes.map((note) => (
                <Text key={note} variant="bodySmall" style={styles.noteItem}>
                  {note}
                </Text>
              ))}
            </Card.Content>
          </Card>
        </View>
      </View>

      <Surface style={styles.weekSelectorContainer} elevation={0}>
        <WeekSelector
          weeks={plan.weeks.map((week) => ({ weekNumber: week.week }))}
          selectedIndex={activeWeek == null ? -1 : plan.weeks.findIndex((week) => week.week === activeWeek)}
          onSelect={(index) => setActiveWeek(plan.weeks[index]?.week ?? null)}
        />
      </Surface>

      {selectedWeek ? (
        <View style={styles.weekOverview}>
          <Card style={styles.weekCard}>
            <Card.Content>
              <View style={styles.weekHeader}>
                <View>
                  <Text variant="titleMedium" style={styles.weekTitle}>
                    Week {selectedWeek.week}
                  </Text>
                  <Text variant="bodySmall" style={styles.weekFocus}>
                    {selectedWeek.focus}
                  </Text>
                </View>
                <Text variant="bodySmall" style={styles.weekOutcomes}>
                  Key outcomes: {selectedWeek.keyOutcomes.join(' | ')}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {selectedWeek.sessions.map((session) => (
            <Card key={`${selectedWeek.week}-${session.day}`} style={styles.sessionCard}>
              <Card.Content>
                <View style={styles.sessionHeader}>
                  <View>
                    <Text variant="titleSmall" style={styles.sessionDay}>
                      {session.day}
                    </Text>
                    <Text variant="bodySmall" style={styles.sessionEmphasis}>
                      {session.emphasis}
                    </Text>
                  </View>
                  <Text variant="labelSmall" style={styles.sessionDuration}>
                    {session.sessionMinutes} minutes
                  </Text>
                </View>

                {session.readinessCues.length > 0 && (
                  <Text variant="bodySmall" style={styles.readinessText}>
                    Readiness cues: {session.readinessCues.join(' | ')}
                  </Text>
                )}

                <Divider style={styles.divider} />
                <Text variant="labelSmall" style={styles.sectionHeading}>
                  Main Lifts
                </Text>
                <SessionTable lifts={session.mainLifts} />

                {renderAccessoryWork(session)}
                {renderConditioning(session)}
                {renderRecovery(session)}
              </Card.Content>
            </Card>
          ))}
        </View>
      ) : (
        <View style={styles.emptyWeekContainer}>
          <Text variant="bodyMedium" style={styles.emptyWeekText}>
            Select a week to review detailed session breakdowns.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function renderAccessoryWork(session: WorkoutSession) {
  if (!session.accessoryWork.length) {
    return null;
  }

  return (
    <View style={styles.sectionSpacing}>
      <Text variant="labelSmall" style={styles.sectionHeading}>
        Accessory Focus
      </Text>
      {session.accessoryWork.map((accessory) => (
        <View key={accessory.name} style={styles.textBlock}>
          <Text variant="bodyMedium" style={styles.listItemStrong}>
            {accessory.name}
          </Text>
          <Text variant="bodySmall" style={styles.listItem}>
            {accessory.sets} x {accessory.reps}
          </Text>
          {accessory.notes ? (
            <Text variant="bodySmall" style={styles.listItem}>
              {accessory.notes}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function renderConditioning(session: WorkoutSession) {
  if (!session.conditioning.length) {
    return null;
  }

  return (
    <View style={styles.sectionSpacing}>
      <Text variant="labelSmall" style={styles.sectionHeading}>
        Conditioning
      </Text>
      {session.conditioning.map((block) => (
        <View key={`${block.modality}-${block.durationMinutes}`} style={styles.textBlock}>
          <Text variant="bodyMedium" style={styles.listItemStrong}>
            {block.modality}
          </Text>
          <Text variant="bodySmall" style={styles.listItem}>
            {block.durationMinutes} minutes
          </Text>
          {block.notes ? (
            <Text variant="bodySmall" style={styles.listItem}>
              {block.notes}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function renderRecovery(session: WorkoutSession) {
  if (!session.recovery.length) {
    return null;
  }

  return (
    <View style={styles.sectionSpacing}>
      <Text variant="labelSmall" style={styles.sectionHeading}>
        Recovery Emphasis
      </Text>
      <Text variant="bodySmall" style={styles.listItem}>
        {session.recovery.join(' | ')}
      </Text>
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
    gap: 4,
  },
  programName: {
    fontWeight: '700',
  },
  subheading: {
    color: '#424242',
  },
  timeline: {
    color: '#757575',
    letterSpacing: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  contentGrid: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  primaryColumn: {
    flex: 1,
    gap: 16,
  },
  secondaryColumn: {
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  methodologyContent: {
    gap: 12,
  },
  methodologyItem: {
    gap: 4,
  },
  label: {
    color: '#616161',
  },
  phaseCard: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  phaseTitle: {
    fontWeight: '600',
  },
  phaseSubtitle: {
    color: '#757575',
    marginTop: 2,
  },
  phaseLabel: {
    marginTop: 12,
    color: '#616161',
  },
  phaseLabelMargin: {
    marginTop: 16,
  },
  phaseListItem: {
    color: '#424242',
  },
  profileSummary: {
    color: '#424242',
    marginBottom: 12,
  },
  sectionHeading: {
    marginTop: 12,
    color: '#616161',
  },
  listItem: {
    color: '#424242',
    marginTop: 4,
  },
  listItemStrong: {
    color: '#212121',
    fontWeight: '600',
  },
  noteItem: {
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f1f8e9',
    color: '#33691e',
  },
  weekSelectorContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
  },
  weekOverview: {
    padding: 16,
    gap: 16,
  },
  weekCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 16,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  weekTitle: {
    fontWeight: '700',
    color: '#2e7d32',
  },
  weekFocus: {
    color: '#1b5e20',
  },
  weekOutcomes: {
    color: '#2e7d32',
    flex: 1,
    textAlign: 'right',
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionDay: {
    fontWeight: '600',
  },
  sessionEmphasis: {
    color: '#757575',
  },
  sessionDuration: {
    color: '#424242',
  },
  readinessText: {
    marginTop: 12,
    color: '#2e7d32',
  },
  divider: {
    marginVertical: 12,
  },
  sectionSpacing: {
    marginTop: 16,
  },
  textBlock: {
    marginTop: 8,
  },
  emptyWeekContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyWeekText: {
    color: '#757575',
  },
});
