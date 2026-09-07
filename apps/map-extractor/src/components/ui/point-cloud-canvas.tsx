import React, { useMemo } from "react";
import { StyleSheet, View, Text } from "react-native";
import { WebView } from "react-native-webview";
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

  const htmlContent = useMemo(() => {
    const rawData = JSON.stringify(points);
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body, html { width: 100%; height: 100%; overflow: hidden; background: #060b14; touch-action: none; }
            canvas { width: 100% !important; height: 100% !important; display: block; }
          </style>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
        </head>
        <body>
          <div id="container" style="width: 100%; height: 100%;"></div>
          <script>
            const container = document.getElementById('container');
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x060b14);

            const width = window.innerWidth;
            const height = window.innerHeight;
            const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
            camera.position.set(0, 1.2, 5.5);
            camera.lookAt(0, 0, 0);

            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
            renderer.setSize(width, height);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            container.appendChild(renderer.domElement);

            const controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.autoRotate = true;
            controls.autoRotateSpeed = 1.0;
            controls.enableZoom = true;
            controls.maxDistance = 20;
            controls.minDistance = 1.5;

            const gridHelper = new THREE.GridHelper(10, 10, 0x00f5a0, 0x1c2b42);
            gridHelper.position.y = -2.0;
            scene.add(gridHelper);

            const pts = ${rawData};
            const count = pts.length;
            const positions = new Float32Array(count * 3);
            const colors = new Float32Array(count * 3);

            for (let i = 0; i < count; i++) {
              positions[i * 3] = pts[i].x;
              positions[i * 3 + 1] = pts[i].y;
              positions[i * 3 + 2] = pts[i].z;
              colors[i * 3] = pts[i].r;
              colors[i * 3 + 1] = pts[i].g;
              colors[i * 3 + 2] = pts[i].b;
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const material = new THREE.PointsMaterial({
              size: 0.08,
              vertexColors: true,
              transparent: true,
              opacity: 0.9
            });

            const pointsMesh = new THREE.Points(geometry, material);
            scene.add(pointsMesh);

            const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
            scene.add(ambientLight);

            window.addEventListener('resize', () => {
              const w = window.innerWidth;
              const h = window.innerHeight;
              camera.aspect = w / h;
              camera.updateProjectionMatrix();
              renderer.setSize(w, h);
            });

            function animate() {
              requestAnimationFrame(animate);
              controls.update();
              renderer.render(scene, camera);
            }
            animate();
          </script>
        </body>
      </html>
    `;
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
      <WebView
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        style={styles.webView}
        containerStyle={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        androidHardwareAccelerationDisabled={false}
      />

      <View style={styles.hudOverlay} pointerEvents="none">
        <View style={styles.centerBadge}>
          <AppIcon name="box" size={24} color={theme.accent} />
          <Text style={[styles.titleText, { color: theme.text }]}>
            Interactive 3D Point Cloud (LiDAR)
          </Text>
          <Text style={[styles.subText, { color: theme.textMuted }]}>
            Hardware Accelerated 60 FPS · {points.length} Points · Swipe to Orbit
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
  webView: {
    flex: 1,
    backgroundColor: "#060b14",
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
