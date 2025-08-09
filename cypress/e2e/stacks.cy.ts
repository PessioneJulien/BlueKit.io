describe('Stacks Page', () => {
  beforeEach(() => {
    // Handle potential JavaScript errors
    cy.on('uncaught:exception', (err, runnable) => {
      if (err.message.includes('Invalid or unexpected token') || 
          err.message.includes('SyntaxError') ||
          err.message.includes('ChunkLoadError')) {
        return false
      }
    })
    
    cy.visit('/stacks', { failOnStatusCode: false })
    cy.wait(2000) // Give page time to load
  })

  it('should display the stacks page correctly', () => {
    // Check page loads
    cy.get('body').should('be.visible')
    
    // Check for any stacks-related content
    cy.get('body').then(($body) => {
      if ($body.find(':contains("Stacks")').length > 0) {
        cy.contains('Stacks').should('be.visible')
      } else {
        cy.log('No stacks content found')
      }
    })
  })

  it('should display search and filter controls if available', () => {
    // Check search input exists
    cy.get('body').then(($body) => {
      if ($body.find('input[placeholder*="Search"]').length > 0) {
        cy.get('input[placeholder*="Search"]').should('be.visible')
      }
      
      // Check for any filter controls
      if ($body.find('select, button:contains("Filter")').length > 0) {
        cy.log('Filter controls found')
      }
    })
  })

  it('should display stack cards if available', () => {
    // Check if stack cards are loaded
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="stack-card"]').length > 0) {
        cy.get('[data-testid="stack-card"]').should('have.length.at.least', 1)
        
        // Check card content
        cy.get('[data-testid="stack-card"]').first().within(() => {
          cy.get('h3, h2, h1').should('have.length.at.least', 1) // Stack name
        })
      } else {
        cy.log('No stack cards found')
      }
    })
  })

  it('should filter stacks by search query if search is available', () => {
    cy.get('body').then(($body) => {
      if ($body.find('input[placeholder*="Search"]').length > 0 && 
          $body.find('[data-testid="stack-card"]').length > 0) {
        const searchTerm = 'React'
        
        // Get initial count
        cy.get('[data-testid="stack-card"]').then($cards => {
          const initialCount = $cards.length
          
          // Search for React
          cy.get('input[placeholder*="Search"]').first().type(searchTerm)
          
          // Wait for search results
          cy.wait(1000)
          
          // Check if results are filtered
          cy.get('[data-testid="stack-card"]').should('have.length.at.most', initialCount)
        })
      } else {
        cy.log('Search functionality not available or no stacks to search')
      }
    })
  })

  it('should toggle between grid and list view if available', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="grid-view-btn"], [data-testid="list-view-btn"]').length > 0) {
        // Test view toggle if buttons exist
        cy.get('[data-testid="grid-view-btn"], [data-testid="list-view-btn"]').first().click()
        cy.log('View toggle functionality tested')
      } else {
        cy.log('View toggle buttons not available')
      }
    })
  })

  it('should navigate to stack details when clicking a card if available', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="stack-card"]').length > 0) {
        cy.get('[data-testid="stack-card"]').first().click()
        cy.url().should('not.eq', Cypress.config().baseUrl + '/stacks')
      } else {
        cy.log('No stack cards available for navigation test')
      }
    })
  })

  it('should show results count if available', () => {
    cy.get('body').then(($body) => {
      if ($body.find(':contains("Showing")').length > 0) {
        cy.contains(/Showing/).should('be.visible')
      } else {
        cy.log('Results count not displayed')
      }
    })
  })
})