import React, { useState, useEffect } from 'react';
import { Radar, MapPin, RefreshCw, AlertTriangle } from 'lucide-react';

// F1 Circuit coordinates database
const CIRCUIT_COORDINATES = {
    'monaco': { lat: 43.7347, lon: 7.4206, name: 'Monaco', country: 'Monaco' },
    'silverstone': { lat: 52.0786, lon: -1.0169, name: 'Silverstone', country: 'United Kingdom' },
    'spa': { lat: 50.4372, lon: 5.9714, name: 'Spa-Francorchamps', country: 'Belgium' },
    'monza': { lat: 45.6156, lon: 9.2811, name: 'Monza', country: 'Italy' },
    'interlagos': { lat: -23.7036, lon: -46.6997, name: 'Interlagos', country: 'Brazil' },
    'suzuka': { lat: 34.8431, lon: 136.5414, name: 'Suzuka', country: 'Japan' },
    'austin': { lat: 30.1328, lon: -97.6411, name: 'Circuit of the Americas', country: 'United States' },
    'bahrain': { lat: 26.0325, lon: 50.5106, name: 'Bahrain International Circuit', country: 'Bahrain' },
    'jeddah': { lat: 21.6319, lon: 39.1044, name: 'Jeddah Corniche Circuit', country: 'Saudi Arabia' },
    'australia': { lat: -37.8497, lon: 144.9681, name: 'Albert Park', country: 'Australia' },
    'imola': { lat: 44.3439, lon: 11.7167, name: 'Imola', country: 'Italy' },
    'miami': { lat: 25.9581, lon: -80.2389, name: 'Miami International Autodrome', country: 'United States' },
    'spain': { lat: 41.5700, lon: 2.2611, name: 'Circuit de Barcelona-Catalunya', country: 'Spain' },
    'canada': { lat: 45.5000, lon: -73.5228, name: 'Circuit Gilles Villeneuve', country: 'Canada' },
    'austria': { lat: 47.2197, lon: 14.7647, name: 'Red Bull Ring', country: 'Austria' },
    'france': { lat: 43.2506, lon: 5.7919, name: 'Paul Ricard', country: 'France' },
    'hungary': { lat: 47.5789, lon: 19.2486, name: 'Hungaroring', country: 'Hungary' },
    'netherlands': { lat: 52.3888, lon: 4.5409, name: 'Zandvoort', country: 'Netherlands' },
    'singapore': { lat: 1.2914, lon: 103.8640, name: 'Marina Bay', country: 'Singapore' },
    'japan': { lat: 34.8431, lon: 136.5414, name: 'Suzuka', country: 'Japan' },
    'qatar': { lat: 25.4900, lon: 51.4542, name: 'Losail', country: 'Qatar' },
    'mexico': { lat: 19.4042, lon: -99.0907, name: 'Autodromo Hermanos Rodriguez', country: 'Mexico' },
    'vegas': { lat: 36.1147, lon: -115.1728, name: 'Las Vegas Strip Circuit', country: 'United States' },
    'abu-dhabi': { lat: 24.4672, lon: 54.6031, name: 'Yas Marina', country: 'United Arab Emirates' },
    'zandvoort': { lat: 52.3888, lon: 4.5409, name: 'Zandvoort', country: 'Netherlands' },
    'paul-ricard': { lat: 43.2506, lon: 5.7919, name: 'Paul Ricard', country: 'France' },
    'hungaroring': { lat: 47.5789, lon: 19.2486, name: 'Hungaroring', country: 'Hungary' },
    'spa-francorchamps': { lat: 50.4372, lon: 5.9714, name: 'Spa-Francorchamps', country: 'Belgium' }
};

const WeatherRadar = ({ selectedCircuit, isDarkMode }) => {
    const [radarLoading, setRadarLoading] = useState(false);
    const [radarError, setRadarError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [radarImageUrl, setRadarImageUrl] = useState(null);

    // Get circuit coordinates
    const getCircuitCoordinates = (circuitName) => {
        if (!circuitName) return null;

        const normalizedName = circuitName.toLowerCase().replace(/\s+/g, '-');

        // Try exact match first
        if (CIRCUIT_COORDINATES[normalizedName]) {
            return CIRCUIT_COORDINATES[normalizedName];
        }

        // Try partial matches
        for (const [key, coords] of Object.entries(CIRCUIT_COORDINATES)) {
            if (key.includes(normalizedName) || normalizedName.includes(key)) {
                return coords;
            }
        }

        return null;
    };

    const circuitCoords = getCircuitCoordinates(selectedCircuit);

    // Fetch weather radar data
    const fetchRadarData = async () => {
        if (!circuitCoords) return;

        setRadarLoading(true);
        setRadarError(null);

        try {
            // Using OpenWeatherMap's weather map API (requires free API key)
            // Alternative: RainViewer API (free, no key required)

            // Option 1: RainViewer (free, no API key needed)
            const { lat, lon } = circuitCoords;

            // Get the latest radar timestamp
            const timestampResponse = await fetch('https://api.rainviewer.com/public/weather-maps.json');
            const timestampData = await timestampResponse.json();

            if (timestampData && timestampData.radar && timestampData.radar.past.length > 0) {
                const latestTimestamp = timestampData.radar.past[timestampData.radar.past.length - 1].time;

                // Calculate zoom level and tile coordinates for the circuit location
                const zoom = 8; // Good balance between area coverage and detail
                const size = 512; // Tile size

                // Build the radar tile URL
                const radarUrl = `https://tilecache.rainviewer.com/v2/radar/${latestTimestamp}/512/${zoom}/${Math.floor((lon + 180) / 360 * Math.pow(2, zoom))}/${Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))}/2/1_1.png`;

                setRadarImageUrl(radarUrl);
                setLastUpdated(new Date(latestTimestamp * 1000));
            } else {
                throw new Error('No radar data available');
            }

        } catch (error) {
            console.error('Error fetching radar data:', error);
            setRadarError(error.message);

            // Fallback: Create a static map with circuit location
            try {
                // Using OpenStreetMap based static map as fallback
                const { lat, lon } = circuitCoords;
                const zoom = 8;
                const size = 512;

                // This creates a simple map centered on the circuit
                const fallbackUrl = `https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/pin-s-racing+ff0000(${lon},${lat})/${lon},${lat},${zoom}/${size}x${size}@2x?access_token=pk.eyJ1IjoidGVzdCIsImEiOiJjazk5c3QxbW4wOWZ6M29wYjg2Nm40YWo2In0.invalid`;

                // For demo purposes, we'll show a placeholder
                setRadarImageUrl('/api/placeholder/512/512');
                setLastUpdated(new Date());
            } catch (fallbackError) {
                console.error('Fallback map also failed:', fallbackError);
            }
        } finally {
            setRadarLoading(false);
        }
    };

    // Auto-refresh every 5 minutes
    useEffect(() => {
        if (circuitCoords) {
            fetchRadarData();
            const interval = setInterval(fetchRadarData, 5 * 60 * 1000); // 5 minutes
            return () => clearInterval(interval);
        }
    }, [selectedCircuit, circuitCoords]);

    if (!selectedCircuit) {
        return (
            <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} text-center`}>
                <Radar size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-bold mb-2">Weather Radar</h3>
                <p className="text-gray-400">Select a circuit to view local weather radar</p>
            </div>
        );
    }

    if (!circuitCoords) {
        return (
            <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} text-center`}>
                <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-400" />
                <h3 className="text-lg font-bold mb-2">Weather Radar</h3>
                <p className="text-gray-400">
                    Circuit coordinates not available for {selectedCircuit}
                </p>
            </div>
        );
    }

    return (
        <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <Radar size={24} className="mr-3 text-blue-400" />
                    <div>
                        <h3 className="text-lg font-bold">Weather Radar</h3>
                        <div className="flex items-center text-sm text-gray-400">
                            <MapPin size={14} className="mr-1" />
                            <span>{circuitCoords.name}, {circuitCoords.country}</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={fetchRadarData}
                    disabled={radarLoading}
                    className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} 
                     ${radarLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    title="Refresh radar data"
                >
                    <RefreshCw size={16} className={radarLoading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="relative">
                {radarLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg z-10">
                        <div className="text-center">
                            <RefreshCw size={32} className="animate-spin mx-auto mb-2 text-blue-400" />
                            <p className="text-sm text-gray-300">Loading radar data...</p>
                        </div>
                    </div>
                )}

                {radarError && (
                    <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4 mb-4">
                        <div className="flex items-center text-red-300">
                            <AlertTriangle size={16} className="mr-2" />
                            <span className="text-sm">Unable to load radar data: {radarError}</span>
                        </div>
                    </div>
                )}

                <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '1' }}>
                    {radarImageUrl ? (
                        <>
                            <img
                                src={radarImageUrl}
                                alt={`Weather radar for ${circuitCoords.name}`}
                                className="w-full h-full object-cover"
                                onError={() => {
                                    setRadarError('Failed to load radar image');
                                    setRadarImageUrl(null);
                                }}
                            />

                            {/* Circuit marker overlay */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="relative">
                                    {/* Pulsing ring */}
                                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                                    {/* Static marker */}
                                    <div className="relative w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
                                </div>
                            </div>

                            {/* Legend overlay */}
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 rounded px-2 py-1">
                                <div className="flex items-center space-x-2 text-xs">
                                    <div className="flex items-center space-x-1">
                                        <div className="w-3 h-3 bg-blue-300 opacity-60 rounded"></div>
                                        <span className="text-white">Light</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <div className="w-3 h-3 bg-yellow-400 opacity-80 rounded"></div>
                                        <span className="text-white">Moderate</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <div className="w-3 h-3 bg-red-500 opacity-90 rounded"></div>
                                        <span className="text-white">Heavy</span>
                                    </div>
                                </div>
                            </div>

                            {/* Circuit info overlay */}
                            <div className="absolute top-2 left-2 bg-black bg-opacity-70 rounded px-3 py-1">
                                <div className="flex items-center text-white text-sm">
                                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                                    <span className="font-semibold">{circuitCoords.name}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <Radar size={64} className="mx-auto mb-4 opacity-50" />
                                <p>No radar data available</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Data info */}
                <div className="mt-3 flex justify-between items-center text-xs text-gray-400">
                    <div className="flex items-center">
                        <span>Coordinates: {circuitCoords.lat.toFixed(4)}, {circuitCoords.lon.toFixed(4)}</span>
                    </div>
                    {lastUpdated && (
                        <span>
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
                    )}
                </div>
            </div>

            {/* Radar interpretation guide */}
            <div className="mt-4 p-3 bg-blue-500 bg-opacity-10 border border-blue-500 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-300 mb-2">Radar Interpretation</h4>
                <div className="text-xs text-blue-200 space-y-1">
                    <p>• <strong>Blue areas:</strong> Light precipitation - unlikely to affect dry racing</p>
                    <p>• <strong>Yellow areas:</strong> Moderate rain - intermediate tires may be needed</p>
                    <p>• <strong>Red areas:</strong> Heavy precipitation - wet tires required, safety car likely</p>
                    <p>• <strong>Red marker:</strong> Exact circuit location</p>
                </div>
            </div>
        </div>
    );
};

export default WeatherRadar;