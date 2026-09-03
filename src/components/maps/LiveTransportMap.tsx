import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import { Clock, Gauge, Navigation, Pause, Play, ShieldAlert } from 'lucide-react';
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white border border-slate-200/90 p-4 rounded-xl shadow-sm text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <Navigation className="w-4 h-4 shrink-0" />
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Transport Mode</span>
            <span className="font-bold text-slate-900">{transport.transport_mode}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <Clock className="w-4 h-4 shrink-0" />
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Estimated Arrival</span>
            <span className="font-bold text-slate-900 font-mono">
              {new Date(transport.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
            <Gauge className="w-4 h-4 shrink-0" />
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Active Delay</span>
            <span className="font-bold text-amber-700 font-mono">
              {currentDelay > 0 ? `+${currentDelay} min` : 'Nominal (0m)'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-red-50 text-red-600">
            <ShieldAlert className="w-4 h-4 shrink-0" />
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Route Condition</span>
            <StatusBadge type="risk" value={transport.route_risk} />
          </div>
        </div>
      </div>

      {/* Map Canvas Container */}
      <div className={`relative w-full ${heightClass} rounded-xl overflow-hidden border border-slate-200/90 shadow-sm`}>
        <MapContainer
          center={[centerLat, centerLon]}
          zoom={8}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <ChangeView center={[centerLat, centerLon]} zoom={8} />

          {/* CartoDB Positron light tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png"
          />

          {/* Route Polyline */}
          <Polyline
            positions={polylineCoords}
            pathOptions={{
              color: transport.route_risk === 'CRITICAL' ? '#ef4444' : '#2563eb',
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
              <div className="text-xs space-y-1 p-1">
                <p className="font-bold text-blue-700">{originHospital?.name || 'Donor Hospital'}</p>
                <p className="text-slate-600">Retrieval & Dispatch Location</p>
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
              <div className="text-xs space-y-1 p-1">
                <p className="font-bold text-emerald-700">{destinationHospital?.name || 'Transplant Center'}</p>
                <p className="text-slate-600">Target Surgical Facility</p>
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
              <div className="text-xs space-y-1 p-1">
                <p className="font-bold text-slate-900">{transport.transport_mode} Telemetry</p>
                <p className="text-slate-600">Status: {transport.status}</p>
                <p className="text-slate-400">Lat: {currentPos[0].toFixed(4)}, Lon: {currentPos[1].toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Floating Controls Overlay */}
        {allowSimulatedMovement && (
          <div className="absolute bottom-4 right-4 z-[500] flex items-center gap-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200/90 shadow-md">
            <button
              onClick={toggleMovement}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
                isMoving
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isMoving ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" /> Pause Transit
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" /> Start Simulation
                </>
              )}
            </button>
            <span className="text-[11px] font-mono text-slate-600 font-semibold px-1">
              {Math.round(progressRatio * 100)}% route complete
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
