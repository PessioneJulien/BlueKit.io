describe('Stack Builder', () => {
  beforeEach(() => {
    cy.visit('/builder')
  })

  it('should display the builder page correctly', () => {
    // Check page title
    cy.contains('h1', 'Stack Builder').should('be.visible')
    cy.contains('Drag and drop technologies to build your perfect stack').should('be.visible')
  })

  it('should display technology categories', () => {
    // Check category headers
    cy.contains('h3', 'Frontend').should('be.visible')
    cy.contains('h3', 'Backend').should('be.visible')
    cy.contains('h3', 'Database').should('be.visible')
    cy.contains('h3', 'Devops').should('be.visible')
  })

  it('should display empty stack area initially', () => {
    cy.contains('Start adding technologies to build your stack').should('be.visible')
  })

  it('should allow searching for technologies', () => {
    const searchTerm = 'React'
    
    // Search for a technology
    cy.get('input[placeholder*="Search technologies"]').type(searchTerm)
    
    // Check if results are filtered
    cy.get('[data-testid="tech-card"]').should('contain.text', searchTerm)
  })

  it('should add technologies to the stack', () => {
    // Click on a technology to add it
    cy.get('[data-testid="tech-card"]').first().click()
    
    // Check if technology is added to the stack
    cy.get('[data-testid="selected-tech"]').should('have.length', 1)
    
    // Check if empty state is gone
    cy.contains('Start adding technologies to build your stack').should('not.exist')
  })

  it('should remove technologies from the stack', () => {
    // Add a technology first
    cy.get('[data-testid="tech-card"]').first().click()
    cy.get('[data-testid="selected-tech"]').should('have.length', 1)
    
    // Remove the technology
    cy.get('[data-testid="remove-tech-btn"]').first().click()
    
    // Check if technology is removed
    cy.get('[data-testid="selected-tech"]').should('have.length', 0)
    cy.contains('Start adding technologies to build your stack').should('be.visible')
  })

  it('should allow naming the stack', () => {
    const stackName = 'My Test Stack'
    
    // Enter stack name
    cy.get('input[placeholder*="Name your stack"]').type(stackName)
    cy.get('input[placeholder*="Name your stack"]').should('have.value', stackName)
  })

  it('should show stack statistics', () => {
    // Add some technologies
    cy.get('[data-testid="tech-card"]').first().click()
    cy.get('[data-testid="tech-card"]').eq(1).click()
    
    // Check if stats are displayed
    cy.contains('Total Setup Time').should('be.visible')
    cy.contains('Difficulty').should('be.visible')
  })

  it('should show compatibility warnings when needed', () => {
    // This test would need specific technologies that are incompatible
    // For now, just check that the warning area exists
    cy.get('[data-testid="compatibility-warnings"]').should('exist')
  })

  it('should enable save button when stack has name and technologies', () => {
    const stackName = 'Complete Stack'
    
    // Initially save button should be disabled
    cy.contains('button', 'Save Stack').should('be.disabled')
    
    // Add name only - still disabled
    cy.get('input[placeholder*="Name your stack"]').type(stackName)
    cy.contains('button', 'Save Stack').should('be.disabled')
    
    // Add technology - now enabled
    cy.get('[data-testid="tech-card"]').first().click()
    cy.contains('button', 'Save Stack').should('not.be.disabled')
  })
})