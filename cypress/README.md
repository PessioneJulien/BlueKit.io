# Cypress Testing

This directory contains end-to-end tests for the BlueKit Stack Builder platform using Cypress.

## Setup

Cypress has been installed and configured with the following structure:

```
cypress/
├── e2e/                    # End-to-end tests
│   ├── homepage.cy.ts      # Homepage functionality tests
│   ├── stacks.cy.ts        # Stacks page tests  
│   ├── stack-builder.cy.ts # Stack builder tests
│   └── profile.cy.ts       # Profile page tests
├── component/              # Component tests (future)
├── fixtures/               # Test data
│   └── stacks.json        # Sample stack data
└── support/                # Support files
    ├── commands.ts        # Custom commands
    ├── e2e.ts            # E2E support file
    └── component.ts      # Component support file
```

## Running Tests

### Local Development

```bash
# Open Cypress Test Runner (interactive)
npm run cypress:open
# or
npm run e2e:open

# Run tests headlessly (CI mode)
npm run cypress:run
# or  
npm run e2e
```

### Prerequisites

Before running tests, make sure your Next.js development server is running:

```bash
npm run dev
```

The tests are configured to run against `http://localhost:3000`.

## Test Coverage

### Homepage Tests
- ✅ Display hero section correctly  
- ✅ Navigation to builder and stacks pages
- ✅ Featured stacks section
- ✅ Stats section display
- ✅ Navigation menu functionality

### Stacks Page Tests
- ✅ Page layout and content
- ✅ Search and filter functionality
- ✅ Stack cards display
- ✅ Grid/list view toggle
- ✅ Navigation to stack details
- ✅ Results count display

### Stack Builder Tests
- ✅ Builder page layout
- ✅ Technology categories display
- ✅ Technology search
- ✅ Adding/removing technologies
- ✅ Stack naming
- ✅ Stack statistics
- ✅ Compatibility warnings
- ✅ Save functionality

### Profile Page Tests
- ✅ Profile display
- ✅ User statistics
- ✅ Achievements section
- ✅ User stacks management
- ✅ Profile editing
- ✅ Social links

## Custom Commands

### `cy.visitHomepage()`
Navigates to the homepage.

### `cy.searchStacks(query)`
Searches for stacks using the provided query string.

## Configuration

The tests are configured in `cypress.config.ts` with:
- Base URL: `http://localhost:3000`
- Viewport: 1280x720
- Screenshot on failure: enabled
- Video recording: disabled (for faster local runs)
- Retry attempts: 2 in CI, 0 locally

## CI/CD Integration

Tests run automatically in GitHub Actions on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

The workflow:
1. Installs dependencies
2. Builds the Next.js app
3. Starts the production server
4. Runs all Cypress tests
5. Uploads screenshots/videos on failure

## Best Practices

1. **Use data-testid attributes** for reliable element selection
2. **Keep tests independent** - each test should be able to run in isolation
3. **Use fixtures** for test data to keep tests maintainable
4. **Write descriptive test names** that explain what functionality is being tested
5. **Group related tests** in describe blocks with meaningful names

## Debugging

- Use `cy.debug()` to pause test execution
- Use `cy.screenshot()` to capture specific moments
- Check the Test Runner's Command Log for detailed step information
- Screenshots of failed tests are automatically saved

## Future Improvements

- [ ] Add component testing with Cypress
- [ ] Add visual regression testing
- [ ] Add API testing for backend endpoints
- [ ] Add accessibility testing integration
- [ ] Add performance testing integration