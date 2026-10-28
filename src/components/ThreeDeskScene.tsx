import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { DeskStyle, Folder } from '../types';
import { createDeskTexture, createFolderLabelTexture } from '../utils/proceduralTextures';

interface ThreeDeskSceneProps {
  deskStyle: DeskStyle;
  brightness: number;
  enableParallax: boolean;
  folders: Folder[];
  folderCounts: Record<string, number>;
  hoveredFolderId?: string | null;
  onFolderClick: (folderId: string) => void;
}

export const ThreeDeskScene: React.FC<ThreeDeskSceneProps> = ({
  deskStyle,
  brightness,
  enableParallax,
  folders,
  folderCounts,
  hoveredFolderId,
  onFolderClick,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const onFolderClickRef = useRef(onFolderClick);
  onFolderClickRef.current = onFolderClick;

  const hoveredFolderIdRef = useRef(hoveredFolderId);
  hoveredFolderIdRef.current = hoveredFolderId;

  // Scene object references to update smoothly on prop changes
  const deskMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const folderMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const mouseTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseNormRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update desk texture when deskStyle changes
  useEffect(() => {
    if (!deskMaterialRef.current || !rendererRef.current) return;
    const maxAniso = rendererRef.current.capabilities.getMaxAnisotropy();
    const { map, roughnessMap } = createDeskTexture(deskStyle, maxAniso);

    const oldMap = deskMaterialRef.current.map;
    const oldRough = deskMaterialRef.current.roughnessMap;

    deskMaterialRef.current.map = map;
    deskMaterialRef.current.roughnessMap = roughnessMap;
    deskMaterialRef.current.needsUpdate = true;

    if (oldMap) oldMap.dispose();
    if (oldRough) oldRough.dispose();
  }, [deskStyle]);

  // Update lighting brightness
  useEffect(() => {
    const factor = brightness / 100;
    if (keyLightRef.current) keyLightRef.current.intensity = 2.4 * factor;
    if (hemiLightRef.current) hemiLightRef.current.intensity = 0.9 * factor;
  }, [brightness]);

  // Main Three.js Initialization
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Detect software WebGL as per directives
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 2. Renderer & Studio Pipeline
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color('#1c130d');
    scene.fog = new THREE.FogExp2('#1c130d', 0.025);

    // Camera placed slightly elevated looking down at desk
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 14, 18);
    camera.lookAt(0, 0, 1.5);
    cameraRef.current = camera;

    // Mandatory RoomEnvironment reflection
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 4. Lighting Rig
    const hemiLight = new THREE.HemisphereLight('#f5e6d3', '#3d2b1f', 0.9 * (brightness / 100));
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    // Warm Key Light (mimics a warm desk lamp at upper left)
    const keyLight = new THREE.DirectionalLight('#fff1db', 2.4 * (brightness / 100));
    keyLight.position.set(-8, 16, 6);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 40;
      keyLight.shadow.camera.left = -16;
      keyLight.shadow.camera.right = 16;
      keyLight.shadow.camera.top = 16;
      keyLight.shadow.camera.bottom = -16;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    // Warm soft fill lamp
    const fillLight = new THREE.PointLight('#ffb070', 1.2, 20);
    fillLight.position.set(-7, 8, 4);
    scene.add(fillLight);

    // 5. Desk Plane Surface
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const { map, roughnessMap } = createDeskTexture(deskStyle, maxAniso);

    const deskGeo = new THREE.PlaneGeometry(36, 24);
    const deskMat = new THREE.MeshStandardMaterial({
      map,
      roughnessMap,
      roughness: 0.65,
      metalness: 0.08,
    });
    deskMaterialRef.current = deskMat;

    const deskMesh = new THREE.Mesh(deskGeo, deskMat);
    deskMesh.rotation.x = -Math.PI / 2;
    deskMesh.receiveShadow = !isSoftwareGl;
    scene.add(deskMesh);

    // Desk Wood Trim Bevel (Front Edge)
    const edgeGeo = new THREE.BoxGeometry(36, 0.5, 0.4);
    const edgeMat = new THREE.MeshStandardMaterial({
      color: '#533118',
      roughness: 0.5,
      metalness: 0.1,
    });
    const edgeMesh = new THREE.Mesh(edgeGeo, edgeMat);
    edgeMesh.position.set(0, -0.25, 12);
    edgeMesh.receiveShadow = !isSoftwareGl;
    scene.add(edgeMesh);

    // 6. Composite Skeuomorphic Props (Pen holder, Mug, Clips)

    // A. Ceramic Coffee Mug
    const mugGroup = new THREE.Group();
    mugGroup.position.set(10.5, 0, -4.5);

    // Mug body
    const mugBodyGeo = new THREE.CylinderGeometry(0.85, 0.78, 1.8, 32);
    const mugMat = new THREE.MeshPhysicalMaterial({
      color: '#fdfbf7',
      roughness: 0.25,
      metalness: 0.05,
      clearcoat: 0.8,
    });
    const mugBody = new THREE.Mesh(mugBodyGeo, mugMat);
    mugBody.position.y = 0.9;
    mugBody.castShadow = !isSoftwareGl;
    mugBody.receiveShadow = !isSoftwareGl;
    mugGroup.add(mugBody);

    // Mug Handle
    const handleGeo = new THREE.TorusGeometry(0.55, 0.12, 16, 24, Math.PI * 1.1);
    const handle = new THREE.Mesh(handleGeo, mugMat);
    handle.position.set(0.85, 0.9, 0);
    handle.rotation.z = -Math.PI / 2;
    handle.castShadow = !isSoftwareGl;
    mugGroup.add(handle);

    // Coffee Liquid
    const coffeeGeo = new THREE.CylinderGeometry(0.78, 0.78, 0.05, 32);
    const coffeeMat = new THREE.MeshStandardMaterial({
      color: '#261409',
      roughness: 0.1,
      metalness: 0.1,
    });
    const coffee = new THREE.Mesh(coffeeGeo, coffeeMat);
    coffee.position.y = 1.62;
    mugGroup.add(coffee);

    // Mug contact shadow
    const mugShadowGeo = new THREE.CircleGeometry(1.2, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: '#000000',
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    const mugShadow = new THREE.Mesh(mugShadowGeo, shadowMat);
    mugShadow.rotation.x = -Math.PI / 2;
    mugShadow.position.y = 0.01;
    mugGroup.add(mugShadow);
    scene.add(mugGroup);

    // B. Wooden Desk Pen Stand & Brass Pen
    const penStandGroup = new THREE.Group();
    penStandGroup.position.set(-11, 0, -5);

    const standBodyGeo = new THREE.CylinderGeometry(1.0, 1.15, 2.2, 32);
    const standMat = new THREE.MeshStandardMaterial({
      color: '#3a2312',
      roughness: 0.45,
      metalness: 0.15,
    });
    const standBody = new THREE.Mesh(standBodyGeo, standMat);
    standBody.position.y = 1.1;
    standBody.castShadow = !isSoftwareGl;
    standBody.receiveShadow = !isSoftwareGl;
    penStandGroup.add(standBody);

    // Pens inside stand
    const penMat = new THREE.MeshStandardMaterial({ color: '#1a1a24', metalness: 0.8, roughness: 0.2 });
    const brassMat = new THREE.MeshStandardMaterial({ color: '#d4af37', metalness: 0.9, roughness: 0.25 });
    const woodPencilMat = new THREE.MeshStandardMaterial({ color: '#ffb300', roughness: 0.7 });

    // Pen 1 (Brass fountain pen)
    const pen1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.8, 16), penMat);
    pen1.position.set(0.3, 1.9, 0.2);
    pen1.rotation.z = 0.18;
    pen1.rotation.x = -0.15;
    pen1.castShadow = !isSoftwareGl;
    penStandGroup.add(pen1);

    const pen1Cap = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.7, 16), brassMat);
    pen1Cap.position.set(0.3, 2.7, 0.2);
    pen1Cap.rotation.z = 0.18;
    pen1Cap.rotation.x = -0.15;
    penStandGroup.add(pen1Cap);

    // Pencil 2 (Yellow HB pencil)
    const pencil2 = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.0, 6), woodPencilMat);
    pencil2.position.set(-0.35, 2.0, -0.2);
    pencil2.rotation.z = -0.22;
    pencil2.rotation.x = 0.2;
    pencil2.castShadow = !isSoftwareGl;
    penStandGroup.add(pencil2);

    // Pen stand contact shadow
    const standShadow = new THREE.Mesh(new THREE.CircleGeometry(1.4, 32), shadowMat);
    standShadow.rotation.x = -Math.PI / 2;
    standShadow.position.y = 0.01;
    penStandGroup.add(standShadow);

    scene.add(penStandGroup);

    // C. Brass Desk Lamp Base & Gooseneck (Atmospheric skeuomorphism)
    const lampGroup = new THREE.Group();
    lampGroup.position.set(-13, 0, 4);

    const lampBaseGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.35, 32);
    const lampBase = new THREE.Mesh(lampBaseGeo, brassMat);
    lampBase.position.y = 0.175;
    lampBase.castShadow = !isSoftwareGl;
    lampGroup.add(lampBase);

    const lampArmGeo = new THREE.CylinderGeometry(0.12, 0.12, 5.0, 16);
    const lampArm = new THREE.Mesh(lampArmGeo, brassMat);
    lampArm.position.set(0.2, 2.5, 0);
    lampArm.rotation.z = -0.25;
    lampArm.castShadow = !isSoftwareGl;
    lampGroup.add(lampArm);

    // Lamp shade hood
    const lampShadeGeo = new THREE.ConeGeometry(1.3, 1.4, 32, 1, true);
    const lampShadeMat = new THREE.MeshStandardMaterial({
      color: '#1b4d3e', // Classic banker's emerald green / brass
      metalness: 0.3,
      roughness: 0.3,
    });
    const lampShade = new THREE.Mesh(lampShadeGeo, lampShadeMat);
    lampShade.position.set(1.4, 4.6, 0.2);
    lampShade.rotation.z = Math.PI - 0.45;
    lampShade.castShadow = !isSoftwareGl;
    lampGroup.add(lampShade);

    // Lamp warm bulb glow sphere
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 16, 16),
      new THREE.MeshBasicMaterial({ color: '#fff5cc' })
    );
    bulb.position.set(1.4, 4.4, 0.2);
    lampGroup.add(bulb);

    const lampShadow = new THREE.Mesh(new THREE.CircleGeometry(2.0, 32), shadowMat);
    lampShadow.rotation.x = -Math.PI / 2;
    lampShadow.position.y = 0.01;
    lampGroup.add(lampShadow);

    scene.add(lampGroup);

    // 7. Raycasting for Interactive 3D Folders
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      pointer.x = (clientX / rect.width) * 2 - 1;
      pointer.y = -(clientY / rect.height) * 2 + 1;

      // Parallax target (-1 to 1)
      mouseTargetRef.current = {
        x: pointer.x * 1.8,
        y: pointer.y * 1.2,
      };
      mouseNormRef.current = { x: pointer.x, y: pointer.y };

      // Raycast against folders
      raycaster.setFromCamera(pointer, camera);
      const interactiveObjects: THREE.Object3D[] = [];
      folderMeshesRef.current.forEach((group) => {
        interactiveObjects.push(group);
      });

      const intersects = raycaster.intersectObjects(interactiveObjects, true);
      let foundFolder = false;
      if (intersects.length > 0) {
        let current: THREE.Object3D | null = intersects[0].object;
        while (current && current.parent && current.parent !== scene) {
          if (current.userData && current.userData.folderId) {
            foundFolder = true;
            container.style.cursor = 'pointer';
            break;
          }
          current = current.parent;
        }
      }
      if (!foundFolder) {
        container.style.cursor = 'default';
      }
    };

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      pointer.x = (clientX / rect.width) * 2 - 1;
      pointer.y = -(clientY / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const interactiveObjects: THREE.Object3D[] = [];
      folderMeshesRef.current.forEach((group) => {
        interactiveObjects.push(group);
      });

      const intersects = raycaster.intersectObjects(interactiveObjects, true);
      if (intersects.length > 0) {
        let current: THREE.Object3D | null = intersects[0].object;
        while (current && current.parent && current.parent !== scene) {
          if (current.userData && current.userData.folderId) {
            onFolderClickRef.current(current.userData.folderId);
            break;
          }
          current = current.parent;
        }
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    container.addEventListener('click', onClick);

    // 8. Resize Handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // 9. Render Loop with afterDraw software fallback as per directives
    let frameId = 0;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      const delta = clock.getDelta();

      // Smooth camera parallax damping
      if (enableParallax) {
        const targetCamX = mouseTargetRef.current.x * 1.5;
        const targetCamY = 14 + mouseTargetRef.current.y * 1.0;
        camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 3.5, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 3.5, delta);
        camera.lookAt(targetCamX * 0.2, 0, 1.5);
      } else {
        camera.position.x = THREE.MathUtils.damp(camera.position.x, 0, 4.0, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, 14, 4.0, delta);
        camera.lookAt(0, 0, 1.5);
      }

      // Smooth hover/open animations on 3D Folders
      folderMeshesRef.current.forEach((group, folderId) => {
        const isHoveredOrTarget = hoveredFolderIdRef.current === folderId;
        const targetY = isHoveredOrTarget ? 0.35 : 0;
        const targetRotY = isHoveredOrTarget ? -0.15 : 0;
        const targetScale = isHoveredOrTarget ? 1.05 : 1.0;

        group.position.y = THREE.MathUtils.damp(group.position.y, targetY, 6.0, delta);
        group.rotation.y = THREE.MathUtils.damp(group.rotation.y, (group.userData.baseRotY || 0) + targetRotY, 6.0, delta);
        group.scale.setScalar(THREE.MathUtils.damp(group.scale.x, targetScale, 6.0, delta));
      });

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);

      // Dispose Three.js resources
      renderer.dispose();
      deskGeo.dispose();
      deskMat.dispose();
      if (deskMat.map) deskMat.map.dispose();
      if (deskMat.roughnessMap) deskMat.roughnessMap.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [enableParallax]); // eslint-disable-line react-hooks/exhaustive-deps

  // Synchronize 3D Folder meshes on the desk when folders update
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove obsolete folder groups
    const currentFolderIds = new Set(folders.map((f) => f.id));
    folderMeshesRef.current.forEach((group, id) => {
      if (!currentFolderIds.has(id)) {
        scene.remove(group);
        folderMeshesRef.current.delete(id);
      }
    });

    // Create or update folders on the desk organizer area (right side: x from 4 to 12, z from -6 to -1)
    folders.forEach((folder, index) => {
      const existingGroup = folderMeshesRef.current.get(folder.id);
      const posX = 7.5 + (index % 3) * 2.8;
      const posZ = -6.5 + Math.floor(index / 3) * 3.5;
      const baseRotY = 0.08 - (index % 3) * 0.06;

      if (!existingGroup) {
        const group = new THREE.Group();
        group.userData = { folderId: folder.id, baseRotY };

        // 1. Folder Box Body (Skeuomorphic Folio / File Organizer Box)
        // Dimensions: width 2.4, height 0.6, depth 3.2
        const boxGeo = new THREE.BoxGeometry(2.3, 0.55, 3.1);
        const folderMat = new THREE.MeshStandardMaterial({
          color: folder.color || '#8b5a2b',
          roughness: 0.5,
          metalness: 0.15,
        });
        const boxMesh = new THREE.Mesh(boxGeo, folderMat);
        boxMesh.position.y = 0.28;
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
        group.add(boxMesh);

        // 2. Paper Leaves inside the folder
        const paperGeo = new THREE.BoxGeometry(2.1, 0.45, 2.9);
        const paperMat = new THREE.MeshStandardMaterial({
          color: '#faf8f0',
          roughness: 0.85,
        });
        const paperMesh = new THREE.Mesh(paperGeo, paperMat);
        paperMesh.position.set(0.05, 0.28, 0.05);
        group.add(paperMesh);

        // 3. Tab & Label with folder name
        const labelTexture = createFolderLabelTexture(folder.name, folder.color);
        const tabGeo = new THREE.PlaneGeometry(1.6, 0.4);
        const tabMat = new THREE.MeshBasicMaterial({
          map: labelTexture,
          transparent: false,
        });
        const tabMesh = new THREE.Mesh(tabGeo, tabMat);
        tabMesh.rotation.x = -Math.PI / 2;
        tabMesh.position.set(0, 0.56, 0.2);
        group.add(tabMesh);

        // 4. Brass Corner Protector / Rivet Detail
        const rivetGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.58, 8);
        const brassMat = new THREE.MeshStandardMaterial({ color: '#d4af37', metalness: 0.85, roughness: 0.2 });
        [
          [-1.1, -1.5],
          [1.1, -1.5],
          [-1.1, 1.5],
          [1.1, 1.5],
        ].forEach(([cx, cz]) => {
          const rivet = new THREE.Mesh(rivetGeo, brassMat);
          rivet.position.set(cx, 0.28, cz);
          group.add(rivet);
        });

        // 5. Contact shadow
        const shadowMat = new THREE.MeshBasicMaterial({
          color: '#000000',
          transparent: true,
          opacity: 0.4,
          depthWrite: false,
        });
        const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 3.5), shadowMat);
        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 0.01;
        group.add(shadow);

        group.position.set(posX, 0, posZ);
        group.rotation.y = baseRotY;

        scene.add(group);
        folderMeshesRef.current.set(folder.id, group);
      } else {
        // Update position if count changed
        existingGroup.position.set(posX, 0, posZ);
        existingGroup.userData.baseRotY = baseRotY;
      }
    });
  }, [folders]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-auto overflow-hidden select-none"
      style={{ zIndex: 0 }}
    />
  );
};
