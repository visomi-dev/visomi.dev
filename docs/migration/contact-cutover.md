# Contact migration and rollback

This is a preparation runbook, not permission to execute against real data.
This implementation covers code and synthetic rehearsals only.
The release operator must obtain explicit approval for external staging/production,
real backups/exports/migration, credentials, services and DNS. Never paste data or env values into Linear or CI.

## Data contract

The legacy Astro DB `ContactSubmission` has numeric `id`, `createdAt`, `email`,
`locale`, `message`, `name`, `type`. PostgreSQL preserves all seven fields.
IDs become decimal strings at JSON boundaries to avoid precision loss; stored IDs are
positive signed bigint. Timestamps normalize to UTC ISO milliseconds, matching JavaScript
dates. Locale and type enums and field sizes match the existing form. Content is not
trimmed or interpreted as HTML. Input lengths retain JavaScript UTF-16 rules; PostgreSQL
checks use the corresponding Unicode-code-point lower bounds, so supplementary characters are not
rejected or truncated. NUL and ill-formed surrogate sequences are rejected during preflight. Invalid historical rows stop the import for explicit
operator reconciliation; nothing is silently discarded or repaired.

## Preparation (release operator)

1. Confirm the approved owner identity, existing stack identity/account state, verified email,
   private login method, `AUTH_ORIGIN`, `AUTH_RP_ID`, `SESSION_SECRET`, `OWNER_EMAIL`
   and optional immutable `OWNER_USER_ID`. No automatic account creation is exposed.
2. Reuse the approved PostgreSQL/Redis infrastructure from VIS-16; do not provision duplicates.
   Run `pnpm nx run backend-shared:db-migrate` against the approved destination only.
   This applies versioned auth and contact schemas; application startup never migrates data.
3. The data custodian produces an offline JSON array in the seven-field contract using
   an approved Turso export. Verify a recoverable source backup and its restore in isolation.
   Leave Turso intact. Store all backups encrypted under the approved retention/access policy;
   the migration additionally creates local files with mode 0600 and refuses to overwrite them.
4. Run the contact migration target without `--apply`. Dry-run uses a read-only repeatable-read
   transaction, validates the complete export, checks duplicates and compares every field to
   existing IDs. Output contains counts only. Conflicting IDs/content stop the run.

Example syntax (synthetic input shown; database configuration is operator-supplied):

```sh
pnpm nx run web-api:contacts-migrate --input=apps/web/api/src/contact/fixtures.json --batch=rehearsal
```

## Cutover (application and data operators)

1. Freeze the old Turso writer at ingress and wait for all in-flight submissions to drain.
   Put contact submission in a maintenance window; public reads remain available.
   Capture a final export/delta after this drain and compare it with the backup.
2. Freeze the PostgreSQL writer: inside a transaction take
   `pg_advisory_xact_lock(78239421)` and update the singleton `contact_control.frozen=true`.
   API writes take the shared lock and recheck this row, so concurrent writes cannot cross the gate.
3. Apply the final export using a unique batch and recovery filename:

```sh
pnpm nx run web-api:contacts-migrate --input=/approved/final.json --batch=approved-cutover --apply --backup=/approved/pre-cutover.json
```

4. The serializable transaction takes the exclusive lock, requires frozen writes, writes a
   recoverable before-state/source backup before inserting, inserts missing IDs only, records
   per-row import provenance and verifies counts and complete content. It advances the identity
   sequence without reusing issued IDs. Any conflict or partial SQL failure rolls back all rows.
   Retrying identical data inserts zero additional rows. Use a new backup filename for every apply.
5. Go/no-go: all source IDs/fields reconcile; dry-run of the final export reports zero missing;
   owner-only list/detail tests pass; invalid/anonymous/non-owner/direct-ID requests are denied;
   private responses are no-store; public routes/CV/images and all readiness checks pass.
6. Deploy the approved new application, verify the private configuration and readiness, then
   unfreeze PostgreSQL under the same exclusive lock. Keep the old writer frozen and source intact.
   Record counts/status only. Confirm a synthetic submission can be read once by the owner.

## Rollback (both operators)

1. Freeze the new PostgreSQL writer under the exclusive lock, drain requests and freeze ingress.
   Do not switch the old application back before preserving post-cutover submissions.
2. Run rollback with the original import batch and a new recovery filename:

```sh
pnpm nx run web-api:contacts-migrate --rollback --apply --batch=approved-cutover --backup=/approved/rollback-recovery.json
```

3. Rollback first saves **all** destination rows, including post-cutover requests. It removes only
   unchanged rows inserted by that batch. Preexisting rows and newly created requests remain in
   PostgreSQL. Modified imported rows stop rollback; reconcile them manually instead of overwriting.
   Repeated rollback removes zero additional rows. The old Turso backup remains recoverable.
4. Reconcile/replay the complete recovery artifact into a restored isolated libSQL/Turso copy with
   the operator tool below. It uses the original Astro DB `ContactSubmission` schema: integer ID,
   TEXT timestamp, and the five remaining text fields. It preserves all fields and post-cutover
   requests, rejects conflicting IDs, and keeps existing legacy-only rows. IDs outside JavaScript's
   safe integer range stop recovery instead of being rounded or renumbered.

```sh
# CONTACT_LEGACY_DATABASE_URL and CONTACT_LEGACY_DATABASE_AUTH_TOKEN are supplied privately.
# Remote URLs require TLS; a local file URL must be absolute and already exist.
# Default: read-only transaction, validation/reconciliation, no backup or data writes.
pnpm nx run web-api:contacts-restore-legacy --input=/approved/rollback-recovery.json
# Apply only after both writers/ingress are frozen and replay is approved:
pnpm nx run web-api:contacts-restore-legacy --input=/approved/rollback-recovery.json --apply --writes-frozen --backup=/approved/legacy-before-replay.json
```

Apply takes a libSQL write transaction, saves an exclusive 0600 before-state/source backup,
inserts missing IDs only, reconciles complete content and counts, and commits atomically.
Partial SQL failures or reconciliation failures roll back. Replays are idempotent; each apply
needs a new backup filename. `--writes-frozen` is the operator's acknowledgement of the external
ingress/writer freeze; the tool does not configure an ingress or start/stop either application.
Keep the recovery file and PostgreSQL copy until retention approval; never drop either database.
The real replay still requires the data custodian's explicit approval. 5. Restore the previous approved application artifact/configuration, smoke test all public URLs,
CV, themes, contact and images, then unfreeze only the chosen writer. Confirm there is exactly
one active writer. Observe fixed status/count metrics only; no message/email/path data in telemetry.

## Release gates

Application build/test approval, owner identity configuration, data custodian backup/replay approval,
operator readiness/cutover approval, and deployment/DNS/credential authorization are independent.
Preparing this code or marking an implementation task done does not authorize those operations.

## Owner preparation before enabling private access

Run `pnpm nx run web-api:owner-preflight` in the approved operator environment with the intended
`DATABASE_URL`, `OWNER_EMAIL`, optional `OWNER_USER_ID`, `AUTH_ORIGIN`, `AUTH_RP_ID`, `SESSION_SECRET`,
SMTP configuration and, for an active TOTP enrollment, `AUTH_TOTP_ENCRYPTION_KEY`.
This command validates auth/mail configuration without sending mail. A PostgreSQL READ ONLY
transaction checks exactly one verified existing account, a configured password, the optional
immutable identity and TOTP key availability. It emits fixed status/configuration booleans only,
without email, user ID, password hash, session, code or secret. It creates no account and changes
no credential or configuration. An unavailable/unverified account is a failed gate, never an
instruction to choose the first account or enable public signup.

Successful preflight reports `interactiveAcceptanceRequired: true`. The authorized operator must
still verify actual delivery and owner password/second-factor sign-in, denial for another account,
logout/revocation, and the private no-store responses before enabling access. Use the existing
stack's approved account/onboarding process if the identity is absent; keep private access closed
until that process, email verification and the configuration checks pass. No real account was
provisioned or validated by the synthetic implementation checks.

## Synthetic recovery evidence and limits

`legacy-restore.spec.ts` rehearses the full data recovery path using owned PostgreSQL and the real
`@libsql/client` against an isolated SQLite file: original rows → PostgreSQL import → new API
submission → rollback artifact → read-only replay → atomic libSQL replay → original-style writer
insertion with the next ID → idempotent replay preserving that new row. It checks all seven fields,
Unicode/HTML payload preservation, backup permissions, conflicts, failure rollback and the real CLI.
The owner preflight CLI is also exercised against a synthetic verified account and failed gates.
These checks do not establish a production Turso restore, production application rollback, live
SMTP/client acceptance, or an actual Railway deployment/source-trigger event.
