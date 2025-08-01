/// <reference types="cypress" />

// Type declarations for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      seedDatabase(): Cypress.Chainable<void>;
      cleanDatabase(): Cypress.Chainable<void>;
      apiRequest(method: string, url: string, body?: any): Cypress.Chainable<any>;
      uploadFile(selector: string, fileName: string, fileType?: string): Cypress.Chainable<void>;
      dragAndDrop(sourceSelector: string, targetSelector: string): Cypress.Chainable<void>;
      checkA11y(context?: string, options?: any): Cypress.Chainable<void>;
      screenshotWithTimestamp(name: string): Cypress.Chainable<void>;
      waitForNetworkIdle(timeout?: number): Cypress.Chainable<void>;
      setLocalStorage(key: string, value: string): Cypress.Chainable<void>;
      getLocalStorage(key: string): Cypress.Chainable<string | null>;
      clearLocalStorage(): Cypress.Chainable<void>;
    }
  }
}

// Make this file a module
export {};

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************



// Custom command for database seeding
Cypress.Commands.add('seedDatabase', () => {
  // This would typically connect to your test database
  // and seed it with test data
  cy.task('db:seed');
});

// Custom command for cleaning database
Cypress.Commands.add('cleanDatabase', () => {
  cy.task('db:clean');
});

// Custom command for API requests with authentication
Cypress.Commands.add('apiRequest', (method: string, url: string, body?: any) => {
  return cy.request({
    method,
    url: `${Cypress.config('baseUrl')}/api${url}`,
    body,
    headers: {
      'Authorization': `Bearer ${window.localStorage.getItem('authToken')}`,
      'Content-Type': 'application/json'
    },
    failOnStatusCode: false
  });
});

// Custom command for file upload
Cypress.Commands.add('uploadFile', (selector: string, fileName: string, fileType: string = 'application/json') => {
  cy.get(selector).then(subject => {
    cy.fixture(fileName, 'base64').then(content => {
      const el = subject[0] as HTMLInputElement;
      const blob = Cypress.Blob.base64StringToBlob(content, fileType);
      const file = new File([blob], fileName, { type: fileType });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      el.files = dataTransfer.files;
      cy.wrap(subject).trigger('change', { force: true });
    });
  });
});

// Custom command for drag and drop
Cypress.Commands.add('dragAndDrop', (sourceSelector: string, targetSelector: string) => {
  cy.get(sourceSelector).trigger('mousedown', { button: 0 });
  cy.get(targetSelector).trigger('mousemove').trigger('mouseup');
});

// Custom command for checking accessibility
Cypress.Commands.add('checkA11y', (context?: string, options?: any) => {
  // Note: This requires cypress-axe plugin to be installed and configured
  // cy.injectAxe();
  // cy.checkA11y(context, options);
  cy.log('Accessibility check would run here with cypress-axe plugin');
});

// Custom command for taking screenshots with timestamp
Cypress.Commands.add('screenshotWithTimestamp', (name: string) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  cy.screenshot(`${name}-${timestamp}`);
});

// Custom command for waiting for network idle
Cypress.Commands.add('waitForNetworkIdle', (timeout: number = 5000) => {
  let requestCount = 0;
  
  cy.intercept('**', (req) => {
    requestCount++;
    req.reply((res) => {
      requestCount--;
      res.send();
    });
  });
  
  // Note: This requires cypress-wait-until plugin to be installed
  // cy.waitUntil(() => requestCount === 0, {
  //   timeout,
  //   interval: 100,
  //   errorMsg: 'Network did not become idle within timeout'
  // });
  cy.wait(timeout); // Simple fallback
});

// Custom command for local storage manipulation
Cypress.Commands.add('setLocalStorage', (key: string, value: string) => {
  cy.window().then((win) => {
    win.localStorage.setItem(key, value);
  });
});

Cypress.Commands.add('getLocalStorage', (key: string) => {
  return cy.window().its('localStorage').invoke('getItem', key);
});

Cypress.Commands.add('clearLocalStorage', () => {
  cy.window().then((win) => {
    win.localStorage.clear();
  });
});