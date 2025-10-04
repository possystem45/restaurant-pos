import React, { useState, useEffect } from 'react';
import { api } from '../../../utils/api';

const NotificationManager = () => {
  const [config, setConfig] = useState(null);
  const [testRecipient, setTestRecipient] = useState('+94729827098');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await api.get('/notifications/config');
      setConfig(response.data.data);
    } catch (error) {
      console.error('Error fetching notification config:', error);
    }
  };

  const sendTestNotification = async () => {
    if (!testRecipient.trim()) {
      setMessage('Please enter a recipient phone number');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await api.post('/notifications/test', {
        recipient: testRecipient
      });

      if (response.data.success) {
        setMessage('Test notification sent successfully!');
      } else {
        setMessage('Failed to send notification: ' + JSON.stringify(response.data.error));
      }
    } catch (error) {
      setMessage('Error sending notification: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendLowStockNotifications = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await api.get('/stock/low-stock?notify=true');
      
      if (response.data.success) {
        const itemCount = response.data.data.length;
        if (itemCount > 0) {
          setMessage(`Low stock notifications sent for ${itemCount} items!`);
        } else {
          setMessage('No low stock items found.');
        }
      } else {
        setMessage('Failed to send low stock notifications');
      }
    } catch (error) {
      setMessage('Error sending low stock notifications: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Notification Management</h2>
      
      {/* Configuration Display */}
      {config && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Current Configuration</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Sender ID:</span> {config.senderId}
            </div>
            <div>
              <span className="font-medium">User ID:</span> {config.userId}
            </div>
            <div>
              <span className="font-medium">API Key Status:</span> 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                config.hasApiKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {config.hasApiKey ? 'Configured' : 'Missing'}
              </span>
            </div>
            <div>
              <span className="font-medium">Recipients:</span> {config.defaultRecipients.join(', ')}
            </div>
          </div>
        </div>
      )}

      {/* Test Notification */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Send Test Notification</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={testRecipient}
            onChange={(e) => setTestRecipient(e.target.value)}
            placeholder="+94729827098"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendTestNotification}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Test'}
          </button>
        </div>
      </div>

      {/* Low Stock Notifications */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Low Stock Alerts</h3>
        <button
          onClick={sendLowStockNotifications}
          disabled={loading}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Checking...' : 'Send Low Stock Alerts'}
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-3 rounded-md ${
          message.includes('Error') || message.includes('Failed') 
            ? 'bg-red-100 text-red-700 border border-red-300'
            : 'bg-green-100 text-green-700 border border-green-300'
        }`}>
          {message}
        </div>
      )}

      {/* Feature Information */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-blue-800">Automatic Notifications</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>✅ New stock items added</li>
          <li>✅ Stock items updated</li>
          <li>✅ Stock quantities changed</li>
          <li>✅ Low stock alerts (automatic)</li>
        </ul>
        <p className="text-xs text-blue-600 mt-2">
          Notifications are sent automatically when stock operations occur. No manual intervention required.
        </p>
      </div>
    </div>
  );
};

export default NotificationManager;
