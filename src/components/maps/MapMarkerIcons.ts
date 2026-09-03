import L from 'leaflet';

export function createHospitalIcon(name: string, isOrigin: boolean) {
  const color = isOrigin ? '#06b6d4' : '#10b981';
  const label = isOrigin ? 'ORIGIN' : 'DEST';

  return L.divIcon({
    className: 'custom-hospital-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
        <div style="background: #0f172a; border: 2px solid ${color}; color: #fff; padding: 3px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.6); display: flex; align-items: center; gap: 4px;">
          <span style="width: 6px; height: 6px; border-radius: 50%; background: ${color};"></span>
          ${label}: ${name.substring(0, 18)}
        </div>
        <div style="width: 28px; height: 28px; border-radius: 50%; background: ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px ${color}88; margin-top: 2px;">
          <svg style="width: 16px; height: 16px; fill: white;" viewBox="0 0 24 24">
            <path d="M19 14h-3v3a1 1 0 0 1-2 0v-3h-3a1 1 0 0 1 0-2h3V9a1 1 0 0 1 2 0v3h3a1 1 0 0 1 0 2z"/>
          </svg>
        </div>
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid ${color};"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export function createVehicleIcon(mode: string, heading: number = 0) {
  const isHelicopter = mode === 'Helicopter';
  const isAir = mode === 'Air Ambulance' || mode === 'Commercial Air';
  const bg = isHelicopter ? '#f59e0b' : isAir ? '#3b82f6' : '#06b6d4';

  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%);">
        <div style="width: 36px; height: 36px; border-radius: 50%; background: #0b1329; border: 2.5px solid ${bg}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px ${bg}; animation: pulse 2s infinite;">
          <span style="font-size: 18px;">
            ${isHelicopter ? '🚁' : isAir ? '✈️' : '🚑'}
          </span>
        </div>
        <div style="margin-top: 2px; background: rgba(15, 23, 42, 0.9); border: 1px solid ${bg}; color: ${bg}; font-size: 9px; font-weight: 800; padding: 1px 6px; border-radius: 4px; white-space: nowrap;">
          ${mode.toUpperCase()}
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}
