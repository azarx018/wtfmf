// WTFMF_ENGINEERING_SPEC.md §20 (master prompt) — user-created rules
// evaluated before AI classification.

export type RuleConditionField = 'filename' | 'extension' | 'mimeType' | 'folder' | 'size';
export type RuleConditionOperator = 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'matchesRegex' | 'greaterThan' | 'lessThan';

export interface RuleCondition {
  field: RuleConditionField;
  operator: RuleConditionOperator;
  value: string | number;
}

export interface OrganizationRule {
  id: number;
  name: string;
  conditions: RuleCondition[]; // ALL must match (AND) — stored as conditions_json
  categoryId: number;
  priority: number; // ADR-012 #3: higher runs first; ties broken by lowest id (earliest-created)
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}
