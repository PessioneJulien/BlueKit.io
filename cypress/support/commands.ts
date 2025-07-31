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

export {}