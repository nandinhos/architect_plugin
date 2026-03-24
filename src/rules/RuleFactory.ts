import type {
  BehaviorRule,
  RuleContext,
  RuleResult,
  EnforcementResult,
  TriggerType,
  Severity,
} from '../types';

interface CreateRuleInput {
  id: string;
  name: string;
  trigger: TriggerType;
  severity: Severity;
  description: string;
  /* eslint-disable no-unused-vars */
  validate(_: RuleContext): RuleResult;
  enforce?(_context: RuleContext, _result: RuleResult): EnforcementResult | null;
  /* eslint-enable no-unused-vars */
}

export function createRule(input: CreateRuleInput): BehaviorRule {
  if (!input.id || typeof input.id !== 'string') {
    throw new Error('createRule: "id" is required and must be a string.');
  }

  if (!input.name || typeof input.name !== 'string') {
    throw new Error('createRule: "name" is required and must be a string.');
  }

  const validTriggers: TriggerType[] = [
    'before_generation',
    'after_generation',
    'pre_commit',
    'review',
  ];
  if (!validTriggers.includes(input.trigger)) {
    throw new Error(
      `createRule: "trigger" must be one of: ${validTriggers.join(', ')}. Got: ${input.trigger}`
    );
  }

  const validSeverities: Severity[] = ['low', 'medium', 'high', 'critical'];
  if (!validSeverities.includes(input.severity)) {
    throw new Error(
      `createRule: "severity" must be one of: ${validSeverities.join(', ')}. Got: ${input.severity}`
    );
  }

  if (typeof input.validate !== 'function') {
    throw new Error('createRule: "validate" must be a function.');
  }

  if (input.enforce && typeof input.enforce !== 'function') {
    throw new Error('createRule: "enforce" must be a function if provided.');
  }

  return {
    id: input.id,
    name: input.name,
    trigger: input.trigger,
    severity: input.severity,
    description: input.description ?? '',
    validate: input.validate,
    enforce: input.enforce,
  };
}
