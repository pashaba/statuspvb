// pages/index.js - Dashboard status
import { useState, useEffect } from 'react';

export default function StatusDashboard() {
    const [bots, setBots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState('');

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 10000); // Update setiap 10 detik
        return () => clearInterval(interval);
    }, []);

    const fetchStatus = async () => {
        try {
            const response = await fetch('/api/ping');
            const data = await response.json();
            
            if (data.success) {
                setBots(data.bots);
                setLastUpdate(data.serverTimeWIB);
            }
        } catch (error) {
            console.error('Gagal fetch status:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (bot) => {
        const lastPing = new Date(bot.lastPing);
        const now = new Date();
        const minutesAgo = (now - lastPing) / (1000 * 60);
        
        return minutesAgo < 2 ? 'bg-green-500' : 'bg-red-500';
    };

    const getStatusText = (bot) => {
        const lastPing = new Date(bot.lastPing);
        const now = new Date();
        const minutesAgo = (now - lastPing) / (1000 * 60);
        
        return minutesAgo < 2 ? 'ONLINE' : 'OFFLINE';
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
                    🤖 Status Monitor Bot
                </h1>
                <p className="text-center text-gray-600 mb-8">
                    Monitor status bot secara real-time
                </p>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <p className="mt-2 text-gray-600">Memuat status...</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-700">
                                    Daftar Bot ({bots.length})
                                </h2>
                                <span className="text-sm text-gray-500">
                                    Update: {lastUpdate}
                                </span>
                            </div>
                        </div>
                        
                        <div className="divide-y divide-gray-200">
                            {bots.map((bot) => (
                                <div key={bot.botName} className="px-6 py-4 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className={`w-3 h-3 rounded-full ${getStatusColor(bot)}`}></div>
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-800">
                                                    {bot.botName}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Terakhir ping: {new Date(bot.lastPing).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="text-right">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                getStatusText(bot) === 'ONLINE' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {getStatusText(bot)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {bots.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <div className="text-6xl mb-4">🤖</div>
                                <p className="text-lg">Belum ada bot yang terdaftar</p>
                                <p className="text-sm mt-2">Bot akan muncul setelah melakukan ping pertama</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-8 text-center text-sm text-gray-500">
                    Auto refresh setiap 10 detik • Server Time: {lastUpdate}
                </div>

                <div className="mt-4 text-center text-xs text-gray-400">
                    © 2024 Bot Status Monitor - Simple Version
                </div>
            </div>
        </div>
    );
}
