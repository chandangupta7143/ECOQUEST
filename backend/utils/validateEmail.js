/**
 * Backend Email Validation Utility — Production Grade
 * Validates format + known provider authenticity + allowed TLDs
 * NEVER trust frontend — always re-validate on the server
 */

// Standard email format regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

// RFC limits
const MAX_LOCAL_LEN  = 64;
const MAX_DOMAIN_LEN = 255;
const MAX_TOTAL_LEN  = 320;

/**
 * ALLOWED TLDs — only these are accepted globally.
 * Covers India, global, education, corporate, etc.
 */
const ALLOWED_TLDS = new Set([
  // Most common global
  'com', 'net', 'org', 'edu', 'gov', 'io', 'co',
  // India-specific
  'in', 'co.in', 'ac.in', 'edu.in', 'gov.in', 'net.in', 'org.in', 'nic.in',
  // UK
  'co.uk', 'ac.uk', 'org.uk',
  // Other commonly used
  'us', 'ca', 'au', 'de', 'fr', 'jp', 'ae', 'sg', 'nz',
  // Tech / startup
  'app', 'dev', 'tech', 'ai',
  // Education & institute
  'ac', 'school', 'university',
]);

/**
 * Popular email providers → ONLY these EXACT domains allowed.
 * Prevents: gmail.li, gmail.xyz, yahoo.abc, outlook.co, etc.
 */
const PROVIDER_EXACT_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com', 'yahoo.in', 'yahoo.co.in', 'yahoo.co.uk',
  'outlook.com', 'hotmail.com', 'hotmail.in', 'live.com',
  'icloud.com',
  'rediffmail.com', 'ymail.com',
]);

/**
 * If these appear as the domain base, enforce exact match above.
 */
const KNOWN_PROVIDER_NAMES = [
  'gmail', 'yahoo', 'hotmail', 'outlook', 'live', 'icloud', 'rediffmail', 'ymail',
];

/**
 * Extract the effective TLD from a domain.
 * Handles multi-part TLDs like co.in, ac.in, co.uk
 */
function extractTLD(domain) {
  const parts = domain.split('.');
  if (parts.length >= 3) {
    // Check last 2 parts as compound TLD (e.g. co.in, ac.in)
    const compound = parts.slice(-2).join('.');
    if (ALLOWED_TLDS.has(compound)) return compound;
  }
  // Single TLD (e.g. .com, .in)
  return parts[parts.length - 1];
}

/**
 * Main validation function
 * @param {string} email
 * @returns {{ valid: boolean, reason?: string }}
 */
function validateEmail(email) {
  if (typeof email !== 'string') {
    return { valid: false, reason: 'Email must be a string' };
  }

  const trimmed = email.trim().toLowerCase();

  if (!trimmed) {
    return { valid: false, reason: 'Email is required' };
  }
  if (trimmed.length > MAX_TOTAL_LEN) {
    return { valid: false, reason: 'Email address is too long' };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, reason: 'Invalid email format (e.g. name@gmail.com)' };
  }

  const atIndex = trimmed.indexOf('@');
  const local   = trimmed.slice(0, atIndex);
  const domain  = trimmed.slice(atIndex + 1);

  if (local.length > MAX_LOCAL_LEN) {
    return { valid: false, reason: 'Email local part is too long' };
  }
  if (domain.length > MAX_DOMAIN_LEN) {
    return { valid: false, reason: 'Email domain is too long' };
  }

  // No consecutive dots
  if (/\.{2,}/.test(trimmed)) {
    return { valid: false, reason: 'Invalid email format (consecutive dots not allowed)' };
  }

  // Local part cannot start or end with dot
  if (local.startsWith('.') || local.endsWith('.')) {
    return { valid: false, reason: 'Invalid email format' };
  }

  // ── Provider authenticity check ──────────────────────────────
  const domainBase = domain.split('.')[0]; // "gmail" from "gmail.li"

  if (KNOWN_PROVIDER_NAMES.includes(domainBase)) {
    if (!PROVIDER_EXACT_DOMAINS.has(domain)) {
      return {
        valid: false,
        reason: `Invalid email provider — did you mean @${domainBase}.com?`,
      };
    }
    return { valid: true }; // Exact provider match — skip TLD check (it's embedded)
  }

  // ── TLD allowlist check (for all non-provider emails) ────────
  const tld = extractTLD(domain);
  if (!ALLOWED_TLDS.has(tld)) {
    return {
      valid: false,
      reason: `Email domain must end in a valid extension (.com, .in, .net, .org, .ac.in, etc.)`,
    };
  }

  return { valid: true };
}

module.exports = { validateEmail };
