# Release configuration

Adapted from visomi-stack c7e362b. This file is a reviewable template, not an applied
infrastructure change. Confirm the existing project/service binding and all preserved
variable names before any approved plan/apply. It declares no new PostgreSQL, Redis,
MinIO or Jaeger resources. VIS-16 remains their infrastructure reference.

The gateway uses the existing PostgreSQL and Redis services. Owner and auth settings
must be supplied explicitly. Telemetry export is disabled; enabling it requires a
separate opt-in and a collector whose policy excludes contact content, email and IDs.
No config values, source data or secrets belong in this directory.

The contact release and rollback gates are in docs/migration/contact-cutover.md.
