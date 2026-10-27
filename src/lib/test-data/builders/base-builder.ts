export abstract class TestDataBuilder<T> {
  protected data: Partial<T> = {}

  build(): T {
    return this.data as T
  }

  with<K extends keyof T>(key: K, value: T[K]): this {
    this.data[key] = value
    return this
  }
} 