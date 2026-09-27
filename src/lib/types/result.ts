// WTFMF_ENGINEERING_SPEC.md §43 — Error Model
// Every service operation returns one of these instead of throwing,
// so the UI can distinguish "nothing happened" from "some things failed".

export type OperationStatus = 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED' | 'CANCELLED';

export interface OperationError {
  code: string;
  message: string;
  recoverable: boolean;
  affectedItems?: string[]; // file URIs or IDs
}

export interface OperationResult<T = void> {
  status: OperationStatus;
  data?: T;
  errors?: OperationError[];
}

export function success<T>(data?: T): OperationResult<T> {
  return { status: 'SUCCESS', data };
}

export function partialSuccess<T>(data: T, errors: OperationError[]): OperationResult<T> {
  return { status: 'PARTIAL_SUCCESS', data, errors };
}

export function failed(errors: OperationError[]): OperationResult<never> {
  return { status: 'FAILED', errors };
}

export function cancelled(): OperationResult<never> {
  return { status: 'CANCELLED' };
}
