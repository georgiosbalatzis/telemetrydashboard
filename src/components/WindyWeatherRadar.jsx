// COMPLETE REPLACEMENT: Replace your entire WindyWeatherRadar.jsx with this simplified version

import React, { useState, useEffect, useRef } from 'react';
import { Radar, MapPin, RefreshCw, AlertTriangle, Wind, Thermometer, Cloud, Eye, Droplet } from 'lucide-react';

/* eslint-disable no-undef */
// Windy.com and Leaflet are loaded dynamically via external script

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
    'abu-dhabi': { lat: 24.4672, lon: 54.6031, name: 'Yas Marina', country: 'United Arab Emirates' }
};

const WindyWeatherRadar = ({ selectedCircuit, isDarkMode }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeLayer, setActiveLayer] = useState('rain');
    const [isWindyReady, setIsWindyReady] = useState(false);
    const iframeRef = useRef(null);

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

    // Weather layers configuration for F1 racing
    const weatherLayers = [
        { id: 'rain', name: 'Precipitation', icon: Cloud, color: 'blue', f1Impact: 'Tire Strategy Critical' },
        { id: 'wind', name: 'Wind Speed', icon: Wind, color: 'green', f1Impact: 'Aerodynamics & Fuel' },
        { id: 'temp', name: 'Temperature', icon: Thermometer, color: 'red', f1Impact: 'Tire Performance' },
        { id: 'clouds', name: 'Cloud Cover', icon: Eye, color: 'gray', f1Impact: 'Track Evolution' },
        { id: 'pressure', name: 'Pressure', icon: Droplet, color: 'purple', f1Impact: 'Engine Performance' }
    ];

    // Generate Windy embed URL based on circuit and layer
    const generateWindyURL = () => {
        if (!circuitCoords) return null;

        const { lat, lon } = circuitCoords;
        const zoom = 8;

        // Map our layer names to Windy's overlay names
        const layerMap = {
            rain: 'rain',
            wind: 'wind',
            temp: 'temp',
            clouds: 'clouds',
            pressure: 'pressure'
        };

        const windyLayer = layerMap[activeLayer] || 'rain';

        // Windy embed URL format
        return `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&detailLat=${lat}&detailLon=${lon}&width=650&height=450&zoom=${zoom}&level=surface&overlay=${windyLayer}&product=ecmwf&menu=&message=&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1`;
    };

    const windyURL = generateWindyURL();

    // Handle iframe load
    const handleIframeLoad = () => {
        setIsLoading(false);
        setIsWindyReady(true);
        setError(null);
    };

    // Handle iframe error
    const handleIframeError = () => {
        setIsLoading(false);
        setError('Failed to load Windy weather map');
    };

    // Reset loading state when circuit or layer changes
    useEffect(() => {
        if (circuitCoords && windyURL) {
            setIsLoading(true);
            setIsWindyReady(false);
            setError(null);
        }
    }, [circuitCoords, windyURL, activeLayer]);

    // Refresh the iframe
    const refreshMap = () => {
        if (iframeRef.current) {
            setIsLoading(true);
            setIsWindyReady(false);
            setError(null);
            iframeRef.current.src = windyURL;
        }
    };

    if (!selectedCircuit) {
        return (
            <div className={`p-6 rounded-xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} text-center`}>
                <Radar size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-bold mb-2">Professional Weather Radar</h3>
                <p className="text-gray-400">Select a circuit to view detailed weather conditions</p>
                <p className="text-xs text-gray-500 mt-2">Powered by Windy.com</p>
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
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <Radar size={24} className="mr-3 text-blue-400" />
                    <div>
                        <h3 className="text-lg font-bold">Professional Weather Radar</h3>
                        <div className="flex items-center text-sm text-gray-400">
                            <MapPin size={14} className="mr-1" />
                            <span>{circuitCoords.name}, {circuitCoords.country}</span>
                            <span className="ml-2 text-xs bg-blue-500 bg-opacity-20 text-blue-300 px-2 py-1 rounded">
                Powered by Windy.com
              </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={refreshMap}
                    disabled={isLoading}
                    className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} 
                     ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    title="Refresh weather map"
                >
                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Weather Layer Controls */}
            <div className="mb-4">
                <h4 className="font-semibold mb-2 text-sm">Weather Layers:</h4>
                <div className="flex flex-wrap gap-2">
                    {weatherLayers.map(layer => {
                        const IconComponent = layer.icon;
                        return (
                            <button
                                key={layer.id}
                                onClick={() => setActiveLayer(layer.id)}
                                className={`flex items-center px-3 py-2 rounded-lg text-sm transition-all ${
                                    activeLayer === layer.id
                                        ? `bg-${layer.color}-500 text-white shadow-lg`
                                        : isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                }`}
                                title={layer.f1Impact}
                            >
                                <IconComponent size={16} className="mr-2" />
                                <div className="text-left">
                                    <div className="font-medium">{layer.name}</div>
                                    <div className="text-xs opacity-75">{layer.f1Impact}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4 mb-4">
                    <div className="flex items-center text-red-300">
                        <AlertTriangle size={16} className="mr-2" />
                        <span className="text-sm">{error}</span>
                        <button
                            onClick={refreshMap}
                            className="ml-auto px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Map Container */}
            <div className="relative">
                {/* Loading Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg z-10">
                        <div className="text-center">
                            <RefreshCw size={32} className="animate-spin mx-auto mb-2 text-blue-400" />
                            <p className="text-sm text-gray-300">Loading professional weather data...</p>
                        </div>
                    </div>
                )}

                {/* Windy Iframe */}
                <div className="h-96 bg-gray-900 rounded-lg overflow-hidden">
                    {windyURL ? (
                        <iframe
                            ref={iframeRef}
                            src={windyURL}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            onLoad={handleIframeLoad}
                            onError={handleIframeError}
                            title={`Weather radar for ${circuitCoords.name}`}
                            className="w-full h-full"
                            allow="geolocation"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <Radar size={64} className="mx-auto mb-4 opacity-50" />
                                <p>Unable to generate weather map URL</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Weather Data Summary */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="text-center">
                    <div className="text-gray-400">Coordinates</div>
                    <div className="font-semibold">{circuitCoords.lat.toFixed(4)}, {circuitCoords.lon.toFixed(4)}</div>
                </div>
                <div className="text-center">
                    <div className="text-gray-400">Active Layer</div>
                    <div className="font-semibold capitalize">{activeLayer}</div>
                </div>
                <div className="text-center">
                    <div className="text-gray-400">Data Source</div>
                    <div className="font-semibold">Windy.com</div>
                </div>
                <div className="text-center">
                    <div className="text-gray-400">Status</div>
                    <div className={`font-semibold ${isWindyReady ? 'text-green-400' : isLoading ? 'text-yellow-400' : 'text-red-400'}`}>
                        {isWindyReady ? 'Ready' : isLoading ? 'Loading' : 'Error'}
                    </div>
                </div>
            </div>

            {/* F1 Racing Context */}
            <div className="mt-4 p-3 bg-green-500 bg-opacity-10 border border-green-500 rounded-lg">
                <h4 className="text-sm font-semibold text-green-300 mb-1">Professional Weather Service</h4>
                <p className="text-xs text-green-200">
                    This radar displays the same professional-grade weather data used by F1 teams for race strategy.
                    Click the layer buttons above to analyze different weather parameters affecting tire choice and race tactics.
                </p>
            </div>
        </div>
    );
};

export default WindyWeatherRadar;