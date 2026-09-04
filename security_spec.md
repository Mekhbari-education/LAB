# Security Specification for Algeria Lab

## 1. Data Invariants
- Each user (identified by their Firebase UID as `schoolId`) MUST have a completely isolated environment.
- Any document created in a subcollection under `schools/{schoolId}` MUST only be accessible to the user whose UID matches `{schoolId}`.
- Any document in the `settings` collection MUST only be accessible to the user whose UID matches the document ID.
- Any document in the `users` collection MUST only be accessible to the user whose UID matches the document ID, or by Admins.
- Users cannot read or write data belonging to another `schoolId`.
- Sensitive fields like `userId` in logs must match the `request.auth.uid`.

## 2. The "Dirty Dozen" Payloads (Red Team Test Cases)

### Payload 1: Identity Spoofing (Write to another user's collection)
- **Target Path:** `/schools/OTHER_USER_UID/chemicals/doc123`
- **Operation:** `CREATE`
- **Payload:** `{ "name": "Fake Chemical", "quantity": 100, "unit": "g" }`
- **Expected Result:** `PERMISSION_DENIED`

### Payload 2: Cross-Tenant Read (Read another user's equipment)
- **Target Path:** `/schools/OTHER_USER_UID/equipment/doc456`
- **Operation:** `GET`
- **Expected Result:** `PERMISSION_DENIED`

### Payload 3: Blanket List Query Attempt
- **Target Path:** `/schools/OTHER_USER_UID/teachers`
- **Operation:** `LIST`
- **Expected Result:** `PERMISSION_DENIED`

### Payload 4: Overwriting Other's Settings
- **Target Path:** `/settings/OTHER_USER_UID`
- **Operation:** `WRITE`
- **Payload:** `{ "school": "Hacked School" }`
- **Expected Result:** `PERMISSION_DENIED`

### Payload 5: Unauthorized Log Injection
- **Target Path:** `/users/MY_USER_UID/logs/log789`
- **Operation:** `CREATE`
- **Payload:** `{ "userId": "OTHER_USER_UID", "action": "CREATE", "details": "Spoofed log" }`
- **Expected Result:** `PERMISSION_DENIED` (userId mismatch)

### Payload 6: Modifying Restricted Settings Field (If any existed, e.g., role)
- **Target Path:** `/settings/MY_USER_UID`
- **Operation:** `UPDATE`
- **Payload:** `{ "isAdmin": true }`
- **Expected Result:** `PERMISSION_DENIED` (Strict schema/keys check)

### Payload 7: Shadow Field Injection
- **Target Path:** `/users/MY_USER_UID/chemicals/chem111`
- **Operation:** `CREATE`
- **Payload:** `{ "name": "Oxygen", "quantity": 10, "unit": "L", "ghost_field": "hidden_data" }`
- **Expected Result:** `PERMISSION_DENIED` (Strict keys size check)

### Payload 8: Path Poisoning (Oversized ID)
- **Target Path:** `/users/MY_USER_UID/chemicals/VERY_LONG_ID_EXCEEDING_128_CHARS...`
- **Operation:** `CREATE`
- **Expected Result:** `PERMISSION_DENIED` (isValidId fail)

### Payload 9: Orphaned Log (No teacher existence check on loan)
- **Target Path:** `/users/MY_USER_UID/loan_requests/loan1`
- **Operation:** `CREATE`
- **Payload:** `{ "teacherName": "NonExistentTeacher", ... }`
- **Expected Result:** `PERMISSION_DENIED` (If exists() check implemented)

### Payload 10: State Shortcut (Directly setting status to 'synced' in Sync)
- **Target Path:** `/users/MY_USER_UID/sync_tasks/task1`
- **Operation:** `CREATE`
- **Payload:** `{ "status": "synced", ... }`
- **Expected Result:** `PERMISSION_DENIED` (If creation status must be 'pending')

### Payload 11: Denial of Wallet (Huge String)
- **Target Path:** `/users/MY_USER_UID/chemicals/chem2`
- **Operation:** `CREATE`
- **Payload:** `{ "name": "A".repeat(2000), ... }`
- **Expected Result:** `PERMISSION_DENIED` (String size limit)

### Payload 12: PII Leak Attempt (Reading settings of another user)
- **Target Path:** `/settings/OTHER_USER_UID`
- **Operation:** `GET`
- **Expected Result:** `PERMISSION_DENIED`

## 3. Test Runner (Draft)
A `firestore.rules.test.ts` will be implemented to verify these denials.
