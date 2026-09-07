import { useState, useEffect, useRef } from "react";
import { Platform } from "react-native";
import { Accelerometer, Magnetometer } from "expo-sensors";

export interface PDRState {
  stepsCount: number;
  distanceWalkedMeters: number;
  headingDegrees: number;
  isSensorAvailable: boolean;
  isMoving: boolean;
}

export function usePDRSensors(isActive: boolean = true): PDRState {
  const [stepsCount, setStepsCount] = useState(0);
  const [headingDegrees, setHeadingDegrees] = useState(0);
  const [isSensorAvailable, setIsSensorAvailable] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  // Peak detection state
  const lastMagnitude = useRef(1.0);
  const isPeak = useRef(false);
  const lastStepTime = useRef(0);

  useEffect(() => {
    if (!isActive) return;

    let accelSub: any = null;
    let magSub: any = null;

    async function startSensors() {
      try {
        const accelAvail = await Accelerometer.isAvailableAsync();
        const magAvail = await Magnetometer.isAvailableAsync();

        setIsSensorAvailable(accelAvail || magAvail);

        if (accelAvail) {
          Accelerometer.setUpdateInterval(100);
          accelSub = Accelerometer.addListener(({ x, y, z }) => {
            // Compute acceleration magnitude vector
            const magnitude = Math.sqrt(x * x + y * y + z * z);
            const delta = Math.abs(magnitude - lastMagnitude.current);
            const now = Date.now();

            // Footstep peak threshold (typically 1.2g to 1.6g with minimum 350ms stride interval)
            if (magnitude > 1.25 && delta > 0.3 && now - lastStepTime.current > 350) {
              if (!isPeak.current) {
                isPeak.current = true;
                lastStepTime.current = now;
                setStepsCount((prev) => prev + 1);
                setIsMoving(true);
              }
            } else if (magnitude < 1.05) {
              isPeak.current = false;
            }

            if (now - lastStepTime.current > 2000) {
              setIsMoving(false);
            }

            lastMagnitude.current = magnitude;
          });
        }

        if (magAvail) {
          Magnetometer.setUpdateInterval(150);
          magSub = Magnetometer.addListener(({ x, y }) => {
            // Compute compass heading yaw
            let angle = Math.atan2(y, x) * (180 / Math.PI);
            if (angle < 0) {
              angle = 360 + angle;
            }
            setHeadingDegrees(Math.round(angle));
          });
        }
      } catch (err) {
        console.warn("Sensors initialization warning (running in browser/mock environment):", err);
      }
    }

    startSensors();

    return () => {
      accelSub?.remove();
      magSub?.remove();
    };
  }, [isActive]);

  // Average stride length is ~0.7 meters
  const distanceWalkedMeters = Math.round(stepsCount * 0.7 * 10) / 10;

  return {
    stepsCount,
    distanceWalkedMeters,
    headingDegrees,
    isSensorAvailable,
    isMoving,
  };
}
