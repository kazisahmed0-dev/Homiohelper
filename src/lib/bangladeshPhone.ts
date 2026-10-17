/**
 * Bangladeshi Mobile Number Utilities
 *
 * Bangladesh Mobile Operators:
 * - 013, 017: Grameenphone / Skitto
 * - 014, 019: Banglalink
 * - 015: Teletalk
 * - 016, 018: Robi / Airtel
 *
 * National format: 11 digits starting with 01 (e.g. 01712-345678)
 * International E.164 format: +8801XXXXXXXXX
 */

export interface BDPhoneValidationResult {
  valid: boolean;
  formattedE164: string;
  formattedDisplay: string;
  operatorName?: string;
  error?: string;
}

const OPERATOR_NAMES: Record<string, string> = {
  '13': 'Grameenphone (Skitto)',
  '17': 'Grameenphone',
  '14': 'Banglalink',
  '19': 'Banglalink',
  '15': 'Teletalk',
  '16': 'Airtel',
  '18': 'Robi',
};

/**
 * Validates and formats a Bangladeshi phone number into standard E.164.
 */
export function validateAndFormatBDPhone(input: string): BDPhoneValidationResult {
  if (!input || !input.trim()) {
    return {
      valid: false,
      formattedE164: '',
      formattedDisplay: '',
      error: 'মোবাইল নম্বর প্রদান করা আবশ্যক (Mobile number is required)',
    };
  }

  // Remove spaces, hyphens, parentheses
  let digits = input.trim().replace(/[\s\-\(\)]/g, '');

  // Strip international prefix if present
  if (digits.startsWith('+880')) {
    digits = digits.slice(4);
  } else if (digits.startsWith('880')) {
    digits = digits.slice(3);
  }

  // Remove leading 0 if present (e.g. 017... -> 17...)
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // Digits should now be exactly 10 digits starting with 13-19
  const bdPattern = /^1[3-9]\d{8}$/;
  if (!bdPattern.test(digits)) {
    return {
      valid: false,
      formattedE164: '',
      formattedDisplay: '',
      error:
        'সঠিক বাংলাদেশি মোবাইল নম্বর লিখুন (১১ সংখ্যা, যেমন: 01712345678 বা +8801712345678)',
    };
  }

  const prefix = digits.slice(0, 2);
  const operatorName = OPERATOR_NAMES[prefix] || 'BD Mobile Operator';
  const formattedE164 = `+880${digits}`;
  const formattedDisplay = `+880 0${digits.slice(0, 4)}-${digits.slice(4)}`;

  return {
    valid: true,
    formattedE164,
    formattedDisplay,
    operatorName,
  };
}
