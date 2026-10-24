## Description

Please include a summary of the changes and the related issue/feature.

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Scanner rule update or addition

## Architectural & Security Invariants Checklist

- [ ] **No code execution**: Scanned repository code is never executed.
- [ ] **No secret exposure**: Zero API keys or secrets are logged, exposed to client bundles, or unredacted.
- [ ] **Deterministic grounding**: AI explanations are grounded in verified evidence; no invented findings.
- [ ] **Manual submission**: No automated pull requests or issues opened on external targets.

## Verification Checklist

Please verify that each command passes locally:

- [ ] `npm run check:integrations`
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test`
- [ ] `npm run build`

## Screenshots or Logs (if applicable)

*Add any UI screenshots or test output here.*
