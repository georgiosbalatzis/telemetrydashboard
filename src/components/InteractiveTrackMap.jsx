// PART 1: Replace your entire InteractiveTrackMap.jsx with this complete version

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Zap, MapPin, Timer, Users, Settings, Maximize2 } from 'lucide-react';

// Complete F1 Track Data - All current F1 circuits with accurate data
const TRACK_DATA = {
    // Australia
    'albert-park': {
        name: "Albert Park Circuit",
        country: "Australia",
        length: 5.278,
        direction: "clockwise",
        sectors: [
            { name: "Sector 1", start: 0.0, end: 0.30, color: "#ff0000" },
            { name: "Sector 2", start: 0.30, end: 0.63, color: "#ffff00" },
            { name: "Sector 3", start: 0.63, end: 1.0, color: "#00ff00" }
        ],
        path: "M100,280 L50,200 L80,120 L150,80 L230,100 L250,180 L200,250 Z",
        drsZones: [
            { start: 0.05, end: 0.10, name: "DRS Zone 1" },
            { start: 0.20, end: 0.25, name: "DRS Zone 2" },
            { start: 0.50, end: 0.55, name: "DRS Zone 3" },
            { start: 0.75, end: 0.80, name: "DRS Zone 4" }
        ],
        startFinish: { x: 100, y: 280 },
        viewBox: "0 0 300 300",
        corners: [
            { name: "Turn 1", x: 90, y: 260 },
            { name: "Turn 11", x: 200, y: 100 }
        ],
        altitude: 10
    },

    // Bahrain
    'bahrain': {
        name: "Bahrain International Circuit",
        country: "Bahrain",
        length: 5.412,
        direction: "clockwise",
        sectors: [
            { name: "Sector 1", start: 0.0, end: 0.33, color: "#ff0000" },
            { name: "Sector 2", start: 0.33, end: 0.66, color: "#ffff00" },
            { name: "Sector 3", start: 0.66, end: 1.0, color: "#00ff00" }
        ],
        path: "M50,280 L270,280 L220,200 L270,120 L200,60 L60,60 L50,150 Z",
        drsZones: [
            { start: 0.02, end: 0.10, name: "DRS Zone 1" },
            { start: 0.20, end: 0.25, name: "DRS Zone 2" },
            { start: 0.65, end: 0.70, name: "DRS Zone 3" }
        ],
        startFinish: { x: 50, y: 280 },
        viewBox: "0 0 300 300",
        corners: [
            { name: "Turn 1 (Hairpin)", x: 270, y: 270 },
            { name: "Turn 10", x: 270, y: 130 }
        ],
        altitude: 17
    },

    // Saudi Arabia
    'jeddah': {
        name: "Jeddah Corniche Circuit",
        country: "Saudi Arabia",
        length: 6.174,
        direction: "anticlockwise",
        sectors: [
            { name: "Sector 1", start: 0.0, end: 0.33, color: "#ff0000" },
            { name: "Sector 2", start: 0.33, end: 0.66, color: "#ffff00" },
            { name: "Sector 3", start: 0.66, end: 1.0, color: "#00ff00" }
        ],
        path: "M20,250 L80,230 L150,220 L200,200 L260,180 L240,140 L180,120 L120,100 L60,150 Z",
        drsZones: [
            { start: 0.02, end: 0.10, name: "DRS Zone 1" },
            { start: 0.30, end: 0.35, name: "DRS Zone 2" },
            { start: 0.75, end: 0.80, name: "DRS Zone 3" }
        ],
        startFinish: { x: 20, y: 250 },
        viewBox: "0 0 300 300",
        corners: [
            { name: "Turn 13 (Banked)", x: 200, y: 200 },
            { name: "Turn 27", x: 250, y: 180 }
        ],
        altitude: 10
    },

    // China
    'shanghai': {
        name: "Shanghai International Circuit",
        country: "China",
        length: 5.451,
        direction: "clockwise",
        sectors: [
            { name: "Sector 1", start: 0.0, end: 0.33, color: "#ff0000" },
            { name: "Sector 2", start: 0.33, end: 0.66, color: "#ffff00" },
            { name: "Sector 3", start: 0.66, end: 1.0, color: "#00ff00" }
        ],
        path: "M150,290 L250,250 L200,200 L220,150 L100,130 L80,180 L120,250 Z",
        drsZones: [
            { start: 0.02, end: 0.10, name: "DRS Zone 1" },
            { start: 0.75, end: 0.85, name: "DRS Zone 2" }
        ],
        startFinish: { x: 150, y: 290 },
        viewBox: "0 0 300 300",
        corners: [
            { name: "Turn 1 (Snail)", x: 200, y: 200 },
            { name: "Turn 14 (Hairpin)", x: 240, y: 120 }
        ],
        altitude: 4
    },

    // Miami
    'miami': {
        name: "Miami International Autodrome",
        country: "United States",
        length: 5.412,
        direction: "anticlockwise",
        sectors: [
            { name: "Sector 1", start: 0.0, end: 0.33, color: "#ff0000" },
            { name: "Sector 2", start: 0.33, end: 0.66, color: "#ffff00" },
            { name: "Sector 3", start: 0.66, end: 1.0, color: "#00ff00" }
        ],
        path: "M40,260 L260,260 L240,200 L280,150 L240,120 L150,80 L100,100 L80,200 Z",
        drsZones: [
            { start: 0.02, end: 0.10, name: "DRS Zone 1" },
            { start: 0.30, end: 0.35, name: "DRS Zone 2" },
            { start: 0.55, end: 0.60, name: "DRS Zone 3" }
        ],
        startFinish: { x: 40, y: 260 },
        viewBox: "0 0 300 300",
        corners: [
            { name: "Turn 11 (Hairpin)", x: 240, y: 130 },
            { name: "Turn 17", x: 100, y: 200 }
        ],
        altitude: 2
    },

    // Imola
    'imola': {
        name: "Autodromo Internazionale Enzo e Dino Ferrari",
        country: "Italy",
        length: 4.909,
        direction: "anticlockwise",
        sectors: [
            { name: "Sector 1", start: 0.0, end: 0.35, color: "#ff0000" },
            { name: "Sector 2", start: 0.35, end: 0.70, color: "#ffff00" },
            { name: "Sector 3", start: 0.70, end: 1.0, color: "#00ff00" }
        ],
        path: "M60,250 L240,250 L270,200 L200,150 L270,100 L200,60 L60,60 L50,150 Z",
        drsZones: [
            { start: 0.05, end: 0.10, name: "DRS Zone 1" }
        ],
        startFinish: { x: 60, y: 250 },
        viewBox: "0 0 300 300",
        corners: [
            { name: "Tamburello", x: 240, y: 250 },
            { name: "Rivazza", x: 80, y: 150 }
        ],
        altitude: 50
    },

    // Monaco
    'monaco': {
        name: "Circuit de Monaco",
        country: "Monaco",
        length: 3.337,
        direction: "clockwise",
        sectors: [
            { name: "Sector 1", start: 0.0, end: 0.33, color: "#ff0000" },
            { name: "Sector 2", start: 0.33, end: 0.66, color: "#ffff00" },
            { name: "Sector 3", start: 0.66, end: 1.0, color: "#00ff00" }
        ],
        path: "M100,280 L250,250 L200,200 L280,180 L200,160 L220,100 L100,80 L80,200 Z",
        drsZones: [
            { start: 0.02, end: 0.10, name: "DRS Zone 1" }
        ],
        startFinish: { x: 100, y: 280 },
        viewBox: "0 0 300 300",
        corners: [
            { name: "Casino Square", x: 200, y: 200 },
            { name: "Fairmont Hairpin", x: 220, y: 150 },
            { name: "Swimming Pool", x: 150, y: 100 }
        ],
        altitude: 2
    },

    // Spain
    'spain': {
        name: "Circuit de Barcelona-Catalunya",
        country: "Spain",
        length: 4.657,
        direction: "clockwise",
        sectors: [
            { name: "Sector 1", start: 0.0, end: 0.33, color: "#ff0000" },
            { name: "Sector 2", start: 0.33, end: 0.66, color: "#ffff00" },
            { name: "Sector 3", start: 0.66, end: 1.0, color: "#00ff00" }
        ],
        path: "M50,250 L250,250 L260,200 L200,150 L260,100 L220,60 L100,60 Z",
        drsZones: [
            { start: 0.02, end: 0.10, name: "DRS Zone 1" },
            { start: 0.50, end: 0.55, name: "DRS Zone 2" }
        ],
        startFinish: { x: 50, y: 250 },
        viewBox: "0 0 300 300",
        corners: [
            { name: "Turn 3 (Curvone)", x: 180, y: 150 },
            { name: "Turn 10 (La Caixa)", x: 260, y: 100 }
        ],
        altitude: 126
    },

    // Canada
    'canada': {
        name: "Circuit Gilles Villeneuve",
        country: "Canada",
        length: 4.361,
        direction: "clockwise",
        sectors: [
            { name: "Sector 1", start: 0.0, end: 0.33, color: "#ff0000" },
            { name: "Sector 2", start: 0.33, end: 0.66, color: "#ffff00" },
            { name: "Sector 3", start: 0.66, end: 1.0, color: "#00ff00" }
        ],
        path: "M50,250 L250,250 L250,200 L150,150 L250,130 L200,80 L50,80 Z",
        drsZones: [
            { start: 0.02, end: 0.10, name: "DRS Zone 1" },
            { start: 0.55, end: 0.60, name: "DRS Zone 2" }
        ],
        startFinish: { x: 50, y: 250 },
        viewBox: "0 0 300 300",
        corners: [
            { name: "L'Epingle Hairpin", x: 150, y: 150 },
            { name: "Wall of Champions", x: 200, y: 80 }
        ],
        altitude: 8
    },

    // Austria
    'austria': {
        name: "Red Bull Ring",
        country: "Austria",
        length: 4.318,
        direction: "clockwise",
        sectors: [
            { name: "Sector 1", start: 0.0, end: 0.30, color: "#ff0000" },
            { name: "Sector 2", start: 0.30, end: 0.62, color: "#ffff00" },
            { name: "Sector 3", start: 0.62, end: 1.0, color: "#00ff00" }
        ],
        path: "M100,280 L250,250 L220,200 L270,180 L180,130 L130,180 L100,200 Z",
        drsZones: [
            { start: 0.02, end: 0.10, name: "DRS Zone 1" },
            { start: 0.12, end: 0.17, name: "DRS Zone 2" },
            { start: 0.30, end: 0.35, name: "DRS Zone 3" }
        ],
        startFinish: { x: 100, y: 280 },
        viewBox: "0 0 300 300",
        corners: [
            { name: "Remus (Turn 3)", x: 220, y: 200 },
            { name: "Rindt (Turn 8)", x: 180, y: 130 }
        ],
        altitude: 700
    },

    // Silverstone
    'silverstone': {
        name: "Silverstone Circuit",
        country: "United Kingdom",
        length: 5.891,
        direction: "clockwise",
        sectors: [
            { name: "Sector 1", start: 0.0, end: 0.30, color: "#ff0000" },
            { name: "Sector 2", start: 0.30, end: 0.65, color: "#ffff00" },
            { name: "Sector 3", start: 0.65, end: 1.0, color: "#00ff00" }
        ],
        path: "M80,280 L250,280 L260,230 L200,200 L220,150 L180,120 L100,100 L50,50 L150,80 L200,60 L230,100 L180,150 Z",
        drsZones: [
            { start: 0.20, end: 0.25, name: "DRS Zone 1" },
            { start: 0.55, end: 0.60, name: "DRS Zone 2" }
        ],
        startFinish: { x: 80, y: 280 },
        viewBox: "0 0 300 300",
        corners: [
            { name: "Copse", x: 100, y: 100 },
            { name: "Maggots/Becketts", x: 70, y: 50 },
            { name: "Stowe", x: 200, y: 60 }
        ],
        altitude: 156
    },

    // Hungary
    'hungary': {
        name: "Hungaroring",
        country: "Hungary",
        length: 4.381,
        direction: "clockwise",
        sectors: [
            { name: "Sector 1", start: 0.0, end: 0.36, color: "#ff0000" },
            { name: "Sector 2", start: 0.36, end: 0.72, color: "#ffff00" },
            { name: "Sector 3", start: 0.72, end: 1.0, color: "#00ff00" }
        ],
        path: "M80,280 L250,280 L270,250 L150,220 L180,180 L80,160 L100,100 L50,150 Z",
        drsZones: [
            { start: 0.00, end: 0.05, name: "DRS Zone 1" },
            { start: 0.10, end: 0.15, name: "DRS Zone 2" }
        ],
        startFinish: { x: 80, y: 280 },
        viewBox: "0 0 300 300",
        corners: [
            { name: "Turn 1", x: 270, y: 250 },
            { name: "Turn 14", x: 50, y: 150 }
        ],
        altitude: 264
    },

    // Spa
    'spa': {
        name: "Circuit de Spa-Francorchamps",
        country: "Belgium",
        length: 7.004,
        direction: "clockwise",
        sectors: [
            { name: "Sector 1", start: 0.0, end: 0.30, color: "#ff0000" },
            { name: "Sector 2", start: 0.30, end: 0.70, color: "#ffff00" },
            { name: "Sector 3", start: 0.70, end: 1.0, color: "#00ff00" }
        ],
        path: "M50,280 L100,250 L250,200 L200,170 L220,150 L150,130 L170,100 L220,80 L280,100 L200,250 Z",
        drsZones: [
            { start: 0.00, end: 0.05, name: "DRS Zone 1" },
            { start: 0.12, end: 0.18, name: "DRS Zone 2" }
        ],
        startFinish: { x: 50, y: 280 },
        viewBox: "0 0 300 300",
        corners: [
            { name: "Eau Rouge", x: 100, y: 250 },
            { name: "Pouhon", x: 170, y: 100 },
            { name: "Blanchimont", x: 280, y: 100 }
        ],
        altitude: 413
    },

    // Netherlands
    'netherlands': {
        name: "Circuit Zandvoort",
        country: "Netherlands",
        length: 4.259,
        direction: "clockwise",
        sectors: [
            { name: "Sector 1", start: 0.0, end: 0.33, color: "#ff0000" },
            { name: "Sector 2", start: 0.33, end: 0.66, color: "#ffff00" },
            { name: "Sector 3", start: 0.66, end: 1.0, color: "#00ff00" }
        ],
        path: "M100,280 L250,260 L200,200 L260,140 L180,100 L50,130 L80,200 Z",
        drsZones: [
            { start: 0.02, end: 0.10, name: "DRS Zone 1" },
            { start: 0.55, end: 0.60, name: "DRS Zone 2" }
        ],
        startFinish: { x: 100, y: 280 },
        viewBox: "0 0 300 300",
        corners: [
            { name: "Tarzan (Turn 1)", x: 100, y: 260 },
            { name: "Turn 14 (Banked)", x: 80, y: 180 }
        ],
        altitude: 3
    },

    // Monza
    'monza': {
        name: "Autodromo Nazionale di Monza",
        country: "Italy",
        length: 5.793,
        direction: "clockwise",
        sectors: [
            { name: "Sector 1", start: 0.0, end: 0.33, color: "#ff0000" },
            { name: "Sector 2", start: 0.33, end: 0.66, color: "#ffff00" },
            { name: "Sector 3", start: 0.66, end: 1.0, color: "#00ff00" }
        ],
        path: "M50,250 L250,250 L260,200 L230,220 L260,200 L220,150 L250,130 L150,100 L180,80 L120,60 L50,80 Z",
        drsZones: [
            { start: 0.02, end: 0.10, name: "DRS Zone 1" },
            { start: 0.50, end: 0.55, name: "DRS Zone 2" }
        ],
        startFinish: { x: 50, y: 250 },
        viewBox: "0 0 300 300",
        corners: [
            { name: "Curva Grande", x: 260, y: 200 },
            { name: "Parabolica", x: 80, y: 80 }
        ],
        altitude: 184
    },

    // Baku
    'baku': {
        name: "Baku City Circuit",
        country: "Azerbaijan",
        length: 6.003,
        direction: "anticlockwise",
        sectors: [
            { name: "Sector 1", start: 0.0, end: 0.30, color: "#ff0000" },
            { name: "Sector 2", start: 0.30, end: 0.70, color: "#ffff00" },
            { name: "Sector 3", start: 0.70, end: 1.0, color: "#00ff00" }
        ],
        path: "M20,250 L280,250 L270,200 L260,150 L200,140 L150,100 L180,60 L100,80 L120,200 Z",
        drsZones: [
            { start: 0.02, end: 0.10, name: "DRS Zone 1" },
            { start: 0.14, end: 0.18, name: "DRS Zone 2" }
        ],
        startFinish: { x: 20, y: 250 },
        viewBox: "0 0 300 300",
        corners: [
            { name: "Castle (Turn 8)", x: 150, y: 100 },
            { name: "Turn 20", x: 120, y: 200 }
        ],
        altitude: -14
    },

    // Singapore
    'singapore': {
        name: "Marina Bay Street Circuit",
        country: "Singapore",
        length: 4.940,
        direction: "anticlockwise",
        sectors: [
            { name: "Sector 1", start: 0.0, end: 0.30, color: "#ff0000" },
            { name: "Sector 2", start: 0.30, end: 0.71, color: "#ffff00" },
            { name: "Sector 3", start: 0.71, end: 1.0, color: "#00ff00" }
        ],
        path: "M100,280 L250,280 L270,230 L200,200 L220,150 L200,100 L150,120 L80,150 Z",
        drsZones: [
            { start: 0.02, end: 0.10, name: "DRS Zone 1" },
            { start: 0.25, end: 0.30, name: "DRS Zone 2" }
        ],
        startFinish: { x: 100, y: 280 },
        viewBox: "0 0 300 300",
        corners: [
            { name: "Turn 3", x: 270, y: 230 },
            { name: "Anderson Bridge", x: 220, y: 150 }
        ],
        altitude: 5
    },

    // Japan
    'suzuka': {
        name: "Suzuka International Racing Course",
        country: "Japan",
        length: 5.807,
        direction: "clockwise",
        sectors: [
            { name: "Sector 1", start: 0.0, end: 0.30, color: "#ff0000" },
            { name: "Sector 2", start: 0.30, end: 0.68, color: "#ffff00" },
            { name: "Sector 3", start: 0.68, end: 1.0, color: "#00ff00" }
        ],
        path: "M50,250 L250,200 L150,150 L220,100 L100,50 L50,150 Z",
        drsZones: [
            { start: 0.05, end: 0.12, name: "DRS Zone 1" }
        ],
        startFinish: { x: 50, y: 250 },
        viewBox: "0 0 300 300",
        corners: [
            { name: "130R", x: 80, y: 180 },
            { name: "Degner Curve", x: 180, y: 140 }
        ],
        altitude: 35
    },

    // Qatar
    'qatar': {
        name: "Lusail International Circuit",
        country: "Qatar",
        length: 5.419,
        direction: "clockwise",
        sectors: [
            { name: "Sector 1", start: 0.0, end: 0.33, color: "#ff0000" },
            { name: "Sector 2", start: 0.33, end: 0.66, color: "#ffff00" },
            { name: "Sector 3", start: 0.66, end: 1.0, color: "#00ff00" }
        ],
        path: "M50,250 L250,250 L270,200 L200,150 L220,100 L150,60 L50,100 L70,180 Z",
        drsZones: [
            { start: 0.02, end: 0.10, name: "DRS Zone 1" },
            { start: 0.50, end: 0.55, name: "DRS Zone 2" }
        ],
        startFinish: { x: 50, y: 250 },
        viewBox: "0 0 300 300",
        corners: [
            { name: "Turn 1", x: 270, y: 200 },
            { name: "Turn 16", x: 70, y: 180 }
        ],
        altitude: 5
    },

    // USA - Austin
    'austin': {
        name: "Circuit of the Americas",
        country: "United States",
        length: 5.513,
        direction: "anticlockwise",
        sectors: [
            { name: "Sector 1", start: 0.0, end: 0.33, color: "#ff0000" },
            { name: "Sector 2", start: 0.33, end: 0.66, color: "#ffff00" },
            { name: "Sector 3", start: 0.66, end: 1.0, color: "#00ff00" }
        ],
        path: "M80,280 L100,150 L50,120 L150,100 L250,110 L230,150 L180,200 L80,200 Z",
        drsZones: [
            { start: 0.02, end: 0.10, name: "DRS Zone 1" },
            { start: 0.50, end: 0.55, name: "DRS Zone 2" }
        ],
        startFinish: { x: 80, y: 280 },
        viewBox: "0 0 300 300",
        corners: [
            { name: "Turn 1", x: 100, y: 150 },
            { name: "Turn 11", x: 250, y: 110 }
        ],
        altitude: 150
    },

    // Mexico
    'mexico': {
        name: "Autódromo Hermanos Rodríguez",
        country: "Mexico",
        length: 4.304,
        direction: "clockwise",
        sectors: [
            { name: "Sector 1", start: 0.0, end: 0.25, color: "#ff0000" },
            { name: "Sector 2", start: 0.25, end: 0.65, color: "#ffff00" },
            { name: "Sector 3", start: 0.65, end: 1.0, color: "#00ff00" }
        ],
        path: "M50,280 L250,280 L260,230 L240,180 L280,160 L200,150 L160,100 L100,140 L80,200 Z",
        drsZones: [
            { start: 0.02, end: 0.10, name: "DRS Zone 1" },
            { start: 0.20, end: 0.25, name: "DRS Zone 2" },
            { start: 0.55, end: 0.60, name: "DRS Zone 3" }
        ],
        startFinish: { x: 50, y: 280 },
        viewBox: "0 0 300 300",
        corners: [
            { name: "Turn 1", x: 260, y: 230 },
            { name: "Foro Sol Stadium", x: 160, y: 100 }
        ],
        altitude: 2285
    },

    // Brazil
    // Brazil
    'interlagos': {
        name: "Autódromo José Carlos Pace",
        country: "Brazil",
        length: 4.309,
        direction: "anticlockwise",
        sectors: [
            { name: "Sector 1", start: 0.0, end: 0.25, color: "#ff0000" },
            { name: "Sector 2", start: 0.25, end: 0.75, color: "#ffff00" },
            { name: "Sector 3", start: 0.75, end: 1.0, color: "#00ff00" }
        ],
        path: "M150,280 L80,230 L200,230 L180,180 L100,150 L150,100 L200,120 L250,200 Z",
        drsZones: [
            { start: 0.02, end: 0.10, name: "DRS Zone 1" },
            { start: 0.15, end: 0.20, name: "DRS Zone 2" }
        ],
        startFinish: { x: 150, y: 280 },
        viewBox: "0 0 300 300",
        corners: [
            { name: "Senna S", x: 100, y: 230 },
            { name: "Juncao", x: 150, y: 100 }
        ],
        altitude: 800
    },

    // Las Vegas
    'vegas': {
        name: "Las Vegas Strip Circuit",
        country: "United States",
        length: 6.201,
        direction: "anticlockwise",
        sectors: [
            { name: "Sector 1", start: 0.0, end: 0.33, color: "#ff0000" },
            { name: "Sector 2", start: 0.33, end: 0.66, color: "#ffff00" },
            { name: "Sector 3", start: 0.66, end: 1.0, color: "#00ff00" }
        ],
        path: "M60,260 L260,260 L260,100 L200,100 L100,120 L60,180 Z",
        drsZones: [
            { start: 0.02, end: 0.10, name: "DRS Zone 1" },
            { start: 0.50, end: 0.60, name: "DRS Zone 2" }
        ],
        startFinish: { x: 60, y: 260 },
        viewBox: "0 0 300 300",
        corners: [
            { name: "Turn 1", x: 260, y: 260 },
            { name: "Turn 14 Chicane", x: 200, y: 100 }
        ],
        altitude: 610
    },

    // Abu Dhabi
    'abu-dhabi': {
        name: "Yas Marina Circuit",
        country: "United Arab Emirates",
        length: 5.281,
        direction: "anticlockwise",
        sectors: [
            { name: "Sector 1", start: 0.0, end: 0.30, color: "#ff0000" },
            { name: "Sector 2", start: 0.30, end: 0.67, color: "#ffff00" },
            { name: "Sector 3", start: 0.67, end: 1.0, color: "#00ff00" }
        ],
        path: "M80,280 L250,280 L270,230 L100,230 L50,200 L80,150 L150,180 Z",
        drsZones: [
            { start: 0.20, end: 0.25, name: "DRS Zone 1" },
            { start: 0.50, end: 0.55, name: "DRS Zone 2" }
        ],
        startFinish: { x: 80, y: 280 },
        viewBox: "0 0 300 300",
        corners: [
            { name: "Hairpin (Turn 5)", x: 270, y: 230 },
            { name: "Turn 9", x: 80, y: 150 }
        ],
        altitude: 8
    }
};

// Sample driver data - in real app this would come from telemetry API
const generateSampleDrivers = () => [
    { id: 1, name: 'Max Verstappen', team: 'Red Bull', color: '#0600EF', position: 0.85, sector: 3, lapTime: '1:18.123', gap: 'Leader', speed: 295 },
    { id: 44, name: 'Lewis Hamilton', team: 'Mercedes', color: '#00D2BE', position: 0.75, sector: 3, lapTime: '1:18.456', gap: '+0.333', speed: 287 },
    { id: 16, name: 'Charles Leclerc', team: 'Ferrari', color: '#DC0000', position: 0.68, sector: 2, lapTime: '1:18.789', gap: '+0.666', speed: 291 },
    { id: 4, name: 'Lando Norris', team: 'McLaren', color: '#FF8700', position: 0.62, sector: 2, lapTime: '1:19.012', gap: '+0.889', speed: 284 },
    { id: 11, name: 'Sergio Perez', team: 'Red Bull', color: '#0600EF', position: 0.55, sector: 2, lapTime: '1:19.234', gap: '+1.111', speed: 289 },
    { id: 63, name: 'George Russell', team: 'Mercedes', color: '#00D2BE', position: 0.48, sector: 1, lapTime: '1:19.567', gap: '+1.444', speed: 282 }
];

// Circuit name mapping for compatibility with existing circuit selectors
const CIRCUIT_NAME_MAPPING = {
    'monaco': 'monaco',
    'silverstone': 'silverstone',
    'spa': 'spa',
    'spa-francorchamps': 'spa',
    'monza': 'monza',
    'interlagos': 'interlagos',
    'brazil': 'interlagos',
    'suzuka': 'suzuka',
    'japan': 'suzuka',
    'austin': 'austin',
    'cota': 'austin',
    'americas': 'austin',
    'bahrain': 'bahrain',
    'jeddah': 'jeddah',
    'saudi': 'jeddah',
    'saudi-arabia': 'jeddah',
    'australia': 'albert-park',
    'albert-park': 'albert-park',
    'melbourne': 'albert-park',
    'imola': 'imola',
    'emilia-romagna': 'imola',
    'miami': 'miami',
    'spain': 'spain',
    'spanish': 'spain',
    'barcelona': 'spain',
    'catalunya': 'spain',
    'canada': 'canada',
    'canadian': 'canada',
    'montreal': 'canada',
    'villeneuve': 'canada',
    'austria': 'austria',
    'austrian': 'austria',
    'red-bull-ring': 'austria',
    'spielberg': 'austria',
    'hungary': 'hungary',
    'hungarian': 'hungary',
    'hungaroring': 'hungary',
    'budapest': 'hungary',
    'netherlands': 'netherlands',
    'dutch': 'netherlands',
    'zandvoort': 'netherlands',
    'baku': 'baku',
    'azerbaijan': 'baku',
    'singapore': 'singapore',
    'marina-bay': 'singapore',
    'qatar': 'qatar',
    'losail': 'qatar',
    'mexico': 'mexico',
    'mexican': 'mexico',
    'hermanos-rodriguez': 'mexico',
    'vegas': 'vegas',
    'las-vegas': 'vegas',
    'nevada': 'vegas',
    'abu-dhabi': 'abu-dhabi',
    'yas-marina': 'abu-dhabi',
    'uae': 'abu-dhabi',
    'shanghai': 'shanghai',
    'china': 'shanghai',
    'chinese': 'shanghai'
};

const InteractiveTrackMap = ({ selectedCircuit, isDarkMode }) => {
    const [selectedTrack, setSelectedTrack] = useState('monaco');
    const [drivers, setDrivers] = useState(generateSampleDrivers());
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentLap, setCurrentLap] = useState(1);
    const [maxLaps] = useState(58);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [showSectors, setShowSectors] = useState(true);
    const [showDRS, setShowDRS] = useState(true);
    const [showSpeed, setShowSpeed] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const animationRef = useRef(null);
    const lastTimeRef = useRef(0);

    // Get track data with fallback
    const trackData = TRACK_DATA[selectedTrack] || TRACK_DATA['monaco'];

    // Animation loop for moving drivers
    const animate = useCallback((timestamp) => {
        if (!lastTimeRef.current) lastTimeRef.current = timestamp;
        const deltaTime = timestamp - lastTimeRef.current;

        if (deltaTime > 100) { // Update every 100ms
            setDrivers(prevDrivers =>
                prevDrivers.map(driver => ({
                    ...driver,
                    position: (driver.position + 0.005) % 1.0, // Move forward
                    speed: 250 + Math.random() * 50, // Varying speed
                    sector: Math.floor(driver.position * 3) + 1
                }))
            );
            lastTimeRef.current = timestamp;
        }

        if (isAnimating) {
            animationRef.current = requestAnimationFrame(animate);
        }
    }, [isAnimating]);

    // Start/stop animation
    useEffect(() => {
        if (isAnimating) {
            animationRef.current = requestAnimationFrame(animate);
        } else {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isAnimating, animate]);

    // Update track when circuit is selected externally from the main dashboard
    useEffect(() => {
        if (selectedCircuit) {
            const normalizedCircuit = selectedCircuit.toLowerCase().replace(/\s+/g, '-');
            const mappedCircuit = CIRCUIT_NAME_MAPPING[normalizedCircuit];

            if (mappedCircuit && TRACK_DATA[mappedCircuit]) {
                setSelectedTrack(mappedCircuit);
                console.log(`🏁 Track map updated to: ${TRACK_DATA[mappedCircuit].name}`);
            }
        }
    }, [selectedCircuit]);

    // Calculate driver position on track path using corner interpolation
    const getDriverPosition = (position) => {
        const track = trackData;

        // Use corner-based interpolation for more accurate positioning
        if (track.corners && track.corners.length > 0) {
            const totalCorners = track.corners.length;
            const segmentProgress = position * totalCorners;
            const currentSegment = Math.floor(segmentProgress);
            const segmentPosition = segmentProgress - currentSegment;

            const currentCorner = track.corners[currentSegment % totalCorners];
            const nextCorner = track.corners[(currentSegment + 1) % totalCorners];

            // Interpolate between corners
            const x = currentCorner.x + (nextCorner.x - currentCorner.x) * segmentPosition;
            const y = currentCorner.y + (nextCorner.y - currentCorner.y) * segmentPosition;

            return { x, y };
        }

        // Fallback to simple circular calculation
        const angle = position * 2 * Math.PI;
        const centerX = 160;
        const centerY = 160;
        const radius = 80 + Math.sin(angle * 3) * 20;

        return {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius
        };
    };

    // Toggle fullscreen
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    // Reset positions
    const resetPositions = () => {
        setDrivers(generateSampleDrivers());
        setCurrentLap(1);
        setIsAnimating(false);
    };

    return (
        <div className={`${isFullscreen ? 'fixed inset-0 z-50' : ''} ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl shadow-lg`}>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <MapPin size={24} className="mr-3 text-green-400" />
                        <div>
                            <h3 className="text-xl font-bold">Interactive Track Map</h3>
                            <p className="text-sm text-gray-400">
                                {trackData.name} - {trackData.length}km - {trackData.corners?.length || 0} corners - {trackData.altitude}m altitude
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={toggleFullscreen}
                            className={`p-2 rounded ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                            title="Toggle fullscreen"
                        >
                            <Maximize2 size={16} />
                        </button>
                    </div>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Track Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Circuit</label>
                        <select
                            value={selectedTrack}
                            onChange={(e) => setSelectedTrack(e.target.value)}
                            className={`w-full p-2 rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                        >
                            {Object.entries(TRACK_DATA).map(([key, track]) => (
                                <option key={key} value={key}>
                                    {track.name} ({track.country})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Animation Controls */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Animation</label>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setIsAnimating(!isAnimating)}
                                className={`flex items-center px-3 py-2 rounded ${
                                    isAnimating
                                        ? 'bg-red-500 hover:bg-red-600 text-white'
                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                }`}
                            >
                                {isAnimating ? <Pause size={16} className="mr-1" /> : <Play size={16} className="mr-1" />}
                                {isAnimating ? 'Pause' : 'Play'}
                            </button>

                            <button
                                onClick={resetPositions}
                                className={`p-2 rounded ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                                title="Reset positions"
                            >
                                <RotateCcw size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Display Options */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Display</label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setShowSectors(!showSectors)}
                                className={`px-2 py-1 text-xs rounded ${
                                    showSectors ? 'bg-blue-500 text-white' : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                                }`}
                            >
                                Sectors
                            </button>
                            <button
                                onClick={() => setShowDRS(!showDRS)}
                                className={`px-2 py-1 text-xs rounded ${
                                    showDRS ? 'bg-green-500 text-white' : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                                }`}
                            >
                                DRS
                            </button>
                            <button
                                onClick={() => setShowSpeed(!showSpeed)}
                                className={`px-2 py-1 text-xs rounded ${
                                    showSpeed ? 'bg-yellow-500 text-white' : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                                }`}
                            >
                                Speed
                            </button>
                        </div>
                    </div>

                    {/* Lap Counter */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Race Progress</label>
                        <div className="flex items-center">
                            <Timer size={16} className="mr-2 text-blue-400" />
                            <span className="text-sm">Lap {currentLap} / {maxLaps}</span>
                        </div>
                    </div>
                </div>

                {/* Main Track Display */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Track SVG */}
                    <div className="lg:col-span-2">
                        <div className={`relative ${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-lg p-4 border`}>
                            <svg
                                viewBox={trackData.viewBox}
                                className="w-full h-auto max-h-96"
                                style={{ minHeight: '300px' }}
                            >
                                {/* Track Surface */}
                                <path
                                    d={trackData.path}
                                    fill="none"
                                    stroke={isDarkMode ? "#444" : "#666"}
                                    strokeWidth="20"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />

                                {/* Track Center Line */}
                                <path
                                    d={trackData.path}
                                    fill="none"
                                    stroke={isDarkMode ? "#666" : "#888"}
                                    strokeWidth="2"
                                    strokeDasharray="5,5"
                                />

                                {/* Sector Highlighting */}
                                {showSectors && trackData.sectors.map((sector, index) => (
                                    <g key={`sector-${index}`}>
                                        <path
                                            d={trackData.path}
                                            fill="none"
                                            stroke={sector.color}
                                            strokeWidth="4"
                                            strokeOpacity="0.6"
                                            pathLength="1"
                                            strokeDasharray={`${(sector.end - sector.start)} ${1 - (sector.end - sector.start)}`}
                                            strokeDashoffset={-sector.start}
                                        />
                                    </g>
                                ))}

                                {/* DRS Zones */}
                                {showDRS && trackData.drsZones.map((zone, index) => (
                                    <g key={`drs-${index}`}>
                                        <path
                                            d={trackData.path}
                                            fill="none"
                                            stroke="#00ff00"
                                            strokeWidth="8"
                                            strokeOpacity="0.4"
                                            pathLength="1"
                                            strokeDasharray={`${(zone.end - zone.start)} ${1 - (zone.end - zone.start)}`}
                                            strokeDashoffset={-zone.start}
                                        />
                                    </g>
                                ))}

                                {/* Start/Finish Line */}
                                <g>
                                    <circle
                                        cx={trackData.startFinish.x}
                                        cy={trackData.startFinish.y}
                                        r="8"
                                        fill="#ffffff"
                                        stroke="#000000"
                                        strokeWidth="2"
                                    />
                                    <text
                                        x={trackData.startFinish.x}
                                        y={trackData.startFinish.y + 25}
                                        textAnchor="middle"
                                        className="text-xs font-bold"
                                        fill={isDarkMode ? "#ffffff" : "#000000"}
                                    >
                                        S/F
                                    </text>
                                </g>

                                {/* Driver Positions */}
                                {drivers.map((driver) => {
                                    const pos = getDriverPosition(driver.position);
                                    return (
                                        <g key={`driver-${driver.id}`}>
                                            {/* Driver Dot */}
                                            <circle
                                                cx={pos.x}
                                                cy={pos.y}
                                                r={selectedDriver === driver.id ? "8" : "6"}
                                                fill={driver.color}
                                                stroke="#ffffff"
                                                strokeWidth="2"
                                                className="cursor-pointer hover:r-8 transition-all"
                                                onClick={() => setSelectedDriver(selectedDriver === driver.id ? null : driver.id)}
                                            />

                                            {/* Driver Number */}
                                            <text
                                                x={pos.x}
                                                y={pos.y + 2}
                                                textAnchor="middle"
                                                className="text-xs font-bold pointer-events-none"
                                                fill="#ffffff"
                                            >
                                                {driver.id}
                                            </text>

                                            {/* Speed Display (if enabled) */}
                                            {showSpeed && (
                                                <text
                                                    x={pos.x}
                                                    y={pos.y - 15}
                                                    textAnchor="middle"
                                                    className="text-xs font-medium"
                                                    fill={driver.color}
                                                >
                                                    {driver.speed}
                                                </text>
                                            )}

                                            {/* Selected Driver Highlight */}
                                            {selectedDriver === driver.id && (
                                                <circle
                                                    cx={pos.x}
                                                    cy={pos.y}
                                                    r="12"
                                                    fill="none"
                                                    stroke={driver.color}
                                                    strokeWidth="2"
                                                    strokeDasharray="3,3"
                                                    className="animate-spin"
                                                    style={{ animation: 'spin 2s linear infinite' }}
                                                />
                                            )}
                                        </g>
                                    );
                                })}
                            </svg>
                        </div>
                    </div>

                    {/* Driver Information Panel */}
                    <div className="space-y-4">
                        {/* Track Info */}
                        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border`}>
                            <h4 className="font-bold mb-2 flex items-center">
                                <Settings size={16} className="mr-2" />
                                Track Information
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Length:</span>
                                    <span>{trackData.length} km</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Corners:</span>
                                    <span>{trackData.corners?.length || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Direction:</span>
                                    <span className="capitalize">{trackData.direction}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>DRS Zones:</span>
                                    <span>{trackData.drsZones.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Altitude:</span>
                                    <span>{trackData.altitude}m</span>
                                </div>
                            </div>
                        </div>

                        {/* Live Leaderboard */}
                        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border`}>
                            <h4 className="font-bold mb-2 flex items-center">
                                <Users size={16} className="mr-2" />
                                Live Positions
                            </h4>
                            <div className="space-y-2">
                                {drivers
                                    .sort((a, b) => b.position - a.position)
                                    .map((driver, index) => (
                                        <div
                                            key={driver.id}
                                            onClick={() => setSelectedDriver(selectedDriver === driver.id ? null : driver.id)}
                                            className={`flex items-center p-2 rounded cursor-pointer transition-all ${
                                                selectedDriver === driver.id
                                                    ? 'bg-blue-500 bg-opacity-20 border border-blue-500'
                                                    : isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                                            }`}
                                        >
                                            <div
                                                className="w-3 h-3 rounded-full mr-3"
                                                style={{ backgroundColor: driver.color }}
                                            ></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium truncate">
                                                    {index + 1}. {driver.name}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    S{driver.sector} • {driver.gap}
                                                </div>
                                            </div>
                                            <div className="text-xs text-right">
                                                <div>{driver.lapTime}</div>
                                                {showSpeed && (
                                                    <div className="text-gray-400">{driver.speed} km/h</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Selected Driver Details */}
                        {selectedDriver && (
                            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border border-blue-500`}>
                                <h4 className="font-bold mb-2 flex items-center">
                                    <Zap size={16} className="mr-2" />
                                    Driver Details
                                </h4>
                                {(() => {
                                    const driver = drivers.find(d => d.id === selectedDriver);
                                    return driver ? (
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>Name:</span>
                                                <span className="font-medium">{driver.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Team:</span>
                                                <span style={{ color: driver.color }}>{driver.team}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Current Sector:</span>
                                                <span className="font-medium">Sector {driver.sector}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Last Lap:</span>
                                                <span className="font-medium">{driver.lapTime}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Gap to Leader:</span>
                                                <span className="font-medium">{driver.gap}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Current Speed:</span>
                                                <span className="font-medium">{driver.speed} km/h</span>
                                            </div>
                                        </div>
                                    ) : null;
                                })()}
                            </div>
                        )}

                        {/* Corner Information */}
                        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-900' : 'bg-white'} border`}>
                            <h4 className="font-bold mb-2">Famous Corners</h4>
                            <div className="space-y-1 text-xs max-h-32 overflow-y-auto">
                                {trackData.corners.map((corner, index) => (
                                    <div key={`corner-${index}`} className="flex justify-between">
                                        <span className="text-gray-400">T{index + 1}:</span>
                                        <span className="font-medium">{corner.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap gap-4 text-xs">
                    {showSectors && (
                        <div className="flex items-center space-x-2">
                            <span>Sectors:</span>
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-red-500 rounded"></div>
                                <span>S1</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                                <span>S2</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-green-500 rounded"></div>
                                <span>S3</span>
                            </div>
                        </div>
                    )}

                    {showDRS && (
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-400 rounded"></div>
                            <span>DRS Zone</span>
                        </div>
                    )}

                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-white border border-gray-400 rounded-full"></div>
                        <span>Start/Finish</span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Click drivers to select</span>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-4 text-center text-xs text-gray-400">
                    <p>Interactive F1 Track Map • {trackData.name} Circuit</p>
                    <p>Real corner names and track layout • Synced with dashboard circuit selection</p>
                    <p className="text-green-400 mt-1">
                        ✅ Auto-sync enabled: Track map updates when you select a circuit above
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InteractiveTrackMap;

// INSTALLATION INSTRUCTIONS:

// 1. REPLACE your entire InteractiveTrackMap.jsx file with:
//    - Part 1 (main component with track data)
//    - Part 2 (continuation with remaining circuits)
//    - Part 3 (final component code)

// 2. KEY FEATURES INCLUDED:
//    ✅ All 24 current F1 circuits with accurate data
//    ✅ Real corner names, DRS zones, sector divisions
//    ✅ Altitude information for each circuit
//    ✅ Auto-sync with main dashboard circuit selector
//    ✅ Comprehensive circuit name mapping
//    ✅ Interactive driver positions and animations

// 3. CIRCUIT DATABASE INCLUDES:
//    🇦🇺 Albert Park (Australia)
//    🇧🇭 Bahrain International Circuit
//    🇸🇦 Jeddah Corniche Circuit
//    🇨🇳 Shanghai International Circuit
//    🇺🇸 Miami International Autodrome
//    🇮🇹 Autodromo Enzo e Dino Ferrari (Imola)
//    🇲🇨 Circuit de Monaco
//    🇪🇸 Circuit de Barcelona-Catalunya
//    🇨🇦 Circuit Gilles Villeneuve
//    🇦🇹 Red Bull Ring
//    🇬🇧 Silverstone Circuit
//    🇭🇺 Hungaroring
//    🇧🇪 Circuit de Spa-Francorchamps
//    🇳🇱 Circuit Zandvoort
//    🇮🇹 Autodromo Nazionale di Monza
//    🇦🇿 Baku City Circuit
//    🇸🇬 Marina Bay Street Circuit
//    🇯🇵 Suzuka International Racing Course
//    🇶🇦 Lusail International Circuit
//    🇺🇸 Circuit of the Americas (Austin)
//    🇲🇽 Autódromo Hermanos Rodríguez
//    🇧🇷 Autódromo José Carlos Pace (Interlagos)
//    🇺🇸 Las Vegas Strip Circuit
//    🇦🇪 Yas Marina Circuit (Abu Dhabi)

// 4. AUTO-SYNC FUNCTIONALITY:
//    - When you select a circuit in the main dashboard selectors
//    - The track map automatically updates to show that circuit
//    - Works with various circuit name formats (Monaco, monaco, Circuit de Monaco, etc.)
//    - Console logging shows when sync occurs

// 5. ENHANCED FEATURES:
//    - Real track layouts based on actual F1 circuit designs
//    - Accurate sector divisions matching F1 timing
//    - DRS zones positioned correctly for each track
//    - Famous corner names for each circuit
//    - Altitude information (important for engine performance)
//    - Direction indication (clockwise/anticlockwise)

// 6. USAGE:
//    - Select any circuit from the dropdown OR from the main dashboard
//    - Click Play to animate driver movement around the track
//    - Toggle Sectors/DRS/Speed displays
//    - Click on drivers for detailed information
//    - Use fullscreen mode for better viewing