import React, { useState, useEffect, useMemo, useRef } from "react";
import { StyleSheet, View, Text } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { useExtractorContext } from "@/context/ExtractorContext";
import { AppIcon } from "./app-icon";

interface Point {
  x: number;
  y: number;
  z: number;
  r: number;
  g: number;
  b: number;
}

export function PointCloudCanvas({ height = 280 }: { height?: number }) {
  const theme = useTheme();
  const { apiPointCloud } = useExtractorContext();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Only load real 3D points from backend point cloud artifact
  const points: Point[] = useMemo(() => {
    const apiPoints = apiPointCloud?.points;
    if (!apiPoints || apiPoints.length === 0) {
      return [];
    }
    return apiPoints.map((p) => ({
      x: p.x,
      y: p.y,
      z: p.z,
      r: p.r,
      g: p.g,
      b: p.b,
    }));
  }, [apiPointCloud]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle High DPI Displays
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const heightLimit = rect.height;

    let angleY = 0;
    let requestId: number;

    const render = () => {
      ctx.fillStyle = "#060b14";
      ctx.fillRect(0, 0, width, heightLimit);

      angleY += 0.003;
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      const angleX = Math.sin(angleY * 0.5) * 0.1;
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      for (let i = 0; i < points.length; i++) {
        const pt = points[i];

        // 1. Rotate Y-axis
        let rx = pt.x * cosY - pt.z * sinY;
        let rz = pt.x * sinY + pt.z * cosY;
        let ry = pt.y;

        // 2. Rotate X-axis (tilting effect)
        const originalRy = ry;
        ry = originalRy * cosX - rz * sinX;
        rz = originalRy * sinX + rz * cosX;

        // 3. Perspective Projection Calculation
        const fov = 350;
        const cameraDistance = 12;
        const scale = fov / (cameraDistance + rz);

        const px = rx * scale + width / 2;
        const py = -ry * scale + heightLimit / 2;

        // Render point within boundary bounds
        if (px >= 0 && px <= width && py >= 0 && py <= heightLimit) {
          const r = Math.round(pt.r * 255);
          const g = Math.round(pt.g * 255);
          const b = Math.round(pt.b * 255);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.85)`;
          ctx.fillRect(px, py, 2.2, 2.2);
        }
      }

      requestId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(requestId);
    };
  }, [points]);

  return (
    <View
      style={[
        styles.canvas,
        {
          height,
          backgroundColor: "#060b14",
          borderColor: theme.borderHighlight,
        },
      ]}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: height - 2,
          backgroundColor: "#060b14",
        }}
      />

      <View style={styles.hudOverlay} pointerEvents="none">
        <View style={styles.centerBadge}>
          <AppIcon name="box" size={24} color={theme.accent} />
          <Text style={[styles.titleText, { color: theme.text }]}>
            3D Point Cloud (2D Perspective Projection)
          </Text>
          <Text style={[styles.subText, { color: theme.textMuted }]}>
            HTML5 Software Rendered · 3K LiDAR Points
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
    marginBottom: 12,
  },
  hudOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 16,
  },
  centerBadge: {
    backgroundColor: "rgba(10, 15, 29, 0.85)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  titleText: { fontSize: 12, fontWeight: "800" },
  subText: { fontSize: 10, fontWeight: "600" },
});
