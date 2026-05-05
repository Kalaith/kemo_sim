# Practical Future Improvements - Kemo Sim

This version is tailored for the current lightweight build in `frontend/`.
The focus is to make the existing loops feel complete, reliable, and expandable.

## 1) Core Game Loop Stability
1. **Fix mutable state bugs in breeding/training**
   - Stop mutating Kemonomimi objects directly inside queue updates.
   - Use immutable updates in Zustand so achievements and save data stay consistent.
2. **Fix ID and progression correctness**
   - Resolve inconsistent ID increment path for offspring.
   - Ensure queue completion, state updates, and coin deductions are atomic.
3. **Add guardrails for invalid actions**
   - Missing parents, insufficient coins, missing selected kemonomimi, duplicate job start.
   - Show inline messages instead of failing silently.

## 2) Meaningful Day Progression
4. **Advance-day consequences**
   - Day advances should age all kemonomimi, unlock training/breeding status transitions, and update coin balance.
5. **Breeding result variety (simple)**
   - Add visible trait/stat inheritance from parents (even simple averaging + random jitter).
   - Show outcome preview and completion summary.
6. **Training payoff**
   - Training should produce noticeable stat/job effects, not just progress bars.

## 3) UX and Discovery Polish
7. **Collection and market filters**
   - Add search/sort/filter by type, name, status, and trait.
   - Sort by age, price, and total stat score.
8. **Consistent loading/empty/error states**
   - Replace blank screens with clear state-specific cards and recovery actions.
9. **Onboarding for new players**
   - Add a short “Getting Started” flow for first-time users.

## 4) Save and Data Safety
10. **Versioned save format**
    - Add `saveVersion` and migration checks.
11. **Safer import/export**
    - Validate imported JSON before applying.
    - Add clear errors and avoid partial writes.
12. **Snapshot management**
    - Add quick backup + reset-to-default options.

## 5) Minimal QA Foundation
13. **Store-level tests**
    - Unit tests for breeding completion, training completion, import/export, and guard conditions.
14. **Performance and accessibility pass**
    - Measure heavy lists (collection/market/family tree) and add basic rendering and ARIA checks.

## Immediate Next 6 Weeks
- Week 1–2: Core Loop Stability + Guards
- Week 3–4: Day progression + training/breeding payoffs
- Week 5: UX and filtering
- Week 6: Save safety + tests + release checklist
