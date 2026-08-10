import { useEffect } from 'react';
import { useDriverContext } from '../../context/DriverContext';

const DriverAutoOnline = () => {
  const context = useDriverContext();
  const isOnline = context?.isOnline;
  const setOnline = context?.setOnline;

  useEffect(() => {
    if (setOnline && !isOnline) {
      console.log("♻️ [ChauffeurApp] Passage en ligne automatique");
      setOnline(true);
    }
  }, [isOnline, setOnline]);

  return null;
};

export default DriverAutoOnline;
