# KYC Onboarding Demo

This repo is a local-only Expo demo of a multi-step KYC wizard. It includes draft recovery, deterministic fake service outcomes, bounded polling, conflict handling between local draft state and fake service state, and tests around the core state rules.

## Setup

Requirements:

- Node.js 20+
- npm
- Expo-compatible simulator/emulator if you want to run native targets

Install dependencies:

```bash
npm install
```

## Run The App

Start Expo:

```bash
npm start
```

Optional shortcuts:

```bash
npm run ios
npm run android
npm run web
```

## Run Tests

Run the Jest suite:

```bash
npm test -- --runInBand --watchman=false
```

Type-check the app:

```bash
npx tsc --noEmit
```

## How To Exercise Fake Outcomes

The fake service is driven by the document number on the document step:

- `APP-123` -> submit succeeds, then ends in `approved`
- `REJ-123` -> submit succeeds, then ends in `rejected`
- `MORE-123` -> submit succeeds, then ends in `requires_more_info`
- `FAIL-SUBMIT-123` -> submit rejects immediately
- `FAIL-POLL-123` -> submit succeeds, first poll rejects, retry continues

## Architecture Choices

The code is split by responsibility:

- [App.tsx](./App.tsx): top-level shell, step routing, banners, and status wiring
- [src/hooks/useKycController.ts](./src/hooks/useKycController.ts): async orchestration for hydrate, save, submit, retry, restart, and bounded polling
- [src/store/kycReducer.ts](./src/store/kycReducer.ts): reducer-backed UI state and async flags
- [src/store/kycDomain.ts](./src/store/kycDomain.ts): domain rules, conflict strategy, editable vs locked fake service states, and merge behavior
- [src/utils/validation.ts](./src/utils/validation.ts): step definitions and validation rules
- [src/storage/kycStorage.ts](./src/storage/kycStorage.ts): local persistence via AsyncStorage
- [src/services/fakeKycService.ts](./src/services/fakeKycService.ts): deterministic fake service state transitions and simulated failures
- [src/screens/](./src/screens): thin screen components for personal info, address, document, review, and status

Why reducer + domain helpers:

- The reducer keeps UI state transitions explicit and testable.
- Domain helpers isolate source-of-truth and conflict logic from rendering concerns.
- Fake service and storage are separate so they can be replaced later without rewriting the screens.

## Conflict Strategy

The app uses these source-of-truth rules:

- If local draft is newer and fake service is still editable (`not_started`, `draft`), local wins and is merged forward.
- If fake service is `submitted`, `approved`, or `rejected`, fake service state is authoritative and local edits must not overwrite it.
- If fake service becomes `requires_more_info`, the app routes to the first required field once, then allows newer local navigation to continue so the user can move back, review, and resubmit.

## Testing Strategy

The test suite focuses on the highest-risk logic:

- Step validation
- Allowed state transitions
- Resume from local draft
- Fake service state vs local draft conflict resolution
- `requires_more_info` routing
- Approved and rejected outcomes
- Fake service submit failure and poll failure with retry
- Bounded polling behavior
- Intentional no-sensitive-data logging in app code
- Review-screen visibility for submit failures

Current tests live in [__tests__](./__tests__).

## Security And Reliability Considerations

What this demo does:

- Avoids intentional `console.log`/`console.error` usage in app code
- Stores only the current local draft and fake service record
- Keeps all data on-device with no backend integration
- Bounds polling so status checks do not run forever

What would change in production:

- Move sensitive persisted fields from AsyncStorage to encrypted storage such as `expo-secure-store`
- Minimize fields stored at rest and define retention/clearance rules
- Use a real backend as the service source of truth
- Add authenticated transport, server-side auditability, idempotency, and replay protection
- Add structured monitoring for failure paths without logging raw PII
- Add stronger input validation, secure document handling, and device compromise assumptions

Expo references consulted:

- AsyncStorage: https://docs.expo.dev/versions/latest/sdk/async-storage/
- SecureStore: https://docs.expo.dev/versions/latest/sdk/securestore/

## Assumptions

- This is a timeboxed demo, not a production onboarding flow.
- It is acceptable to simulate service state entirely in local storage.
- A single device/session owns the flow.
- Conflict handling is limited to local draft vs locally persisted fake service snapshot, not multi-device concurrency.
- Required fields for `requires_more_info` are simplified to a small deterministic set.

## Tradeoffs

- AsyncStorage is simple and easy to demo, but not appropriate for sensitive KYC data in production.
- The fake service is deterministic and testable, but intentionally unrealistic in timing and review complexity.
- Navigation is reducer-driven and simple, but not integrated with a navigation library.
- Polling is bounded and explicit, but the UX is basic compared with real background status refresh patterns.

## Intentionally Left Out Due To The Timebox

- Real backend integration
- Real identity/KYC provider integration
- Encryption/key-management implementation
- Analytics and observability pipelines
- Accessibility audit and UX polish pass
- Server-driven field-level review reasons beyond the simplified required-field list
- Multi-device/session reconciliation
- Full E2E/device test automation

## AI Usage Summary

AI was used to accelerate implementation, refactoring, and test creation. The final code, behavior, and documentation were reviewed and corrected in-repo during development.

Accepted AI output:

- Initial reducer/domain split proposal
- Fake service scenario structure
- First-pass screen scaffolding
- First-pass unit test scaffolding
- Documentation draft structure

Rejected or corrected AI output:

- An earlier `requires_more_info` resolver that kept forcing navigation back to the document step
- A review flow that did not surface submit failures clearly
- A few test harness details around renderer setup and type configuration
- Initial dependency placement for AsyncStorage, which belongs in runtime dependencies rather than dev-only usage

## What Should Be Challenged Before Merging

- Whether AsyncStorage is too permissive even for a demo and should be replaced with a safer local-storage abstraction immediately
- Whether the current conflict strategy is the right UX when a locked remote state and newer local draft disagree
- Whether review/status should live in a more formal state machine instead of a reducer plus domain helpers
- Whether the deterministic document-number prefixes are the best demo interface for fake outcomes
- Whether the current test coverage is enough without an interaction-level UI test

## One Product/Security/Production-Service Question Before Shipping

If a real KYC provider returns a terminal decision while the user still has unsynced edits on-device, should the product preserve those edits for appeal/support workflows, or securely delete them immediately to reduce PII retention risk?
