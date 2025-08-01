import React, { useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

import { ICONS } from '../constants';
import { useDashboardData } from '../hooks/useData';
import type { DashboardInsight, RecentActivity } from '../types';
import { DashboardStats } from '../types';

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}> = React.memo(({ title, value, icon, color }) => (
  <div className='dashboard-card dashboard-transition bg-white dark:bg-zinc-800 p-5 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 flex items-center gap-4'>
    <div
      className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full ${color}`}
    >
      {icon}
    </div>
    <div>
      <p className='text-sm text-zinc-500 dark:text-zinc-400 font-medium'>
        {title}
      </p>
      <p className='text-2xl font-bold text-zinc-800 dark:text-zinc-200'>
        {value}
      </p>
    </div>
  </div>
));

StatCard.displayName = 'StatCard';

const timeSince = (dateString: string) => {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return `${Math.floor(interval)} yıl önce`;
  interval = seconds / 2592000;
  if (interval > 1) return `${Math.floor(interval)} ay önce`;
  interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)} gün önce`;
  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)} saat önce`;
  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)} dakika önce`;
  return 'az önce';
};

const RecentActivityList: React.FC<{ activities: RecentActivity[] }> =
  React.memo(({ activities }) => {
    const activityIcons = useMemo(
      () => ({
        donation: (
          <div className='bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 p-2 rounded-full'>
            {React.cloneElement(ICONS.DONATION, { strokeWidth: 2 })}
          </div>
        ),
        person: (
          <div className='bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 p-2 rounded-full'>
            {React.cloneElement(ICONS.PEOPLE, { strokeWidth: 2 })}
          </div>
        ),
        application: (
          <div className='bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400 p-2 rounded-full'>
            {React.cloneElement(ICONS.AID_RECIPIENT, { strokeWidth: 2 })}
          </div>
        )
      }),
      []
    );

    if (activities.length === 0) {
      return (
        <div className='bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 h-full flex items-center justify-center'>
          <p className='text-zinc-500 dark:text-zinc-400'>
            Son aktivite bulunmuyor.
          </p>
        </div>
      );
    }

    return (
      <div className='dashboard-card dashboard-transition bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700'>
        <h3 className='text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-4'>
          Son Aktiviteler
        </h3>
        <ul className='space-y-4'>
          {activities.map(activity => (
            <li key={activity.id}>
              <ReactRouterDOM.Link
                to={activity.link}
                className='flex items-center space-x-4 group'
              >
                <div className='flex-shrink-0'>
                  {activityIcons[activity.type]}
                </div>
                <div className='flex-1 min-w-0'>
                  <p
                    className='text-sm text-zinc-700 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-white'
                    dangerouslySetInnerHTML={{
                      __html: activity.description.replace(
                        /(Yeni kişi kaydı:|bağış yaptı.|yeni bir başvuru yaptı.)/g,
                        '<strong>$1</strong>'
                      )
                    }}
                  ></p>
                  {activity.amount && (
                    <p className='text-sm font-bold text-zinc-900 dark:text-zinc-100'>
                      {activity.amount}
                    </p>
                  )}
                </div>
                <time className='text-xs text-zinc-500 dark:text-zinc-400 flex-shrink-0'>
                  {timeSince(activity.timestamp)}
                </time>
              </ReactRouterDOM.Link>
            </li>
          ))}
        </ul>
      </div>
    );
  });

const AiInsightCard: React.FC<{
  insights: DashboardInsight[];
  onRefresh: () => void;
  isLoading: boolean;
}> = React.memo(({ insights, onRefresh, isLoading }) => {
  const getInsightStyle = (type: DashboardInsight['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
    }
  };

  return (
    <div className='dashboard-card dashboard-transition bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-zinc-800 dark:text-zinc-200'>
          AI İçgörüleri
        </h3>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className='flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors disabled:opacity-50'
        >
          {isLoading ? (
            <div className='w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
          ) : (
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' />
              <path d='M21 3v5h-5' />
              <path d='M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' />
              <path d='M3 21v-5h5' />
            </svg>
          )}
          Yenile
        </button>
      </div>
      <div className='space-y-3'>
        {insights.length === 0 ? (
          <p className='text-zinc-500 dark:text-zinc-400 text-center py-4'>
            {isLoading ? 'İçgörüler yükleniyor...' : 'Henüz içgörü bulunmuyor.'}
          </p>
        ) : (
          insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getInsightStyle(insight.type)}`}
            >
              <p className='text-sm font-medium'>{insight.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

AiInsightCard.displayName = 'AiInsightCard';

const MonthlyDonationsChart: React.FC<{ data: any[] }> = React.memo(
  ({ data }) => {
    const chartData = useMemo(() => {
      return data.map(item => ({
        ...item,
        name: new Date(`${item.name}-01`).toLocaleDateString('tr-TR', {
          month: 'short',
          year: 'numeric'
        })
      }));
    }, [data]);

    return (
      <div className='dashboard-card dashboard-transition bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700'>
        <h3 className='text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-4'>
          Aylık Bağış Grafiği
        </h3>
        <div className='h-64'>
          <ResponsiveContainer
            width='100%'
            height='100%'
            className='chart-container'
          >
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray='3 3' className='opacity-30' />
              <XAxis dataKey='name' stroke='currentColor' className='text-xs' />
              <YAxis
                stroke='currentColor'
                className='text-xs'
                tickFormatter={value => `${Number(value) / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem'
                }}
                formatter={(value: number) => [
                  value.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: 'TRY'
                  }),
                  'Toplam Bağış'
                ]}
              />
              <Legend />
              <Line
                type='monotone'
                dataKey='value'
                name='Bağış'
                stroke='#0A84FF'
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
);

MonthlyDonationsChart.displayName = 'MonthlyDonationsChart';

const Dashboard = React.memo(() => {
  const { data, isLoading, isAiLoading, refresh } = useDashboardData();

  // Memoize stat cards to prevent unnecessary re-renders
  const statCards = useMemo(
    () => [
      {
        title: 'Toplam Üye Sayısı',
        value: data.stats.totalMembers,
        icon: ICONS.PEOPLE,
        color:
          'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
      },
      {
        title: 'Bu Ayki Bağışlar',
        value: data.stats.monthlyDonations.toLocaleString('tr-TR', {
          style: 'currency',
          currency: 'TRY'
        }),
        icon: ICONS.DONATION,
        color:
          'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
      },
      {
        title: 'Aktif Projeler',
        value: data.stats.activeProjects,
        icon: ICONS.CLIPBOARD_DOCUMENT_LIST,
        color:
          'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400'
      },
      {
        title: 'Bekleyen Başvurular',
        value: data.stats.pendingApplications,
        icon: ICONS.AID_RECIPIENT,
        color:
          'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400'
      }
    ],
    [data.stats]
  );

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
        {statCards.map((card, index) => (
          <StatCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <div className='lg:col-span-2 space-y-6'>
          <AiInsightCard
            insights={data.insights}
            onRefresh={refresh}
            isLoading={isAiLoading}
          />
          <MonthlyDonationsChart data={data.monthlyDonationData} />
        </div>
        <div className='space-y-6'>
          <RecentActivityList activities={data.recentActivities} />
        </div>
      </div>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;
