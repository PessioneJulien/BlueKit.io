describe('Profile Page', () => {
  beforeEach(() => {
    cy.visit('/profile')
  })

  it('should display the profile page correctly', () => {
    // Check profile card
    cy.contains('h2', 'Profile').should('be.visible')
    
    // Check user info
    cy.contains('John Doe').should('be.visible')
    cy.contains('john.doe@example.com').should('be.visible')
  })

  it('should display user statistics', () => {
    cy.contains('Statistics').should('be.visible')
    cy.contains('Stacks').should('be.visible')
    cy.contains('Stars').should('be.visible')
    cy.contains('Contributions').should('be.visible')
  })

  it('should display achievements section', () => {
    cy.contains('Achievements').should('be.visible')
    cy.contains('Stack Master').should('be.visible')
    cy.contains('Trending Creator').should('be.visible')
    cy.contains('Community Hero').should('be.visible')
  })

  it('should display user stacks section', () => {
    cy.contains('My Stacks').should('be.visible')
    cy.contains('Create New Stack').should('be.visible')
  })

  it('should show empty state when no stacks exist', () => {
    // If no stacks exist, should show empty state
    cy.get('[data-testid="user-stack"]').then($stacks => {
      if ($stacks.length === 0) {
        cy.contains('No stacks yet').should('be.visible')
        cy.contains('Start building your first technology stack').should('be.visible')
        cy.contains('Create Your First Stack').should('be.visible')
      }
    })
  })

  it('should allow editing profile', () => {
    // Click edit button
    cy.get('[data-testid="edit-profile-btn"]').click()
    
    // Check if edit form is shown
    cy.get('input[value="John Doe"]').should('be.visible')
    cy.get('input[value="john.doe@example.com"]').should('be.visible')
    
    // Check save and cancel buttons
    cy.contains('button', 'Save').should('be.visible')
    cy.contains('button', 'Cancel').should('be.visible')
  })

  it('should cancel profile editing', () => {
    // Start editing
    cy.get('[data-testid="edit-profile-btn"]').click()
    
    // Make some changes
    cy.get('input[value="John Doe"]').clear().type('Jane Doe')
    
    // Cancel
    cy.contains('button', 'Cancel').click()
    
    // Check if original name is restored
    cy.contains('John Doe').should('be.visible')
    cy.contains('Jane Doe').should('not.exist')
  })

  it('should navigate to stack builder', () => {
    cy.contains('Create New Stack').click()
    cy.url().should('include', '/builder')
  })

  it('should display social links', () => {
    // Check if social links are visible (if they exist in profile)
    cy.get('[data-testid="website-link"]').should('exist')
    cy.get('[data-testid="github-link"]').should('exist')
    cy.get('[data-testid="twitter-link"]').should('exist')
  })
})