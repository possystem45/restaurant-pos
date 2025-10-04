import React, { useState, useCallback, memo } from 'react';
import AdminHeader from './components/AdminHeader';
import AdminOverview from './components/AdminOverview';
import AdminStocks from './components/AdminStocks';
import AdminLiquor from './components/AdminLiquor';
import AdminAnalytics from './components/AdminAnalytics';
import NotificationManager from './components/NotificationManager';

const MemoizedAdminOverview = memo(AdminOverview);
const MemoizedAdminStocks = memo(AdminStocks);
const MemoizedAdminLiquor = memo(AdminLiquor);
const MemoizedAdminAnalytics = memo(AdminAnalytics);
const MemoizedNotificationManager = memo(NotificationManager);

export default function AdminDashboard() {
    const [activeSection, setActiveSection] = useState('Overview');

    const handleSectionChange = useCallback((section) => {
        setActiveSection(section);
    }, []);

    const renderActiveSection = () => {
        switch (activeSection) {
            case 'Overview':
                return <MemoizedAdminOverview />;
            case 'Stocks':
                return <MemoizedAdminStocks />;
            case 'Liquor':
                return <MemoizedAdminLiquor />;
            case 'Analytics':
                return <MemoizedAdminAnalytics />;
            case 'Notifications':
                return <MemoizedNotificationManager />;
            default:
                return <MemoizedAdminOverview />;
        }
    };

    return (
        <div className="p-6 min-h-screen font-poppins">
            <div className='w-full flex justify-center'>
                <AdminHeader 
                    activeSection={activeSection} 
                    onSectionChange={handleSectionChange} 
                />
            </div>
            <main className="container mx-auto">
                {renderActiveSection()}
            </main>
        </div>
    );
}
