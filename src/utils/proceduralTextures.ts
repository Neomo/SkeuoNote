import * as THREE from 'three';
import { DeskStyle } from '../types';

/**
 * Creates a procedural wood or desk surface texture via HTML5 Canvas.
 * Returns a high-res THREE.CanvasTexture configured with SRGBColorSpace and max anisotropy.
 */
export function createDeskTexture(style: DeskStyle, maxAnisotropy = 4): { map: THREE.CanvasTexture; roughnessMap: THREE.CanvasTexture } {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = 1024;
  roughCanvas.height = 1024;
  const rCtx = roughCanvas.getContext('2d')!;

  if (style === 'warm-oak') {
    // Warm golden oak wood with subtle annual rings and plank seams
    ctx.fillStyle = '#b3824f';
    ctx.fillRect(0, 0, 1024, 1024);

    // Grain lines
    for (let i = 0; i < 400; i++) {
      const y = Math.random() * 1024;
      const alpha = 0.04 + Math.random() * 0.07;
      ctx.fillStyle = Math.random() > 0.5 ? `rgba(90, 50, 20, ${alpha})` : `rgba(220, 180, 120, ${alpha})`;
      ctx.fillRect(0, y, 1024, 1 + Math.random() * 3);
    }

    // Wood pores & fibers
    for (let x = 0; x < 1024; x += 12) {
      const wobble = Math.sin(x * 0.02) * 8;
      ctx.fillStyle = 'rgba(70, 40, 15, 0.03)';
      ctx.fillRect(x + wobble, 0, 4, 1024);
    }

    // Planks bevel shadow lines
    [256, 512, 768].forEach((py) => {
      ctx.fillStyle = 'rgba(40, 20, 5, 0.35)';
      ctx.fillRect(0, py, 1024, 3);
      ctx.fillStyle = 'rgba(255, 240, 200, 0.2)';
      ctx.fillRect(0, py + 3, 1024, 1.5);
    });

    rCtx.fillStyle = '#999999';
    rCtx.fillRect(0, 0, 1024, 1024);
  } else if (style === 'dark-walnut') {
    // Deep rich dark walnut
    ctx.fillStyle = '#2d1b11';
    ctx.fillRect(0, 0, 1024, 1024);

    for (let i = 0; i < 350; i++) {
      const y = Math.random() * 1024;
      const alpha = 0.05 + Math.random() * 0.08;
      ctx.fillStyle = Math.random() > 0.5 ? `rgba(15, 8, 4, ${alpha})` : `rgba(75, 45, 28, ${alpha})`;
      ctx.fillRect(0, y, 1024, 1 + Math.random() * 4);
    }

    [340, 680].forEach((py) => {
      ctx.fillStyle = 'rgba(10, 5, 2, 0.5)';
      ctx.fillRect(0, py, 1024, 3);
      ctx.fillStyle = 'rgba(120, 80, 50, 0.15)';
      ctx.fillRect(0, py + 3, 1024, 1.5);
    });

    rCtx.fillStyle = '#888888';
    rCtx.fillRect(0, 0, 1024, 1024);
  } else if (style === 'cork-board') {
    // Porous warm natural cork
    ctx.fillStyle = '#c79c60';
    ctx.fillRect(0, 0, 1024, 1024);

    for (let i = 0; i < 2500; i++) {
      const px = Math.random() * 1024;
      const py = Math.random() * 1024;
      const r = 1 + Math.random() * 3.5;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(130, 80, 30, 0.18)' : 'rgba(235, 200, 150, 0.16)';
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }

    rCtx.fillStyle = '#cccccc';
    rCtx.fillRect(0, 0, 1024, 1024);
  } else if (style === 'leather-mat') {
    // Executive vintage leather desk mat with edge stitching
    ctx.fillStyle = '#222831';
    ctx.fillRect(0, 0, 1024, 1024);

    // Leather fine grain noise
    for (let i = 0; i < 3000; i++) {
      const px = Math.random() * 1024;
      const py = Math.random() * 1024;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.06)';
      ctx.fillRect(px, py, 2, 2);
    }

    // Gold/cream perimeter stitching
    ctx.strokeStyle = '#c8a876';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(40, 40, 944, 944);

    rCtx.fillStyle = '#777777';
    rCtx.fillRect(0, 0, 1024, 1024);
  } else {
    // Minimal slate stone
    ctx.fillStyle = '#374151';
    ctx.fillRect(0, 0, 1024, 1024);

    for (let i = 0; i < 2000; i++) {
      const px = Math.random() * 1024;
      const py = Math.random() * 1024;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.08)';
      ctx.fillRect(px, py, 1.5, 1.5);
    }

    rCtx.fillStyle = '#aaaaaa';
    rCtx.fillRect(0, 0, 1024, 1024);
  }

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 2);
  map.anisotropy = maxAnisotropy;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(2, 2);
  roughnessMap.anisotropy = maxAnisotropy;

  return { map, roughnessMap };
}

/** Procedural label texture for 3D folder tab */
export function createFolderLabelTexture(title: string, colorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Background folder tab color
  ctx.fillStyle = colorHex;
  ctx.fillRect(0, 0, 512, 128);

  // Metal label frame / white paper insert
  ctx.fillStyle = '#f8f5eb';
  ctx.fillRect(24, 16, 464, 96);

  ctx.strokeStyle = '#c4b59d';
  ctx.lineWidth = 4;
  ctx.strokeRect(24, 16, 464, 96);

  // Text title
  ctx.fillStyle = '#222222';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title.length > 8 ? title.slice(0, 7) + '…' : title, 256, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
