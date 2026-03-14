# Policy Pages Static UI Redesign TODO

## Plan Breakdown (Approved - proceed with original plan focus)

**Step 1: Create shared components** (policies/components/)
- [x] PolicyHero.tsx
- [x] PolicySidebar.tsx  
- [x] PolicySection.tsx
- [x] PolicyFAQ.tsx
- [x] PolicyTimeline.tsx

**Step 2: Create static data** (policies/data/)
- [x] about-data.ts
- [ ] warranty-data.ts
- [ ] return-data.ts
- [ ] unbox-data.ts
- [ ] delivery-data.ts
- [ ] privacy-data.ts

**Step 3: Create policies layout.tsx**
- [x] layout.tsx
- [x] Breadcrumbs.tsx

**Step 4: Update key pages** (mock content + images)
- [x] about-shop/page.tsx
- [x] warranty-policy/page.tsx
- [ ] return-policy/page.tsx
- [ ] unbox-policy/page.tsx
- [ ] delivery-policy/page.tsx (merge policy-ship?)
- [ ] privacy-policy/page.tsx

**Step 5: Migrate/fix outliers**
- [ ] Move/fix policy-ship/page.tsx → policies/delivery-policy/
- [ ] Fix policy-unbox if exists

**Step 6: Test & complete**
- [ ] Run `npm run dev`
- [ ] Check pages
- [ ] attempt_completion

Progress will be updated after each step.

