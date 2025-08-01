describe('Dashboard', () => {
  beforeEach(() => {
    // Mock authentication
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

    // Mock dashboard data
    cy.intercept('GET', '**/api/dashboard/stats', {
      statusCode: 200,
      body: {
        totalDonations: 150000,
        totalDonors: 250,
        activeProjects: 12,
        pendingApplications: 8,
        monthlyGrowth: 15.5,
        recentDonations: [
          {
            id: 1,
            amount: 1000,
            donor: 'Ahmet Yılmaz',
            date: '2024-01-15',
            project: 'Eğitim Yardımı'
          },
          {
            id: 2,
            amount: 500,
            donor: 'Fatma Kaya',
            date: '2024-01-14',
            project: 'Sağlık Yardımı'
          }
        ],
        upcomingEvents: [
          {
            id: 1,
            title: 'Yardım Kampanyası',
            date: '2024-02-01',
            location: 'İstanbul'
          }
        ]
      }
    }).as('dashboardStats');

    cy.login('test@example.com', 'TestPassword123!');
    cy.wait('@loginRequest');
  });

  it('should display dashboard with correct statistics', () => {
    cy.wait('@dashboardStats');
    
    // Check main statistics cards
    cy.get('[data-testid="total-donations"]').should('contain', '150.000');
    cy.get('[data-testid="total-donors"]').should('contain', '250');
    cy.get('[data-testid="active-projects"]').should('contain', '12');
    cy.get('[data-testid="pending-applications"]').should('contain', '8');
    
    // Check growth indicator
    cy.get('[data-testid="monthly-growth"]').should('contain', '15.5%');
  });

  it('should display recent donations list', () => {
    cy.wait('@dashboardStats');
    
    cy.get('[data-testid="recent-donations"]').should('be.visible');
    cy.get('[data-testid="donation-item"]').should('have.length', 2);
    
    // Check first donation
    cy.get('[data-testid="donation-item"]').first().within(() => {
      cy.contains('Ahmet Yılmaz').should('be.visible');
      cy.contains('1.000 ₺').should('be.visible');
      cy.contains('Eğitim Yardımı').should('be.visible');
    });
  });

  it('should display upcoming events', () => {
    cy.wait('@dashboardStats');
    
    cy.get('[data-testid="upcoming-events"]').should('be.visible');
    cy.get('[data-testid="event-item"]').should('have.length', 1);
    
    cy.get('[data-testid="event-item"]').first().within(() => {
      cy.contains('Yardım Kampanyası').should('be.visible');
      cy.contains('İstanbul').should('be.visible');
    });
  });

  it('should navigate to donations page from recent donations', () => {
    cy.wait('@dashboardStats');
    
    cy.get('[data-testid="view-all-donations"]').click();
    cy.url().should('include', '/bagislar');
  });

  it('should navigate to projects page from statistics card', () => {
    cy.wait('@dashboardStats');
    
    cy.get('[data-testid="active-projects"]').click();
    cy.url().should('include', '/projeler');
  });

  it('should refresh dashboard data', () => {
    cy.wait('@dashboardStats');
    
    // Mock updated data
    cy.intercept('GET', '**/api/dashboard/stats', {
      statusCode: 200,
      body: {
        totalDonations: 155000,
        totalDonors: 255,
        activeProjects: 13,
        pendingApplications: 7,
        monthlyGrowth: 16.2
      }
    }).as('refreshedStats');
    
    cy.get('[data-testid="refresh-dashboard"]').click();
    cy.wait('@refreshedStats');
    
    cy.get('[data-testid="total-donations"]').should('contain', '155.000');
    cy.get('[data-testid="total-donors"]').should('contain', '255');
  });

  it('should handle loading states', () => {
    // Mock slow response
    cy.intercept('GET', '**/api/dashboard/stats', {
      statusCode: 200,
      body: {
        totalDonations: 150000,
        totalDonors: 250,
        activeProjects: 12,
        pendingApplications: 8
      },
      delay: 2000
    }).as('slowDashboardStats');
    
    cy.visit('/dashboard');
    
    // Should show loading spinner
    cy.get('[data-testid="loading-spinner"]').should('be.visible');
    
    cy.wait('@slowDashboardStats');
    
    // Loading spinner should disappear
    cy.get('[data-testid="loading-spinner"]').should('not.exist');
    cy.get('[data-testid="total-donations"]').should('be.visible');
  });

  it('should handle error states', () => {
    // Mock error response
    cy.intercept('GET', '**/api/dashboard/stats', {
      statusCode: 500,
      body: {
        error: 'Sunucu hatası'
      }
    }).as('errorDashboardStats');
    
    cy.visit('/dashboard');
    cy.wait('@errorDashboardStats');
    
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.contains('Veriler yüklenirken bir hata oluştu').should('be.visible');
    
    // Should have retry button
    cy.get('[data-testid="retry-button"]').should('be.visible');
  });

  it('should display charts and graphs', () => {
    cy.wait('@dashboardStats');
    
    // Check if charts are rendered
    cy.get('[data-testid="donations-chart"]').should('be.visible');
    cy.get('[data-testid="projects-chart"]').should('be.visible');
    
    // Check chart interactions
    cy.get('[data-testid="chart-period-selector"]').should('be.visible');
    cy.get('[data-testid="chart-period-monthly"]').click();
    cy.get('[data-testid="chart-period-yearly"]').click();
  });

  it('should be responsive on mobile devices', () => {
    cy.viewport('iphone-x');
    cy.wait('@dashboardStats');
    
    // Check mobile layout
    cy.get('[data-testid="mobile-stats-grid"]').should('be.visible');
    cy.get('[data-testid="desktop-stats-grid"]').should('not.be.visible');
    
    // Check mobile navigation
    cy.get('[data-testid="mobile-menu-toggle"]').should('be.visible');
    cy.get('[data-testid="mobile-menu-toggle"]').click();
    cy.get('[data-testid="mobile-navigation"]').should('be.visible');
  });

  it('should export dashboard data', () => {
    cy.wait('@dashboardStats');
    
    // Mock export endpoint
    cy.intercept('POST', '**/api/dashboard/export', {
      statusCode: 200,
      body: {
        downloadUrl: '/downloads/dashboard-export.pdf'
      }
    }).as('exportDashboard');
    
    cy.get('[data-testid="export-dashboard"]').click();
    cy.get('[data-testid="export-format-pdf"]').click();
    cy.get('[data-testid="confirm-export"]').click();
    
    cy.wait('@exportDashboard');
    cy.waitForToast('Rapor başarıyla oluşturuldu');
  });
});