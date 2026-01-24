import GeoPickerTool from './GeoPickerTool';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

interface GeoPickerButtonProps {
  map: any;
}

export default function GeoPickerButton({ map }: GeoPickerButtonProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const cont = document.getElementById('floating-buttons-container');
    setContainer(cont);
  }, []);

  if (!container) return null;

  return createPortal(
    <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center' }}>
      <div style={{ 
        width: '36px', 
        height: '36px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <GeoPickerTool map={map} />
      </div>
      <a href="/admin" className="float-button" title="Админ-панель">
        ⚙️
      </a>
    </div>,
    container
  );
}
