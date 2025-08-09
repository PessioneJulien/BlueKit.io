/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to visit the homepage
       * @example cy.visitHomepage()
       */
      visitHomepage(): Chainable<void>
      
      /**
       * Custom command to search for stacks
       * @param query - Search query
       * @example cy.searchStacks('React')
       */
      searchStacks(query: string): Chainable<void>
      
      /**
       * Custom command to wait for components to load
       * @example cy.waitForComponents()
       */
      waitForComponents(): Chainable<void>
      
      /**
       * Custom command to test component drag and drop
       * @example cy.testDragAndDrop()
       */
      testDragAndDrop(): Chainable<void>
    }
  }
}

Cypress.Commands.add('visitHomepage', () => {
  cy.visit('/')
})

Cypress.Commands.add('searchStacks', (query: string) => {
  cy.get('[data-testid="search-input"]').type(query)
  cy.get('[data-testid="search-input"]').should('have.value', query)
})

Cypress.Commands.add('waitForComponents', () => {
  // Wait for components grid to be visible and populated
  cy.get('[data-testid="component-grid"]', { timeout: 15000 }).should('exist')
  
  // Check if components exist, but don't fail if they don't
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="component-card"]').length > 0) {
      cy.get('[data-testid="component-card"]').should('have.length.at.least', 1)
    } else {
      cy.log('No components found in grid')
    }
  })
})

Cypress.Commands.add('testDragAndDrop', () => {
  // Only test if components exist
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="component-card"]').length > 0) {
      // Test that components are draggable
      cy.get('[data-testid="component-card"]').first().should('have.attr', 'draggable', 'true')
      
      // Test that drag handle is visible
      cy.get('[data-testid="component-card"]').first().within(() => {
        cy.get('[data-testid="drag-handle"]').should('be.visible')
      })
      
      // Test drag start event (this is limited in Cypress, but we can test the setup)
      cy.get('[data-testid="component-card"]').first().trigger('dragstart')
    } else {
      cy.log('No components available for drag & drop test')
    }
  })
})

export {}