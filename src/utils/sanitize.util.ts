/**
 * Strict data filtering mask to sanitize user profiles before delivery
 * @param rawUser Raw database object returned directly from a query execution
 */
export const sanitizeUserResponse = (rawUser: any) => {
  // Build an explicit allowlist of visible parameters
  return {
    id: rawUser.id,
    email: rawUser.email,
    username: rawUser.username,
    createdAt: rawUser.createdAt,
    // Sensitive keys like rawUser.password_hash or rawUser.is_admin are omitted entirely
  };
};

/**
 * Strict data filtering mask to sanitize journal inputs before delivery
 */
export const sanitizeJournalResponse = (rawJournalEntry: any) => {
  return {
    id: rawJournalEntry.id,
    title: rawJournalEntry.title,
    content: rawJournalEntry.content,
    mood: rawJournalEntry.mood,
    tags: rawJournalEntry.tags || [],
    updatedAt: rawJournalEntry.updatedAt,
  };
};