# Feature Expansion & Backwards Compatibility Guide (`features.md`)

This guide serves as a manual for proposing, developing, and deploying new features in the future without breaking the existing database models or client applications.

---

## 1. Feature Proposal Template

When planning a new feature later, complete this brief impact assessment:

```markdown
### Feature Name: [Name]

#### 1. Description
- What does the feature do? Who uses it (roles)?

#### 2. Database Impact
- What new Collections or Attributes are required?
- Do these attributes have default values to avoid breaking old records?

#### 3. API Changes
- What new endpoints are needed?
- Do we need to version the endpoints (e.g. /api/v2/)?

#### 4. UI/UX Changes
- Where does this appear in the Web Dashboard?
- Where does this appear in the Mobile App (new navigation tabs, profile option)?

#### 5. Rollout Checklist
- [ ] Create database collections/attributes first.
- [ ] Run backend unit tests.
- [ ] Verify role permissions.
- [ ] Deploy backend.
- [ ] Deploy client frontend.
```

---

## 2. Guidelines to Prevent Code Regressions

To prevent updates from breaking existing client apps (especially native mobile apps, which users do not update immediately):

### A. Database Changes (Non-Breaking)
* **Never add non-nullable, required database attributes** without a defined default value. In Appwrite, always check the `required: false` box when creating new attributes for existing collections.
* If a new attribute *must* be required, write a database backfill script first to populate default values for all existing records.
* In MongoDB Mongoose, use `default` values or mark fields as optional:
  ```typescript
  // Safe addition of a new feature field
  newField: { type: String, default: 'default_value' }
  ```

### B. API Versioning
* If a change changes the payload shape of an existing endpoint in a way that breaks compatibility, **do not modify the existing endpoint**.
* Create a versioned route:
  - Old: `/api/v1/projects/:id`
  - New: `/api/v2/projects/:id`
* Keep v1 active until mobile application updates are fully distributed on the App Store/Google Play Store.

### C. Feature Flags & Safe Client Layouts
* Implement conditional checks around experimental features using feature toggle values in user profiles or configuration documents:
  ```typescript
  if (user.features?.enableBetaModules) {
    return <BetaModuleDashboard />
  }
  ```
* Ensure that missing properties in API responses do not cause runtime null-pointer exceptions in React/React Native:
  - **Unsafe:** `const name = project.payment.bankAccount.bankName;`
  - **Safe (Optional Chaining):** `const name = project?.payment?.bankAccount?.bankName ?? 'Unknown Bank';`

---

## 3. Database Schema Migration Procedure

If a new feature requires moving or restructuring fields:

1. **Write (Dual-Writing):** Modify your backend API code to write to both the old fields and the new fields simultaneously.
2. **Backfill:** Run an offline background script to copy old data to the new structure.
3. **Read:** Update your backend reading logic to read from the new structure.
4. **Clean up:** Once confirmed stable, delete the writing logic for the old structure and delete the old database columns/attributes.
