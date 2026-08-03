/**
 * Weekly Saturday Stock Audit is only available
 * on Saturday from 16:00 onwards.
 */
export function isSaturdayStockAuditWindow(now = new Date()): boolean {
    if (now.getDay() !== 6) return false; // 6 = Saturday
    return now.getHours() >= 16;
}