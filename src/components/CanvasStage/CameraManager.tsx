import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

interface CameraManagerProps {
  isZoomEnabled: boolean;
  isMobile: boolean;
}

export const CameraManager = ({ isZoomEnabled, isMobile }: CameraManagerProps) => {
  const { camera } = useThree();
  
  useEffect(() => {
    (window as any).__threeCamera = camera;
  }, [camera]);
  
  return null;
};
