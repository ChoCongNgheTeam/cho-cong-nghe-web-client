type ErrorContext = Record<string, unknown>;

/**
 * Log lỗi tập trung 1 chỗ. Hiện tại chỉ console.error,
 * sau này gắn Sentry/monitoring service thì chỉ cần sửa file này,
 * không phải sửa từng nơi gọi.
 */
export function logError(message: string, error: unknown, context?: ErrorContext) {
  console.error(message, error, context);

  // TODO: gắn Sentry khi BE có monitoring
  // Sentry.captureException(error, { extra: { message, ...context } });
}
