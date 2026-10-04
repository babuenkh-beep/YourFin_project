/**
 * Format a numeric string as a displayable currency amount.
 * e.g. formatCurrency("1500") => "AUD 1,500.00"
 */
export function formatCurrency(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return 'AUD 0.00';
  return `AUD ${num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Parse a user-entered value to a clean numeric string.
 * Strips everything except digits and one decimal point.
 */
export function parseNumericInput(value: string): string {
  // Remove all non-digit characters except the first decimal point
  const cleaned = value.replace(/[^\d.]/g, '');
  // Only allow one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  return cleaned;
}

/**
 * Sum an array of numeric strings.
 */
export function sumValues(values: string[]): number {
  return values.reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
}

/**
 * Validate that a string is a non-empty value.
 */
export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Validate email format.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate a numeric value is a positive number.
 */
export function isPositiveNumber(value: string): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
}

/**
 * Validate age is between 18 and 120.
 */
export function isValidAge(value: string): boolean {
  const num = parseInt(value, 10);
  return !isNaN(num) && num >= 18 && num <= 120;
}

/**
 * Get the currency symbol for a given currency code.
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    CHF: 'CHF',
    CNY: '¥',
    INR: '₹',
    BRL: 'R$',
    MXN: 'MX$',
    KRW: '₩',
    ZAR: 'R',
    NGN: '₦',
    SEK: 'kr',
    NOK: 'kr',
    DKK: 'kr',
    PLN: 'zł',
    THB: '฿',
    SGD: 'S$',
    HKD: 'HK$',
    NZD: 'NZ$',
  };
  return symbols[currency] || '$';
}

/**
 * Generate a unique ID for goals.
 */
export function generateId(): string {
  return crypto.randomUUID();
}