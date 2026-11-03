# Supabase security tests

These tests require a local Supabase stack and Docker. They are intentionally separate from `npm test`.

```powershell
npx supabase start
npx supabase db reset
npx supabase test db
```

Do not treat the migrations as production-ready until this suite passes locally and the same ownership checks are repeated on a disposable cloud project.
