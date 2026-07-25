type ClassValue = string | false | null | undefined;

/**
 * Nối các class Tailwind, bỏ qua giá trị rỗng/false.
 * (Thay cho clsx — không thêm dependency.)
 */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}
