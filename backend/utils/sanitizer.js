/**
 * PII Data Protection Filter
 * Strips PNRs, booking codes, phone numbers, credit cards, and emails before LLM transmission.
 */
export function sanitizeEmailContent(rawText) {
  if (!rawText || typeof rawText !== "string") return "";

  return rawText
    // Mask 6-character alphanumeric airline PNRs & booking references
    .replace(/\b([A-Z0-9]{6})\b/g, "[MASKED_BOOKING_REF]")
    // Mask 10-12 digit phone numbers
    .replace(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, "[MASKED_PHONE]")
    // Mask credit card numbers
    .replace(/\b(?:\d{4}[-\s]?){3}\d{4}\b/g, "[MASKED_CARD]")
    // Mask email addresses other than domain indicator
    .replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, "[USER]@$2");
}
