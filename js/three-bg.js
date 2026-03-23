// /* ═══════════════════════════════════════
//    three-bg.js  — optimised build
//    Key fixes vs original:
//    · Pixel ratio capped at 1 (was 2) — cuts GPU fill rate in half on retina
//    · antialias off on full-screen canvas — huge GPU saving
//    · Nodes reduced 90 → 40
//    · ALL geometry in ONE BufferGeometry — zero per-frame allocations
//    · Edge positions written into a pre-allocated Float32Array each frame
//    · Distance check uses squared distance (no sqrt)
//    · Frame-skip: edges rebuilt every 3rd frame only
//    · Pauses when tab is hidden
// ═══════════════════════════════════════ */

// // (function initThree() {
// //   const canvas = document.getElementById('threecv');
// //   if (!canvas || typeof THREE === 'undefined') return;

// (function initThree() {
//   if (window.innerWidth < 768) return;
//   const canvas = document.getElementById('threecv');
//   if (!canvas || typeof THREE === 'undefined') return;
  
//   /* ── Renderer — antialias OFF, pixel ratio capped at 1 ── */
//   const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
//   renderer.setPixelRatio(1);                          // was Math.min(devicePixelRatio, 2)
//   renderer.setSize(window.innerWidth, window.innerHeight);
//   renderer.setClearColor(0x000000, 0);

//   const scene  = new THREE.Scene();
//   const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
//   camera.position.z = 28;

//   /* ── Nodes — reduced to 40, single shared geometry ── */
//   const NODE_COUNT = 40;                              // was 90
//   const positions  = [];
//   const velocities = [];

//   const nodePositions = new Float32Array(NODE_COUNT * 3);
//   const nodeGeo  = new THREE.BufferGeometry();
//   nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));

//   const nodeMat = new THREE.PointsMaterial({
//     color: 0x00f5d4,
//     size: 0.18,
//     transparent: true,
//     opacity: 0.6,
//     sizeAttenuation: true,
//   });
//   const pointCloud = new THREE.Points(nodeGeo, nodeMat);
//   scene.add(pointCloud);

//   for (let i = 0; i < NODE_COUNT; i++) {
//     positions.push(
//       (Math.random() - 0.5) * 50,
//       (Math.random() - 0.5) * 35,
//       (Math.random() - 0.5) * 20
//     );
//     velocities.push(
//       (Math.random() - 0.5) * 0.025,
//       (Math.random() - 0.5) * 0.025,
//       (Math.random() - 0.5) * 0.01
//     );
//   }

//   /* Expose for theme toggle */
//   window._threeNodes = { material: nodeMat };
//   window._threeEdges = [];

//   /* ── Edges — single LineSegments with pre-allocated buffer ── */
//   const MAX_EDGES     = 120;
//   const edgePositions = new Float32Array(MAX_EDGES * 6); // 2 points × 3 coords per edge
//   const edgeGeo       = new THREE.BufferGeometry();
//   const edgeAttr      = new THREE.BufferAttribute(edgePositions, 3);
//   edgeAttr.setUsage(THREE.DynamicDrawUsage);
//   edgeGeo.setAttribute('position', edgeAttr);

//   const edgeMat = new THREE.LineBasicMaterial({
//     color: 0x00f5d4, transparent: true, opacity: 0.07,
//   });
//   const lineSegs = new THREE.LineSegments(edgeGeo, edgeMat);
//   scene.add(lineSegs);

//   const MAX_DIST_SQ = 12 * 12;                       // squared — avoids sqrt every frame

//   /* ── Mouse influence (throttled) ── */
//   let mx2 = 0, my2 = 0;
//   document.addEventListener('mousemove', e => {
//     mx2 = (e.clientX / window.innerWidth  - 0.5) * 2;
//     my2 = -(e.clientY / window.innerHeight - 0.5) * 2;
//   }, { passive: true });

//   /* ── Pause when tab hidden ── */
//   document.addEventListener('visibilitychange', () => {
//     if (document.hidden) renderer.setAnimationLoop(null);
//     else                 renderer.setAnimationLoop(animate);
//   });

//   /* ── Theme colour update ── */
//   window._threeNodes = { material: nodeMat };
//   // Override updateThreeColors to work with new single-material approach
//   window._updateThreeColor = function(isLight) {
//     const col = isLight ? 0x1a8a70 : 0x00f5d4;
//     nodeMat.color.setHex(col);
//     edgeMat.color.setHex(col);
//   };

//   /* ── Animation loop ── */
//   let frame = 0;

//   function animate() {
//     frame++;

//     /* Move nodes */
//     for (let i = 0; i < NODE_COUNT; i++) {
//       const i3 = i * 3;
//       positions[i3]     += velocities[i3];
//       positions[i3 + 1] += velocities[i3 + 1];
//       positions[i3 + 2] += velocities[i3 + 2];
//       if (Math.abs(positions[i3])     > 26) velocities[i3]     *= -1;
//       if (Math.abs(positions[i3 + 1]) > 18) velocities[i3 + 1] *= -1;
//       if (Math.abs(positions[i3 + 2]) > 12) velocities[i3 + 2] *= -1;
//       nodePositions[i3]     = positions[i3];
//       nodePositions[i3 + 1] = positions[i3 + 1];
//       nodePositions[i3 + 2] = positions[i3 + 2];
//     }
//     nodeGeo.attributes.position.needsUpdate = true;

//     /* Rebuild edges every 3rd frame only */
//     if (frame % 3 === 0) {
//       let eIdx = 0;
//       outer: for (let i = 0; i < NODE_COUNT; i++) {
//         const i3 = i * 3;
//         for (let j = i + 1; j < NODE_COUNT; j++) {
//           const j3 = j * 3;
//           const dx = positions[i3]     - positions[j3];
//           const dy = positions[i3 + 1] - positions[j3 + 1];
//           const dz = positions[i3 + 2] - positions[j3 + 2];
//           const distSq = dx * dx + dy * dy + dz * dz;
//           if (distSq < MAX_DIST_SQ) {
//             const e6 = eIdx * 6;
//             edgePositions[e6]     = positions[i3];
//             edgePositions[e6 + 1] = positions[i3 + 1];
//             edgePositions[e6 + 2] = positions[i3 + 2];
//             edgePositions[e6 + 3] = positions[j3];
//             edgePositions[e6 + 4] = positions[j3 + 1];
//             edgePositions[e6 + 5] = positions[j3 + 2];
//             eIdx++;
//             if (eIdx >= MAX_EDGES) break outer;
//           }
//         }
//       }
//       edgeGeo.setDrawRange(0, eIdx * 2);
//       edgeAttr.needsUpdate = true;
//     }

//     /* Camera drift */
//     camera.position.x += (mx2 * 0.5 - camera.position.x) * 0.02;
//     camera.position.y += (my2 * 0.3 - camera.position.y) * 0.02;
//     camera.lookAt(scene.position);
//     renderer.render(scene, camera);
//   }
//   renderer.setAnimationLoop(animate);

//   /* ── Resize ── */
//   window.addEventListener('resize', () => {
//     camera.aspect = window.innerWidth / window.innerHeight;
//     camera.updateProjectionMatrix();
//     renderer.setSize(window.innerWidth, window.innerHeight);
//   });
// })();
/* ═══════════════════════════════════════
   three-bg.js  — optimised build
   · Pixel ratio capped at 1
   · antialias off
   · Nodes reduced to 40
   · Single BufferGeometry — zero per-frame allocations
   · Squared distance check — no sqrt
   · Edges rebuilt every 3rd frame only
   · Pauses when tab is hidden
   · Disabled on mobile (< 768px)
═══════════════════════════════════════ */

(function initThree() {
  if (window.innerWidth < 768) return;

  const canvas = document.getElementById('threecv');
  if (!canvas || typeof THREE === 'undefined') return;

  /* ── Renderer ── */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  renderer.setPixelRatio(1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 28;

  /* ── Nodes ── */
  const NODE_COUNT    = 40;
  const positions     = [];
  const velocities    = [];
  const nodePositions = new Float32Array(NODE_COUNT * 3);
  const nodeGeo       = new THREE.BufferGeometry();
  nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));

  const nodeMat = new THREE.PointsMaterial({
    color: 0x00f5d4,
    size: 0.18,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
  });
  scene.add(new THREE.Points(nodeGeo, nodeMat));

  for (let i = 0; i < NODE_COUNT; i++) {
    positions.push(
      (Math.random() - 0.5) * 50,
      (Math.random() - 0.5) * 35,
      (Math.random() - 0.5) * 20
    );
    velocities.push(
      (Math.random() - 0.5) * 0.025,
      (Math.random() - 0.5) * 0.025,
      (Math.random() - 0.5) * 0.01
    );
  }

  /* ── Edges ── */
  const MAX_EDGES     = 120;
  const edgePositions = new Float32Array(MAX_EDGES * 6);
  const edgeGeo       = new THREE.BufferGeometry();
  const edgeAttr      = new THREE.BufferAttribute(edgePositions, 3);
  edgeAttr.setUsage(THREE.DynamicDrawUsage);
  edgeGeo.setAttribute('position', edgeAttr);

  const edgeMat = new THREE.LineBasicMaterial({ color: 0x00f5d4, transparent: true, opacity: 0.07 });
  scene.add(new THREE.LineSegments(edgeGeo, edgeMat));

  const MAX_DIST_SQ = 12 * 12;

  /* ── Theme colour update ── */
  window._updateThreeColor = function(isLight) {
    const col = isLight ? 0x1a8a70 : 0x00f5d4;
    nodeMat.color.setHex(col);
    edgeMat.color.setHex(col);
  };

  /* ── Mouse influence ── */
  let mx2 = 0, my2 = 0;
  document.addEventListener('mousemove', e => {
    mx2 = (e.clientX / window.innerWidth  - 0.5) * 2;
    my2 = -(e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  /* ── Pause when tab hidden ── */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) renderer.setAnimationLoop(null);
    else renderer.setAnimationLoop(animate);
  });

  /* ── Animation loop ── */
  let frame = 0;

  function animate() {
    frame++;

    for (let i = 0; i < NODE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3]     += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];
      if (Math.abs(positions[i3])     > 26) velocities[i3]     *= -1;
      if (Math.abs(positions[i3 + 1]) > 18) velocities[i3 + 1] *= -1;
      if (Math.abs(positions[i3 + 2]) > 12) velocities[i3 + 2] *= -1;
      nodePositions[i3]     = positions[i3];
      nodePositions[i3 + 1] = positions[i3 + 1];
      nodePositions[i3 + 2] = positions[i3 + 2];
    }
    nodeGeo.attributes.position.needsUpdate = true;

    if (frame % 3 === 0) {
      let eIdx = 0;
      outer: for (let i = 0; i < NODE_COUNT; i++) {
        const i3 = i * 3;
        for (let j = i + 1; j < NODE_COUNT; j++) {
          const j3 = j * 3;
          const dx = positions[i3]     - positions[j3];
          const dy = positions[i3 + 1] - positions[j3 + 1];
          const dz = positions[i3 + 2] - positions[j3 + 2];
          if (dx * dx + dy * dy + dz * dz < MAX_DIST_SQ) {
            const e6 = eIdx * 6;
            edgePositions[e6]     = positions[i3];
            edgePositions[e6 + 1] = positions[i3 + 1];
            edgePositions[e6 + 2] = positions[i3 + 2];
            edgePositions[e6 + 3] = positions[j3];
            edgePositions[e6 + 4] = positions[j3 + 1];
            edgePositions[e6 + 5] = positions[j3 + 2];
            eIdx++;
            if (eIdx >= MAX_EDGES) break outer;
          }
        }
      }
      edgeGeo.setDrawRange(0, eIdx * 2);
      edgeAttr.needsUpdate = true;
    }

    camera.position.x += (mx2 * 0.5 - camera.position.x) * 0.02;
    camera.position.y += (my2 * 0.3 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(animate);

  /* ── Resize ── */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();