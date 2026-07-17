# Firestore Security Rules Specification

## 1. Data Invariants
- **Profile Integrity**: A user profile document ID must match the `request.auth.uid`. Users cannot create or update profiles with a role of "Admin" or "Super Admin" unless they are already verified admins.
- **Session Privacy**: Users can only access and query their own active session documents. The `uid` field inside the session document must match `request.auth.uid`.
- **Notification Privacy**: Notifications belong to specific users. Read and list permissions are restricted to the owner (`resource.data.uid == request.auth.uid`).
- **Conversations Owners**: Only the owner of a conversation can read or write to it or its subcollections (`conversations/{conversationId}/messages` and `conversations/{conversationId}/draft_answers`).
- **Immortal Fields**: Fields like `createdAt` and `uid` cannot be mutated on updates.
- **Strict Timestamps**: Server timestamps `request.time` must be used for `createdAt` and `updatedAt`.

## 2. The "Dirty Dozen" Malicious Payloads (Forbidden Actions)
1. **Malicious Profile Escalation**: Trying to create a profile with `"role": "Admin"` as a standard user.
2. **Session Hijacking**: Querying or reading another user's session document.
3. **Ghost Session Insertion**: Trying to create a session document where `uid` does not match `request.auth.uid`.
4. **Notification Tampering**: Standard user attempting to delete or read another user's inbox notification.
5. **Cross-User Chat Reading**: Reading message threads from a conversation ID belonging to a different user.
6. **Shadow Fields Injection**: Creating a conversation with extra unverified keys (e.g., `"adminApproved": true`).
7. **Temporal Fraud**: Attempting to set a client-side timestamp for `createdAt` rather than `request.time`.
8. **Malicious Answer Deletion**: Trying to delete or overwrite other users' draft answers.
9. **Spam Conversation Spawning**: Writing conversation documents with an ID length exceeding 128 characters or containing illegal characters.
10. **State Shortcutting**: Updating a document request status directly to `'completed'` without the necessary fields or system approval.
11. **Admin Claim Spoofing**: Attempting to bypass security by injecting fake admin flags in custom claims.
12. **Self-Appointed Role update**: Updating own profile to elevate own privileges.
