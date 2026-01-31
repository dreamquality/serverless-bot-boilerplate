# CI/CD Documentation

This document describes the continuous integration and deployment pipelines configured for this project.

## Overview

The project uses GitHub Actions for automated quality gates, testing, and deployment. All workflows are located in `.github/workflows/`.

## Workflows

### 1. CI Workflow (`ci.yml`)

**Triggers:** Push to `main` or `develop` branches, Pull Requests

**Jobs:**

#### Quality Gates
- **Matrix Testing:** Tests on Node.js 18.x and 20.x
- **Steps:**
  - Checkout code
  - Install dependencies
  - Run linter (`npm run lint`)
  - Run type check (`npm run type-check`)
  - Run tests with coverage (`npm test -- --coverage`)
  - Upload coverage reports to Codecov
  - Build project (`npm run build`)
  - Verify build artifacts

#### Shell Script Validation
- Install and run ShellCheck on all shell scripts
- Validate script syntax with `bash -n`
- Check script permissions

#### Security Scan
- Run `npm audit` for known vulnerabilities
- Generate audit report in JSON format
- Check for security issues (moderate level and above)

#### Documentation Check
- Verify all required documentation files exist:
  - README.md
  - CONTRIBUTING.md
  - CHANGELOG.md
  - LICENSE
  - .env.example
- Validate markdown files with markdownlint

#### Deployment Ready Check
- Verify Vercel configuration exists (`vercel.json`)
- Verify Supabase configuration exists (`supabase/config.toml`, edge function)
- Verify TypeScript configuration (`tsconfig.json`)
- Check package.json has all required scripts

### 2. Code Quality Workflow (`code-quality.yml`)

**Triggers:** Pull Requests

**Jobs:**

#### Test Coverage
- Run tests with coverage reporting
- Check coverage thresholds:
  - Statements: 70%
  - Branches: 60%
  - Functions: 70%
  - Lines: 70%
- Comment coverage report on PR

#### Code Quality Checks
- Run ESLint with JSON output
- Check for TODO/FIXME comments
- Check for large files (>100KB)
- Check for `console.log` statements in production code

#### Dependency Check
- List outdated dependencies
- Validate `package-lock.json` exists
- Validate `package.json` has required fields

#### TypeScript Strict Mode
- Verify TypeScript strict mode is enabled
- Run type check
- Build with strict checks

### 3. PR Checks Workflow (`pr-checks.yml`)

**Triggers:** Pull Request events (opened, synchronized, reopened)

**Jobs:**

#### PR Validation
- Check PR title length (minimum 10 characters)
- Check PR has meaningful description
- Check for breaking changes in description

#### Size Check
- Count files changed
- Count lines changed
- Warn if PR is large (>50 files or >1000 lines)

#### Conflict Check
- Check for merge conflicts with base branch

#### Changelog Check
- Verify CHANGELOG.md was updated (for PRs to main branch)

### 4. Release Workflow (`release.yml`)

**Triggers:** Push of version tags (`v*`)

**Jobs:**

#### Create Release
- Run full test suite
- Build project
- Extract version from tag
- Extract changelog entry
- Create GitHub Release with notes
- Optional: Publish to npm (currently disabled)

## Coverage Thresholds

The project enforces the following test coverage thresholds:

| Metric       | Threshold |
|-------------|-----------|
| Statements  | 70%       |
| Branches    | 60%       |
| Functions   | 70%       |
| Lines       | 70%       |

If coverage falls below these thresholds, the build will fail.

## Quality Gates

All PRs must pass the following quality gates before merging:

✅ **Linting** - No ESLint errors
✅ **Type Checking** - No TypeScript errors
✅ **Tests** - All tests passing
✅ **Coverage** - Meets coverage thresholds
✅ **Build** - Project builds successfully
✅ **Security** - No high/critical vulnerabilities
✅ **Shell Scripts** - Valid syntax

## Status Badges

The README includes the following status badges:

- **CI Status** - Shows build status from main CI workflow
- **Code Quality** - Shows status from code quality checks
- **License** - MIT License badge
- **TypeScript** - TypeScript version
- **Node.js** - Required Node.js version

## Local Testing

Before pushing code, run these commands locally:

```bash
# Install dependencies
npm ci

# Run linter
npm run lint

# Run type check
npm run type-check

# Run tests with coverage
npm test -- --coverage

# Build project
npm run build
```

## Shell Script Validation

To validate shell scripts locally:

```bash
# Install ShellCheck (macOS)
brew install shellcheck

# Install ShellCheck (Ubuntu/Debian)
sudo apt-get install shellcheck

# Check script
shellcheck setup.sh
bash -n setup.sh
```

## Markdown Linting

To validate markdown files locally:

```bash
# Install markdownlint-cli
npm install -g markdownlint-cli

# Check markdown files
markdownlint '**/*.md' --ignore node_modules
```

## Codecov Integration

Test coverage is automatically uploaded to Codecov on successful builds. To view coverage reports:

1. Visit the Codecov dashboard for this repository
2. View coverage trends over time
3. See detailed file-by-file coverage

## Best Practices

1. **Write Tests** - Maintain high test coverage
2. **Update Changelog** - Document all changes in CHANGELOG.md
3. **Type Safety** - Use TypeScript strict mode
4. **Code Quality** - Fix all linting errors
5. **Security** - Keep dependencies updated
6. **Documentation** - Keep README and docs current
7. **Small PRs** - Keep PRs focused and reviewable
8. **Meaningful Commits** - Write clear commit messages

## Troubleshooting

### CI Failing on Coverage

If coverage checks fail:
- Add more tests for uncovered code
- Check `coverage/` directory for detailed report
- Run `npm test -- --coverage` locally

### CI Failing on Linting

If linting fails:
- Run `npm run lint` locally
- Fix errors or add exceptions to `.eslintrc.json`

### CI Failing on Type Check

If type checking fails:
- Run `npm run type-check` locally
- Fix type errors in TypeScript code
- Check `tsconfig.json` configuration

### Shell Script Validation Fails

If shell scripts fail validation:
- Run `shellcheck script.sh` locally
- Fix syntax errors
- Ensure scripts are executable: `chmod +x script.sh`

## Future Improvements

Potential enhancements to CI/CD:

- [ ] Add E2E testing workflow
- [ ] Add performance benchmarking
- [ ] Add visual regression testing
- [ ] Add automatic dependency updates (Dependabot)
- [ ] Add code scanning with CodeQL
- [ ] Add deployment to staging environment
- [ ] Add smoke tests after deployment
