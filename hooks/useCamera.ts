"use client"
import { useEffect, RefObject, useState } from 'react';

export const useCamera = (videoRef: RefObject<HTMLVideoElement | null>) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        // Try different constraints for better compatibility
        const constraints = {
          video: {
            width: { ideal: 640, max: 1920 },
            height: { ideal: 480, max: 1080 },
            facingMode: 'user',
            frameRate: { ideal: 30, max: 60 }
          },
          audio: false
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.error('Video play error:', e));
          setIsCameraOn(true);
          setCameraError(null);
          console.log('Camera started successfully');
        }
      } catch (error: any) {
        console.error('Error accessing camera:', error);
        setCameraError(error.message);
        setIsCameraOn(false);
        
        // Fallback to a placeholder if camera fails
        if (videoRef.current) {
          videoRef.current.style.backgroundColor = '#333';
          videoRef.current.style.display = 'flex';
          videoRef.current.style.alignItems = 'center';
          videoRef.current.style.justifyContent = 'center';
          videoRef.current.innerHTML = '<div style="color: white; text-align: center;"><p>Camera not available</p><p>Enable camera permissions</p></div>';
        }
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => {
          track.stop();
        });
        setIsCameraOn(false);
        console.log('Camera stopped');
      }
    };
  }, [videoRef]);

  return { cameraError, isCameraOn };
};