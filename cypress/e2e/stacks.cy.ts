describe('Stacks Page', () => {
  beforeEach(() => {
    cy.visit('/stacks')
  })

  it('should display the stacks page correctly', () => {
    // Check page title
    cy.contains('h1', 'Explore Stacks').should('be.visible')
    cy.contains('Discover pre-built technology stacks').should('be.visible')
  })

  it('should display search and filter controls', () => {
    // Check search input
    cy.get('input[placeholder*="Search stacks"]').should('be.visible')
    
    // Check filter dropdowns
    cy.contains('All Categories').should('be.visible')
    cy.contains('All Levels').should('be.visible')
    cy.contains('Most Popular').should('be.visible')
  })

  it('should display stack cards', () => {
    // Check if stack cards are loaded
    cy.get('[data-testid="stack-card"]').should('have.length.at.least', 1)
    
    // Check card content
    cy.get('[data-testid="stack-card"]').first().within(() => {
      cy.get('h3').should('be.visible') // Stack name
      cy.get('[data-testid="tech-badge"]').should('have.length.at.least', 1) // Technologies
    })
  })

  it('should filter stacks by search query', () => {
    const searchTerm = 'React'
    
    // Get initial count
    cy.get('[data-testid="stack-card"]').then($cards => {
      const initialCount = $cards.length
      
      // Search for React
      cy.get('input[placeholder*="Search stacks"]').type(searchTerm)
      
      // Check if results are filtered
      cy.get('[data-testid="stack-card"]').should('have.length.at.most', initialCount)
      
      // Check if search term appears in results
      cy.get('[data-testid="stack-card"]').first().should('contain.text', searchTerm)
    })
  })

  it('should toggle between grid and list view', () => {
    // Default should be grid view
    cy.get('[data-testid="grid-view-btn"]').should('have.class', 'bg-blue-600')
    
    // Switch to list view
    cy.get('[data-testid="list-view-btn"]').click()
    cy.get('[data-testid="list-view-btn"]').should('have.class', 'bg-blue-600')
    
    // Switch back to grid view
    cy.get('[data-testid="grid-view-btn"]').click()
    cy.get('[data-testid="grid-view-btn"]').should('have.class', 'bg-blue-600')
  })

  it('should navigate to stack details when clicking a card', () => {
    cy.get('[data-testid="stack-card"]').first().click()
    cy.url().should('match', /\/stacks\/[\w-]+/)
  })

  it('should show results count', () => {
    cy.contains(/Showing \d+ of \d+ stacks/).should('be.visible')
  })
})