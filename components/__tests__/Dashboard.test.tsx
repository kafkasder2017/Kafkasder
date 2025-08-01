import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';
import { useDashboardData } from '../../hooks/useData';
import { ICONS } from '../../constants';

// Mock the useDashboardData hook
jest.mock('../../hooks/useData', () => ({
  useDashboardData: jest.fn()
}));

// Mock the ICONS
jest.mock('../../constants', () => ({
  ICONS: {
    PEOPLE: <span data-testid="people-icon">👥</span>,
    DONATION: <span data-testid="donation-icon">💰</span>,
    CLIPBOARD_DOCUMENT_LIST: <span data-testid="projects-icon">📋</span>,
    AID_RECIPIENT: <span data-testid="aid-icon">🤝</span>
  }
}));

// Mock recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />
}));

const mockUseDashboardData = useDashboardData as jest.MockedFunction<typeof useDashboardData>;

const mockDashboardData = {
  data: {
    stats: {
      totalMembers: 150,
      monthlyDonations: 25000,
      activeProjects: 8,
      pendingApplications: 12
    },
    recentActivities: [
      {
        id: '1',
        type: 'donation' as const,
        description: 'Yeni bağış alındı',
        timestamp: new Date().toISOString(),
        amount: '1.000 ₺',
        link: '/bagis-yonetimi/tum-bagislar'
      }
    ],
    monthlyDonationData: [
      { month: 'Ocak', amount: 15000 },
      { month: 'Şubat', amount: 20000 },
      { month: 'Mart', amount: 25000 }
    ],
    insights: [
      {
        text: 'Bu ay bağışlarda %20 artış görüldü',
        type: 'success' as const,
        priority: 'high' as const
      }
    ]
  },
  isLoading: false,
  isAiLoading: false,
  refresh: jest.fn()
};

describe('Dashboard', () => {
  beforeEach(() => {
    return mockUseDashboardData.mockReturnValue({
      ...mockDashboardData,
      error: ''
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard component', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Toplam Üye Sayısı')).toBeInTheDocument();
    });
  });

  test('displays stat cards with correct values', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Toplam Üye Sayısı')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('Bu Ayki Bağışlar')).toBeInTheDocument();
      expect(screen.getByText('Aktif Projeler')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('Bekleyen Başvurular')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
    });
  });

  test('shows loading state', () => {
    mockUseDashboardData.mockReturnValue({
      ...mockDashboardData,
      isLoading: true,
      error: ''
    });
    
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  test('renders chart components', async () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('chart-container')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });
});
