import type { OrganizationRule } from '$lib/types/rule';

export interface OrganizationRuleRepository {
  list(): Promise<OrganizationRule[]>;
  // ADR-012 #3: deterministic ordering `priority DESC, id ASC` —
  // higher priority wins; ties broken by lowest id (earliest-created).
  // Must not rely on implicit DB/insertion order.
  listEnabledByPriority(): Promise<OrganizationRule[]>;
  create(rule: Omit<OrganizationRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<OrganizationRule>;
  update(id: number, patch: Partial<OrganizationRule>): Promise<void>;
  delete(id: number): Promise<void>;
}
