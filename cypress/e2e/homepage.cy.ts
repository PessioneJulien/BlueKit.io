describe('Homepage', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display the homepage correctly', () => {
    // Check main heading
    cy.contains('h1', 'Build Your Perfect').should('be.visible')
    cy.contains('h1', 'Technology Stack').should('be.visible')
    
    // Check hero description
    cy.contains('Discover, compare, and assemble the perfect technology stack for your next project').should('be.visible')
    
    // Check CTA buttons
    cy.contains('button', 'Start Building').should('be.visible')
    cy.contains('button', 'Explore Stacks').should('be.visible')
  })

  it('should navigate to builder when clicking Start Building', () => {
    cy.contains('button', 'Start Building').click()
    cy.url().should('include', '/builder')
  })

  it('should navigate to stacks when clicking Explore Stacks', () => {
    cy.contains('button', 'Explore Stacks').click()
    cy.url().should('include', '/stacks')
  })

  it('should display featured stacks section', () => {
    cy.contains('h2', 'Featured Stacks').should('be.visible')
    
    // Check if stack cards are displayed
    cy.get('[data-testid="stack-card"]').should('have.length.at.least', 1)
  })

  it('should display stats section', () => {
    cy.contains('Active Stacks').should('be.visible')
    cy.contains('Technologies').should('be.visible')
    cy.contains('Community Members').should('be.visible')
  })

  it('should have working navigation', () => {
    // Test navigation links
    cy.get('nav').should('be.visible')
    cy.contains('BlueKit').should('be.visible')
    cy.contains('Stacks').should('be.visible')
    cy.contains('Builder').should('be.visible')
  })
})