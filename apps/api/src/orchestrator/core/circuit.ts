export enum CircuitState {
  CLOSED,
  OPEN,
  HALF_OPEN
}

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  resetTimeoutMs?: number;
}

export class CircuitBreaker {
  public state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private nextAttempt = Date.now();
  
  private threshold: number;
  private timeoutMs: number;

  constructor(options?: CircuitBreakerOptions) {
    this.threshold = options?.failureThreshold || 3;
    this.timeoutMs = options?.resetTimeoutMs || 60000; // 1 min by default
  }

  async fire<T>(action: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() > this.nextAttempt) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new Error('Circuit is OPEN. Provider is cooling down.');
      }
    }

    try {
      const result = await action();
      return this.success(result);
    } catch (error: any) {
      return this.fail(error);
    }
  }

  private success<T>(result: T): T {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
    return result;
  }

  private fail(error: any): never {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.timeoutMs;
    }
    throw error;
  }
}
