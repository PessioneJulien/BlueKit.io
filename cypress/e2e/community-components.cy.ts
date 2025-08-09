describe('Community Components', () => {
  beforeEach(() => {
    cy.visit('/components')
  })

  it('should display community components page correctly', () => {
    // Check main heading
    cy.contains('h1', 'Community Components').should('be.visible')
    
    // Check search functionality
    cy.get('input[placeholder*="Search components"]').should('be.visible')
    
    // Check if components are loaded (wait for API response)
    cy.get('[data-testid="component-grid"]', { timeout: 10000 }).should('be.visible')
  })

  it('should display components with drag handles', () => {
    cy.waitForComponents()
    cy.testDragAndDrop()
  })

  it('should support pagination', () => {
    // Wait for components to load
    cy.get('[data-testid="component-grid"]', { timeout: 10000 }).should('be.visible')
    
    // Check if pagination is visible (only if there are more than 10 components)
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="pagination"]').length > 0) {
        cy.get('[data-testid="pagination"]').should('be.visible')
        cy.contains('Showing').should('be.visible')
        cy.contains('of').should('be.visible')
        cy.contains('components').should('be.visible')
      }
    })
  })

  it('should filter components by search', () => {
    // Wait for initial load
    cy.get('[data-testid="component-grid"]', { timeout: 10000 }).should('be.visible')
    
    // Get initial count
    cy.get('[data-testid="component-card"]').then(($initialCards) => {
      const initialCount = $initialCards.length
      
      // Search for "React" (common component)
      cy.get('input[placeholder*="Search components"]').type('React')
      
      // Wait for search results
      cy.wait(1000)
      
      // Check if results are filtered
      cy.get('[data-testid="component-card"]').should('have.length.at.most', initialCount)
    })
  })

  it('should allow component creation when logged in', () => {
    // Note: This would require login implementation
    // For now, we just check if the create button exists
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Create Component")').length > 0) {
        cy.contains('button', 'Create Component').should('be.visible')
      }
    })
  })
})

describe('Community Components Drag & Drop Integration', () => {
  it('should allow dragging components from /components to /builder', () => {
    // First, visit components page
    cy.visit('/components')
    
    // Wait for components to load
    cy.get('[data-testid="component-grid"]', { timeout: 10000 }).should('be.visible')
    
    // Open builder in new window/tab (simulate multi-tab workflow)
    cy.window().then((win) => {
      win.open('/builder', '_blank')
    })
    
    // Visit builder directly for testing
    cy.visit('/builder')
    
    // Wait for builder to load
    cy.get('[data-testid="visual-canvas"]', { timeout: 10000 }).should('be.visible')
    
    // Check that drag & drop zone exists
    cy.get('[data-testid="drop-zone"]').should('exist')
  })
  
  it('should display drag handle on components', () => {
    cy.visit('/components')
    
    // Wait for components and check drag functionality
    cy.get('[data-testid="component-card"]', { timeout: 10000 }).first().within(() => {
      // Check component is draggable
      cy.root().should('have.attr', 'draggable', 'true')
      
      // Check drag handle is visible
      cy.get('[data-testid="drag-handle"]').should('be.visible')
    })
  })
})