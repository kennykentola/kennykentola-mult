import { CircuitBreaker, CircuitBreakerOptions } from './circuit';

export interface ProviderInfo {
  id: string;
  name: string;
  priority: number;
  maxRequests: number;
  currentRequests: number;
  circuitBreaker: CircuitBreaker;
  instance: any; // The actual provider adapter instance
}

export class RotationManager {
  private providers: ProviderInfo[] = [];

  constructor() {}

  addProvider(id: string, name: string, priority: number, maxRequests: number, instance: any, cbOptions?: CircuitBreakerOptions) {
    this.providers.push({
      id,
      name,
      priority,
      maxRequests,
      currentRequests: 0,
      circuitBreaker: new CircuitBreaker(cbOptions),
      instance
    });
    // Sort providers by priority (lower number = higher priority)
    this.providers.sort((a, b) => a.priority - b.priority);
  }

  async execute<T>(actionName: string, ...args: any[]): Promise<{ result: T, providerUsed: string }> {
    for (const provider of this.providers) {
      if (provider.currentRequests >= provider.maxRequests) {
        continue; // Skip this provider, hit quota limit
      }

      try {
        const result = await provider.circuitBreaker.fire(async () => {
          if (typeof provider.instance[actionName] !== 'function') {
            throw new Error(`Action ${actionName} not supported on provider ${provider.name}`);
          }
          return await provider.instance[actionName](...args);
        });

        provider.currentRequests++;
        return { result, providerUsed: provider.name };
      } catch (error: any) {
        console.warn(`[RotationManager] Provider ${provider.name} failed or is cooling down. Moving to next.`);
        // Fallback to next provider in the loop
      }
    }

    throw new Error('All providers failed or exhausted their quotas.');
  }

  resetQuotas() {
    for (const p of this.providers) {
      p.currentRequests = 0;
    }
  }
}
