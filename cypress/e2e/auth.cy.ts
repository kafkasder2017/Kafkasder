describe('Authentication', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/login');
  });

  it('should display login form', () => {
    cy.get('[data-testid="email-input"]').should('be.visible');
    cy.get('[data-testid="password-input"]').should('be.visible');
    cy.get('[data-testid="login-button"]').should('be.visible');
    cy.contains('Giriş Yap').should('be.visible');
  });

  it('should show validation errors for empty fields', () => {
    cy.get('[data-testid="login-button"]').click();
    cy.contains('E-posta adresi gereklidir').should('be.visible');
    cy.contains('Şifre gereklidir').should('be.visible');
  });

  it('should show error for invalid email format', () => {
    cy.get('[data-testid="email-input"]').type('invalid-email');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    cy.contains('Geçerli bir e-posta adresi giriniz').should('be.visible');
  });

  it('should show error for weak password', () => {
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('123');
    cy.get('[data-testid="login-button"]').click();
    cy.contains('Şifre en az 8 karakter olmalıdır').should('be.visible');
  });

  it('should login successfully with valid credentials', () => {
    // Mock successful login response
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          role: 'admin'
        },
        token: 'mock-jwt-token'
      }
    }).as('loginRequest');

    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('TestPassword123!');
    cy.get('[data-testid="login-button"]').click();

    cy.wait('@loginRequest');
    cy.url().should('not.include', '/login');
    cy.url().should('include', '/dashboard');
  });

  it('should show error for invalid credentials', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 401,
      body: {
        error: 'Geçersiz e-posta veya şifre'
      }
    }).as('loginRequest');

    cy.get('[data-testid="email-input"]').type('wrong@example.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();

    cy.wait('@loginRequest');
    cy.contains('Geçersiz e-posta veya şifre').should('be.visible');
    cy.url().should('include', '/login');
  });

  it('should logout successfully', () => {
    // First login
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          role: 'admin'
        },
        token: 'mock-jwt-token'
      }
    }).as('loginRequest');

    cy.login('test@example.com', 'TestPassword123!');
    cy.wait('@loginRequest');

    // Then logout
    cy.intercept('POST', '**/auth/logout', {
      statusCode: 200,
      body: { message: 'Başarıyla çıkış yapıldı' }
    }).as('logoutRequest');

    cy.logout();
    cy.wait('@logoutRequest');
    cy.url().should('include', '/login');
  });

  it('should remember user session', () => {
    // Mock successful login
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          role: 'admin'
        },
        token: 'mock-jwt-token'
      }
    }).as('loginRequest');

    cy.login('test@example.com', 'TestPassword123!');
    cy.wait('@loginRequest');

    // Refresh page
    cy.reload();
    
    // Should still be logged in
    cy.url().should('not.include', '/login');
  });

  it('should redirect to login when accessing protected route without authentication', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });

  it('should handle network errors gracefully', () => {
    cy.intercept('POST', '**/auth/login', {
      forceNetworkError: true
    }).as('loginRequest');

    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('TestPassword123!');
    cy.get('[data-testid="login-button"]').click();

    cy.wait('@loginRequest');
    cy.contains('Bağlantı hatası').should('be.visible');
  });
});