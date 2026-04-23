/**
 * Frontend email validator — mirrors backend validateEmail.js exactly
 * Use this for real-time and pre-submit validation
 */

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

const ALLOWED_TLDS = new Set([
  'com', 'net', 'org', 'edu', 'gov', 'io', 'co',
  'in', 'co.in', 'ac.in', 'edu.in', 'gov.in', 'net.in', 'org.in', 'nic.in',
  'co.uk', 'ac.uk', 'org.uk',
  'us', 'ca', 'au', 'de', 'fr', 'jp', 'ae', 'sg', 'nz',
  'app', 'dev', 'tech', 'ai',
  'ac', 'school', 'university',
]);

const PROVIDER_EXACT_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com', 'yahoo.in', 'yahoo.co.in', 'yahoo.co.uk',
  'outlook.com', 'hotmail.com', 'hotmail.in', 'live.com',
  'icloud.com',
  'rediffmail.com', 'ymail.com',
]);

const KNOWN_PROVIDER_NAMES = [
  'gmail', 'yahoo', 'hotmail', 'outlook', 'live', 'icloud', 'rediffmail', 'ymail',
];

function extractTLD(domain) {
  const parts = domain.split('.');
  if (parts.length >= 3) {
    const compound = parts.slice(-2).join('.');
    if (ALLOWED_TLDS.has(compound)) return compound;
  }
  return parts[parts.length - 1];
}

/**
 * @param {string} email
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return { valid: false, reason: 'Email is required' };

  const trimmed = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, reason: 'Invalid email format (e.g. name@gmail.com)' };
  }

  const atIndex = trimmed.indexOf('@');
  const local   = trimmed.slice(0, atIndex);
  const domain  = trimmed.slice(atIndex + 1);

  if (/\.{2,}/.test(trimmed) || local.startsWith('.') || local.endsWith('.')) {
    return { valid: false, reason: 'Invalid email format' };
  }

  const domainBase = domain.split('.')[0];

  if (KNOWN_PROVIDER_NAMES.includes(domainBase)) {
    if (!PROVIDER_EXACT_DOMAINS.has(domain)) {
      return {
        valid: false,
        reason: `Invalid email — did you mean @${domainBase}.com?`,
      };
    }
    return { valid: true };
  }

  const tld = extractTLD(domain);
  if (!ALLOWED_TLDS.has(tld)) {
    return {
      valid: false,
      reason: `Email must end in a valid domain (.com, .in, .net, .org, .ac.in, etc.)`,
    };
  }

  return { valid: true };
}
