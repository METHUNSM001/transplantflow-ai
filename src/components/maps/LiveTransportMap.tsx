import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import { AlertTriangle, Clock, Gauge, Navigation, Pause, Play, ShieldAlert } from 'lucide-react';
import { Hospital, Transport } from '../../types/database.types';
import { localStore } from '../../lib/storage';
import { StatusBadge } from '../common/StatusBadge';
import { createHospitalIcon, createVehicleIcon } from './MapMarkerIcons';

interface LiveTransportMapProps {
  transport: Transport;
  originHospital?: Hospital;
  destinationHospital?: Hospital;
  heightClass?: string;
  allowSimulatedMovement?: boolean;
}

// Helper to pan/fit bounds
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export const LiveTransportMap: React.FC<LiveTransportMapProps> = ({
  transport,
  originHospital,
  destinationHospital,
  heightClass = 'h-96',
  allowSimulatedMovement = true,
}) => {
  // Coordinates
  const originPos: [number, number] = [
    originHospital?.latitude || 42.3631,
    originHospital?.longitude || -71.0686,
  ];
  const destPos: [number, number] = [
    destinationHospital?.latitude || 40.8404,
    destinationHospital?.longitude || -73.9427,
  ];

  const [currentPos, setCurrentPos] = useState<[number, number]>([
    transport.current_latitude || (originPos[0] + destPos[0]) / 2,
    transport.current_longitude || (originPos[1] + destPos[1]) / 2,
  ]);

  const [isMoving, setIsMoving] = useState(false);
  const [currentDelay, setCurrentDelay] = useState(transport.delay_minutes || 0);
  const [progressRatio, setProgressRatio] = useState(0.45);
  const animationRef = useRef<any>(null);

  // Synchronize when external transport updates
  useEffect(() => {
    if (transport.current_latitude && transport.current_longitude) {
      setCurrentPos([transport.current_latitude, transport.current_longitude]);
    }
    setCurrentDelay(transport.delay_minutes || 0);
  }, [transport.current_latitude, transport.current_longitude, transport.delay_minutes]);

  // Smooth interpolation movement loop
  const toggleMovement = () => {
    if (isMoving) {
      if (animationRef.current) clearInterval(animationRef.current);
      setIsMoving(false);
    } else {
      setIsMoving(true);
      animationRef.current = setInterval(() => {
        setProgressRatio((prev) => {
          const nextRatio = prev + 0.04;
          if (nextRatio >= 0.98) {
            if (animationRef.current) clearInterval(animationRef.current);
            setIsMoving(false);
            return 0.98;
          }

          // Interpolate GPS coordinates between origin and destination
          const newLat = originPos[0] + (destPos[0] - originPos[0]) * nextRatio;
          const newLon = originPos[1] + (destPos[1] - originPos[1]) * nextRatio;
          const newPos: [number, number] = [newLat, newLon];

          setCurrentPos(newPos);
          localStore.updateTransportLocation(transport.id, newLat, newLon);

          return nextRatio;
        });
      }, 1500);
    }
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, []);

  // Center calculation
  const centerLat = (originPos[0] + destPos[0]) / 2;
  const centerLon = (originPos[1] + destPos[1]) / 2;

  // Polyline path: origin -> current vehicle -> destination
  const polylineCoords: [number, number][] = [originPos, currentPos, destPos];

  return (
    <div className="flex flex-col gap-3">
      {/* Telemetry Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/90 border border-slate-800 p-3 rounded-xl text-xs">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-cyan-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Mode</span>
            <span className="font-semibold text-white">{transport.transport_mode}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">ETA Window</span>
            <span className="font-semibold text-white font-mono">
              {new Date(transport.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Delay</span>
            <span className="font-semibold text-amber-300 font-mono">
              {currentDelay > 0 ? `+${currentDelay} min` : 'Nominal (0m)'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Route Risk</span>
            <StatusBadge type="risk" value={transport.route_risk} />
          </div>
        </div>
      </div>

      {/* Map Canvas Container */}
      <div className={`relative w-full ${heightClass} rounded-xl overflow-hidden border border-slate-800 shadow-xl`}>
        <MapContainer
          center={[centerLat, centerLon]}
          zoom={8}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <ChangeView center={[centerLat, centerLon]} zoom={8} />

          {/* CartoDB Dark Matter tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Route Polyline */}
          <Polyline
            positions={polylineCoords}
            pathOptions={{
              color: transport.route_risk === 'CRITICAL' ? '#f43f5e' : '#06b6d4',
              weight: 4,
              dashArray: '8, 8',
              opacity: 0.85,
            }}
          />

          {/* Origin Hospital Marker */}
          <Marker
            position={originPos}
            icon={createHospitalIcon(originHospital?.name || 'Origin Hospital', true)}
          >
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-bold text-cyan-400">{originHospital?.name || 'Donor Hospital'}</p>
                <p className="text-slate-300">Retrieval & Dispatch Location</p>
                <p className="text-slate-400">{originHospital?.city}, {originHospital?.state}</p>
              </div>
            </Popup>
          </Marker>

          {/* Destination Hospital Marker */}
          <Marker
            position={destPos}
            icon={createHospitalIcon(destinationHospital?.name || 'Recipient Hospital', false)}
          >
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-bold text-emerald-400">{destinationHospital?.name || 'Transplant Center'}</p>
                <p className="text-slate-300">Target Surgical Facility</p>
                <p className="text-slate-400">Readiness: {destinationHospital?.readiness_score ?? 80}%</p>
              </div>
            </Popup>
          </Marker>

          {/* Moving Vehicle Telemetry Marker */}
          <Marker
            position={currentPos}
            icon={createVehicleIcon(transport.transport_mode)}
          >
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-bold text-white">{transport.transport_mode} Telemetry</p>
                <p className="text-slate-300">Status: {transport.status}</p>
                <p className="text-slate-400">Lat: {currentPos[0].toFixed(4)}, Lon: {currentPos[1].toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Floating Controls Overlay */}
        {allowSimulatedMovement && (
          <div className="absolute bottom-4 right-4 z-[500] flex items-center gap-2 bg-slate-950/80 backdrop-blur-md p-2 rounded-xl border border-slate-800 shadow-xl">
            <button
              onClick={toggleMovement}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                isMoving
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-950'
              }`}
            >
              {isMoving ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pause Transit
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Start Simulation
                </>
              )}
            </button>
            <span className="text-[10px] font-mono text-slate-400 px-1">
              {Math.round(progressRatio * 100)}% route complete
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
