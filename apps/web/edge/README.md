# Optional edge path guard

Ported from the stack at `c7e362b`. This Worker validates percent encoding once before forwarding a
request unchanged. Invalid paths receive a fixed, uncached 400 response; request/response bodies,
query strings and CSP headers are neither inspected nor rewritten. The source compatibility date is
preserved. There are no bindings, storage or telemetry exporters.

This is prepared configuration only. No Worker, route, domain or account binding has been created,
updated or deployed for visomi.dev. Worker logs, invocation logs, traces, Logpush, preview URLs and
workers.dev remain disabled under the migration's explicit privacy policy.

Local verification:

```sh
pnpm nx run-many -p web-edge -t lint typecheck test build
```

The optional smoke target requires an explicitly supplied owned loopback `EDGE_SMOKE_ORIGIN`.
It has no production default. `.env.example` contains account/zone variable names only; do not commit
values. External login, deploy, route changes and production smoke requests require separate approval.
If this optional guard is released later, review the current Cloudflare route/quota policy, preserve
the existing origin/DNS, verify forwarding and a rollback that removes only the optional route.
