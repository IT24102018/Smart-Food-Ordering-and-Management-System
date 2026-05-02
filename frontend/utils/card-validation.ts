/**
 * Card validation utilities for credit and debit cards
 */

export interface CardValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates card holder name - must be at least 3 characters and contain only letters and spaces
 */
export const validateCardHolder = (name: string): CardValidationResult => {
  const trimmed = name.trim();

  if (!trimmed) {
    return { isValid: false, error: 'Card holder name is required' };
  }

  if (trimmed.length < 3) {
    return { isValid: false, error: 'Card holder name must be at least 3 characters' };
  }

  if (!/^[a-zA-Z\s]+$/.test(trimmed)) {
    return { isValid: false, error: 'Card holder name can only contain letters and spaces' };
  }

  return { isValid: true };
};

/**
 * Validates card number using Luhn algorithm
 * Supports exactly 16 digit card numbers
 */
export const validateCardNumber = (cardNumber: string): CardValidationResult => {
  const cleaned = cardNumber.replace(/\D/g, '');

  if (!cleaned) {
    return { isValid: false, error: 'Card number is required' };
  }

  if (!/^\d{16}$/.test(cleaned)) {
    return { isValid: false, error: 'Card number must be exactly 16 digits' };
  }

  // Luhn algorithm validation
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  if (sum % 10 !== 0) {
    return { isValid: false, error: 'Invalid card number' };
  }

  return { isValid: true };
};

/**
 * Validates card expiry date
 * Format: MM/YY
 */
export const validateExpiryDate = (expiry: string): CardValidationResult => {
  const trimmed = expiry.trim();

  if (!trimmed) {
    return { isValid: false, error: 'Expiry date is required' };
  }

  if (!/^\d{2}\/\d{2,4}$/.test(trimmed)) {
    return { isValid: false, error: 'Expiry date must be in MM/YY or MM/YYYY format' };
  }

  const parts = trimmed.split('/');
  const month = parseInt(parts[0], 10);
  const year = parseInt(parts[1], 10);

  if (month < 1 || month > 12) {
    return { isValid: false, error: 'Month must be between 01 and 12' };
  }

  // Convert 2-digit year to 4-digit year
  let fullYear = year;
  if (year < 100) {
    fullYear = year < 50 ? 2000 + year : 1900 + year;
  }

  // Get current date
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Check if card is expired
  if (fullYear < currentYear || (fullYear === currentYear && month < currentMonth)) {
    return { isValid: false, error: 'Card has expired' };
  }

  // Check if expiry date is unreasonable (more than 20 years in future)
  if (fullYear > currentYear + 20) {
    return { isValid: false, error: 'Expiry date seems invalid' };
  }

  return { isValid: true };
};

/**
 * Validates CVV (Card Verification Value)
 * Must be 3 or 4 digits
 */
export const validateCVV = (cvv: string): CardValidationResult => {
  const cleaned = cvv.replace(/\D/g, '');

  if (!cleaned) {
    return { isValid: false, error: 'CVV is required' };
  }

  if (!/^\d{3,4}$/.test(cleaned)) {
    return { isValid: false, error: 'CVV must be 3 or 4 digits' };
  }

  return { isValid: true };
};

/**
 * Validates all card details at once
 */
export const validateAllCardDetails = (
  cardHolder: string,
  cardNumber: string,
  expiry: string,
  cvv: string
): CardValidationResult => {
  // Validate card holder
  const holderValidation = validateCardHolder(cardHolder);
  if (!holderValidation.isValid) {
    return holderValidation;
  }

  // Validate card number
  const numberValidation = validateCardNumber(cardNumber);
  if (!numberValidation.isValid) {
    return numberValidation;
  }

  // Validate expiry
  const expiryValidation = validateExpiryDate(expiry);
  if (!expiryValidation.isValid) {
    return expiryValidation;
  }

  // Validate CVV
  const cvvValidation = validateCVV(cvv);
  if (!cvvValidation.isValid) {
    return cvvValidation;
  }

  return { isValid: true };
};
