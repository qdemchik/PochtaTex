import { useRef, useEffect } from 'react';
import { useAppState } from '../store';
import * as THREE from 'three';


export default function View3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const { state } = useAppState();
  const { currentPlan } = state;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(12, 14, 18);
    camera.lookAt(8, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    const room = currentPlan.room;

    // Floor
    const floorGeom = new THREE.PlaneGeometry(room.width, room.height);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.8 });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(room.width / 2, 0, room.height / 2);
    floor.receiveShadow = true;
    scene.add(floor);

    // Walls
    const wallHeight = 3;
    const wallThickness = 0.15;
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.5 });

    // Front wall
    const frontWall = new THREE.Mesh(
      new THREE.BoxGeometry(room.width, wallHeight, wallThickness),
      wallMat
    );
    frontWall.position.set(room.width / 2, wallHeight / 2, 0);
    frontWall.castShadow = true;
    scene.add(frontWall);

    // Back wall
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(room.width, wallHeight, wallThickness),
      wallMat
    );
    backWall.position.set(room.width / 2, wallHeight / 2, room.height);
    backWall.castShadow = true;
    scene.add(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, room.height),
      wallMat
    );
    leftWall.position.set(0, wallHeight / 2, room.height / 2);
    leftWall.castShadow = true;
    scene.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallThickness, wallHeight, room.height),
      wallMat
    );
    rightWall.position.set(room.width, wallHeight / 2, room.height / 2);
    rightWall.castShadow = true;
    scene.add(rightWall);

    // Zones as colored floor areas
    currentPlan.zones.forEach((zone) => {
      const shape = new THREE.Shape();
      zone.points.forEach((p, i) => {
        if (i === 0) shape.moveTo(p.x, p.y);
        else shape.lineTo(p.x, p.y);
      });
      shape.closePath();

      const geom = new THREE.ShapeGeometry(shape);
      const color = new THREE.Color(zone.color);
      const mat = new THREE.MeshStandardMaterial({
        color,
        transparent: true,
        opacity: 0.2,
        roughness: 0.9,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = 0.01;
      scene.add(mesh);

      // Zone border
      const edges = new THREE.EdgesGeometry(geom);
      const lineMat = new THREE.LineBasicMaterial({ color, opacity: 0.6, transparent: true });
      const line = new THREE.LineSegments(edges, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.y = 0.02;
      scene.add(line);
    });

    // Objects as 3D boxes
    currentPlan.objects.forEach((obj) => {
      const objHeight = obj.type === 'shelf' ? 1.8 : obj.type === 'camera' ? 0.15 : 0.9;
      const geom = new THREE.BoxGeometry(obj.width, objHeight, obj.height);
      const color = new THREE.Color(obj.color);
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.4,
        metalness: 0.1,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(
        obj.x + obj.width / 2,
        objHeight / 2,
        obj.y + obj.height / 2
      );
      mesh.rotation.y = (obj.rotation * Math.PI) / 180;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);

      // Object edges
      const edges = new THREE.EdgesGeometry(geom);
      const edgeMat = new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.2, transparent: true });
      const edgeLine = new THREE.LineSegments(edges, edgeMat);
      edgeLine.position.copy(mesh.position);
      edgeLine.rotation.copy(mesh.rotation);
      scene.add(edgeLine);
    });

    // Grid helper
    const gridHelper = new THREE.GridHelper(Math.max(room.width, room.height) + 4, 20, 0x444444, 0x333333);
    gridHelper.position.set(room.width / 2, -0.01, room.height / 2);
    scene.add(gridHelper);

    // Simple rotation animation
    let animFrame: number;
    let angle = 0;
    const animate = () => {
      angle += 0.002;
      const radius = 20;
      camera.position.x = room.width / 2 + Math.cos(angle) * radius;
      camera.position.z = room.height / 2 + Math.sin(angle) * radius;
      camera.position.y = 12;
      camera.lookAt(room.width / 2, 0, room.height / 2);
      renderer.render(scene, camera);
      animFrame = requestAnimationFrame(animate);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [currentPlan]);

  return (
    <div className="flex-1 flex flex-col bg-[#141414]">
      <div className="px-6 py-3 border-b border-slate-800 bg-[#1e1e1e] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">3D-представление</h2>
          <p className="text-xs text-slate-400">Упрощённая визуализация плана в перспективе</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" /> Рабочие места
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" /> Кассовые окна
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Стеллажи
          </span>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 relative" />
    </div>
  );
}
