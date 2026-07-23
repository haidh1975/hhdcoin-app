/**
 * TTL cache in-memory dùng chung — thay 6 bản copy `let cache / cacheAt / TTL`.
 * Ngữ nghĩa giữ nguyên các service cũ: `fresh` khi còn hạn, `any` cho stale-on-error.
 */
export class TtlCache<T> {
  private value: T | null = null;
  private storedAt = 0;

  constructor(private readonly ttlMs: number) {}

  /** Giá trị còn hạn TTL — null nếu hết hạn hoặc chưa có. */
  get fresh(): T | null {
    return this.value !== null && Date.now() - this.storedAt < this.ttlMs ? this.value : null;
  }

  /** Giá trị bất kể hạn (dùng làm fallback khi nguồn ngoài lỗi). */
  get any(): T | null {
    return this.value;
  }

  set(value: T): void {
    this.value = value;
    this.storedAt = Date.now();
  }

  clear(): void {
    this.value = null;
    this.storedAt = 0;
  }
}
