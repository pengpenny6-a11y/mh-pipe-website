/** Real 3D architectural application studies. These are illustrative spaces,
 * not as-built installations or engineering system specifications. */
export function createTechnicalModels(T, k, sceneId) {
  // Architecture is a quiet backdrop to the connected stainless network.
  // These finishes are local to the technical scenes, so domestic interiors
  // retain their own material palette.
  const ivory = new T.MeshStandardMaterial({color: '#eeeae1', roughness: .58});
  const limestone = new T.MeshStandardMaterial({color: '#d5d0c5', roughness: .64});
  const floorFinish = new T.MeshStandardMaterial({color: '#d9d5cb', roughness: .33, metalness: .03});
  const graphite = new T.MeshStandardMaterial({color: '#293640', roughness: .34, metalness: .24});
  const satin = new T.MeshStandardMaterial({color: '#e4e5e0', roughness: .28, metalness: .16});
  const seam = new T.MeshStandardMaterial({color: '#b5b4ac', roughness: .7});
  const warmLight = new T.MeshStandardMaterial({color: '#fff4df', emissive: '#ffe2b0', emissiveIntensity: .72, roughness: .35});
  const teeCenters = new Map();
  const tee = (parent, point, ...args) => {
    if (!teeCenters.has(parent)) teeCenters.set(parent, []);
    teeCenters.get(parent).push(new T.Vector3(...point));
    return k.tee(parent, point, ...args);
  };
  const flowDistance = (route, point = null, reverse = false) => {
    const points = (route.userData.pipePath || route.userData.pipePoints).map(p => new T.Vector3(...p));
    if (reverse) points.reverse();
    let along = 0, nearest = null;
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1], direction = points[i].clone().sub(a), length = direction.length();
      if (length < 1e-8) continue;
      if (point) {
        const t = T.MathUtils.clamp(point.clone().sub(a).dot(direction) / (length * length), 0, 1);
        const distance = point.distanceTo(a.clone().addScaledVector(direction, t));
        if (!nearest || distance < nearest.distance) nearest = {distance, along: along + t * length};
      }
      along += length;
    }
    return point ? nearest.along : along;
  };
  const mesh = (parent, geometry, material, x = 0, y = 0, z = 0) => {
    const m = new T.Mesh(geometry, material);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  const bevel = (parent, x, y, z, w, h, d, material, radius = .035) => {
    if (k.roundBox) return k.roundBox(parent, x, y, z, w, h, d, material, radius);
    const r = Math.min(radius, w / 5, h / 5, d / 5);
    const shape = new T.Shape();
    shape.moveTo(-w / 2 + r, -h / 2 + r);
    shape.lineTo(w / 2 - r, -h / 2 + r);
    shape.lineTo(w / 2 - r, h / 2 - r);
    shape.lineTo(-w / 2 + r, h / 2 - r);
    shape.closePath();
    const geo = new T.ExtrudeGeometry(shape, {depth: d - r * 2, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: r, bevelThickness: r, curveSegments: 1});
    geo.center();
    return mesh(parent, geo, material, x, y, z);
  };
  const instances = (parent, geometry, material, positions) => {
    const m = new T.InstancedMesh(geometry, material, positions.length);
    const dummy = new T.Object3D();
    positions.forEach((p, i) => {
      dummy.position.set(p[0], p[1], p[2]);
      dummy.rotation.set(p[3] || 0, p[4] || 0, p[5] || 0);
      dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix);
    });
    m.castShadow = m.receiveShadow = true;
    m.instanceMatrix.needsUpdate = true;
    parent.add(m); return m;
  };
  const hose = (parent, points, radius, material) => mesh(parent,
    new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p))), 32, radius, 8, false), material);
  const base = () => {
    const g = k.group();
    bevel(g, 0, -.095, 0, 10.5, .19, 6.5, ivory, .035);
    bevel(g, 0, .012, 0, 10.3, .028, 6.3, floorFinish, .009);
    // A fine recessed foot, not a thick presentation plinth.
    bevel(g, 0, -.2, 0, 10.14, .03, 6.14, limestone, .012);
    return g;
  };
  const strip = (g, x, y, z, w, d, material = k.light) => k.box(g, x, y, z, w, .026, d, material);
  const wheel = (g, x, y, z, radius = .18) => {
    const v = k.group(g); v.position.set(x, y, z);
    k.torus(v, 0, 0, 0, radius, .025, k.red);
    const hub = k.cylinder(v, 0, 0, 0, .043, .13, k.metal); hub.rotation.x = Math.PI / 2;
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      const spoke = k.cylinder(v, Math.sin(a) * radius * .48, Math.cos(a) * radius * .48, 0, .012, radius * .85, k.red);
      spoke.rotation.z = -a;
    }
    return v;
  };
  const band = (g, x, y, z, radius, material, axis = 'y') => {
    const ring = k.cylinder(g, x, y, z, radius, .065, material);
    if (axis === 'x') ring.rotation.z = Math.PI / 2;
    if (axis === 'z') ring.rotation.x = Math.PI / 2;
    return ring;
  };
  const gauge = (g, x, y, z, size = .105) => {
    const rim = k.cylinder(g, x, y, z, size, .065, k.metal);
    rim.rotation.x = Math.PI / 2;
    const face = k.cylinder(g, x, y, z + .036, size * .84, .009, k.cream);
    face.rotation.x = Math.PI / 2;
    const needle = k.box(g, x + size * .16, y + size * .15, z + .043, size * .055, size * .72, .01, k.dark);
    needle.rotation.z = -.72;
    k.sphere(g, x, y, z + .046, size * .09, k.dark);
  };
  const sprinkler = (g, x, z) => {
    tee(g, [x, 3.87, z], [1, 0, 0], [0, -1, 0], .115, .039);
    k.pipe(g, [[x, 3.87, z], [x, 3.5, z]], .039);
    k.cylinder(g, x, 3.48, z, .06, .045, k.metal);
    k.cylinder(g, x, 3.405, z, .012, .1, k.red);
    k.cylinder(g, x, 3.35, z, .09, .018, k.metal);
  };

  function fireScene() {
    // Concrete parking structure; a fire station is the dominant visual anchor.
    const fire = base();
    bevel(fire, 0, 2.12, -2.92, 10.4, 4.24, .2, ivory, .025);
    bevel(fire, -5.12, 1.15, -.8, .18, 2.3, 4.2, limestone, .025);
    bevel(fire, 0, 4.36, -2.2, 10.5, .19, 1.72, ivory, .025);
    for (const x of [-3.5, -1.75, 1.75, 3.5]) k.box(fire, x, 2.04, -2.808, .009, 4.02, .006, seam);
    k.box(fire, 0, .2, -2.795, 10.28, .22, .04, limestone);
    strip(fire, 0, 4.25, -1.47, 9.5, .025, warmLight);
    for (const x of [-4.7, 0, 4.7]) {
      bevel(fire, x, 2.14, -1.95, .46, 4.28, .6, limestone, .025);
      bevel(fire, x, .29, -1.625, .48, .52, .045, graphite, .012);
      k.box(fire, x, .535, -1.597, .44, .035, .015, k.amber);
    }
    for (const z of [-2.1, .6]) bevel(fire, 0, 4.3, z, 10.4, .22, .3, ivory, .025);
    for (const x of [-3.3, 3.3]) {
      k.box(fire, x, 4.16, -.1, .13, .12, 3.8, k.dark);
      strip(fire, x, 4.085, -.1, .09, 3.5);
    }
    for (const x of [-4.7, -2.1, 2.1, 4.7]) strip(fire, x, .035, .55, .06, 4.4, k.white);
    for (const x of [-3.4, 3.4]) {
      strip(fire, x, .04, 2.5, 2.55, .06, k.white);
      bevel(fire, x, .08, -.5, 1.3, .12, .2, graphite, .025);
      strip(fire, x, .145, -.5, .48, .07, k.amber);
    }
    const cabinet = k.group(fire); cabinet.position.set(0, 0, -.91);
    bevel(cabinet, 0, 1.66, -.23, 1.62, 2.78, .36, k.red, .025);
    k.box(cabinet, 0, 1.67, -.015, 1.38, 2.5, .045, k.dark);
    k.box(cabinet, 0, 1.68, .025, 1.28, 2.42, .024, k.red);
    // Separate upper hose and lower extinguisher compartments.
    k.box(cabinet, 0, 1.16, .19, 1.53, .07, .36, k.red);
    const reel = k.group(cabinet); reel.position.set(0, 2.15, .2);
    const reelBack = k.cylinder(reel, 0, 0, 0, .53, .08, k.red); reelBack.rotation.x = Math.PI / 2;
    for (let i = 0; i < 5; i++) k.torus(reel, 0, 0, .07, .46 - i * .073, .032, k.cream);
    const reelFront = k.cylinder(reel, 0, 0, .12, .27, .035, k.red); reelFront.rotation.x = Math.PI / 2;
    k.box(reel, -.22, 0, .17, .58, .08, .04, k.red);
    const reelHub = k.cylinder(reel, 0, 0, .18, .055, .06, k.metal); reelHub.rotation.x = Math.PI / 2;
    hose(cabinet, [[.43, 2.22, .23], [.51, 1.79, .23], [.27, 1.37, .22], [.1, 1.45, .21]], .035, k.cream);
    const nozzle = k.cylinder(cabinet, .1, 1.49, .21, .04, .22, k.metal); nozzle.rotation.z = -.22;
    k.cylinder(cabinet, -.08, .65, .22, .18, .62, k.red);
    k.sphere(cabinet, -.08, .955, .22, .18, k.red).scale.y = .45;
    k.box(cabinet, -.08, 1.015, .22, .2, .045, .09, k.dark);
    k.torus(cabinet, -.08, .59, .22, .183, .012, k.metal, Math.PI / 2);
    hose(cabinet, [[-.16, 1.01, .22], [-.34, .9, .24], [-.3, .47, .25]], .024, k.black);
    k.box(cabinet, 0, 1.68, .4, 1.37, 2.46, .028, k.glass);
    for (const x of [-.73, .73]) k.box(cabinet, x, 1.68, .42, .07, 2.64, .07, k.red);
    for (const y of [.36, 1.16, 3]) k.box(cabinet, 0, y, .42, 1.49, .065, .07, k.red);
    k.box(cabinet, -.6, 1.82, .47, .035, .3, .05, k.metal);
    // Silver distribution main, red identification bands and an actual cabinet inlet.
    k.pipe(fire, [[1.35, -.035, -.6], [1.35, 3.87, -.6]], .105);
    k.pipe(fire, [[1.35, 3.87, -.6], [-4.96, 3.87, -.6]], .115);
    k.pipe(fire, [[1.35, 3.87, -.6], [4.96, 3.87, -.6]], .115);
    tee(fire, [1.35, 3.87, -.6], [1, 0, 0], [0, -1, 0], .115, .105);
    // Closed ends and a seated floor penetration keep the route continuous.
    for (const x of [-4.96, 4.96]) {
      const cap = k.cylinder(fire, x, 3.87, -.6, .122, .055, k.metal); cap.rotation.z = Math.PI / 2;
    }
    k.cylinder(fire, 1.35, .05, -.6, .17, .045, k.metal);
    for (const x of [-3.15, -.75, 2.8, 4.1]) band(fire, x, 3.87, -.6, .118, k.red, 'x');
    for (const y of [.45, 2.65, 3.5]) band(fire, 1.35, y, -.6, .108, k.red);
    k.cylinder(fire, 1.35, 1.72, -.6, .135, .27, k.red);
    const valveStem = k.pipe(fire, [[1.35, 1.72, -.6], [1.35, 1.72, -.2]], .052);
    valveStem.userData.pipeSelectable = false;
    wheel(fire, 1.35, 1.72, -.13, .22);
    tee(fire, [1.35, 1.42, -.6], [0, 1, 0], [-1, 0, 0], .105, .06);
    k.pipe(fire, [[1.35, 1.42, -.6], [.68, 1.42, -.6], [.68, 1.42, -.9]], .06);
    const inlet = k.cylinder(fire, .68, 1.42, -.88, .09, .12, k.metal); inlet.rotation.x = Math.PI / 2;
    k.pipe(fire, [[1.35, 2.22, -.6], [1.35, 2.22, -.3]], .025);
    gauge(fire, 1.35, 2.22, -.22, .13);
    // A sign, reel and extinguisher distinguish this from a domestic pipe riser.
    bevel(cabinet, 0, 3.22, .04, 1.6, .29, .055, k.red, .016);
    k.torus(cabinet, -.47, 3.22, .078, .085, .014, k.cream);
    k.box(cabinet, .15, 3.22, .076, .64, .035, .015, k.cream);
    for (const x of [-.66, .66]) for (const y of [.48, 2.88]) {
      const screw = k.cylinder(cabinet, x, y, .466, .021, .008, k.metal);
      screw.rotation.x = Math.PI / 2;
    }
    for (const x of [-3.7, -1.75, 3.55]) sprinkler(fire, x, -.6);
    for (const x of [-4.1, -.9, 2.7, 4.5]) k.pipe(fire, [[x, 4.17, -.6], [x, 3.94, -.6]], .013, k.dark);
    return {id: 'fire', group: fire, center: [0, 2.1, 0], radius: 7, update() {}};
  }

  function industryScene() {
    // Machining cells: open shell, interior spindle/worktable and real depth.
    const industry = base();
    bevel(industry, 0, .52, -3.04, 10.4, 1.04, .18, ivory, .025);
    bevel(industry, 0, 4.18, -3.04, 10.4, .64, .18, ivory, .025);
    bevel(industry, 0, 1.075, -2.95, 10.35, .085, .36, limestone, .018);
    for (const x of [-4.45, -2.2, 0, 2.2, 4.45]) {
      k.box(industry, x, 2.48, -3.035, 1.98, 2.74, .035, k.glass);
      for (const dx of [-1.015, 1.015]) bevel(industry, x + dx, 2.48, -3.005, .055, 2.84, .09, graphite, .009);
      k.box(industry, x, 2.95, -2.995, 1.99, .035, .09, graphite);
      k.box(industry, x, 2.48, -2.995, .028, 2.74, .07, graphite);
    }
    for (const x of [-5, 0, 5]) bevel(industry, x, 2.26, -2.55, .2, 4.5, .22, ivory, .018);
    for (const z of [-2.7, 1.3]) bevel(industry, 0, 4.54, z, 10.4, .18, .22, ivory, .018);
    for (const x of [-4, -2, 0, 2, 4]) {
      k.box(industry, x, 4.47, -.6, .1, .12, 4.2, k.white);
      strip(industry, x, 4.39, -.6, .065, 1.7);
    }
    const spindleGroups = [];
    const makeCNC = (x, z) => {
      const g = k.group(industry); g.position.set(x, 0, z);
      bevel(g, 0, .23, 0, 3.17, .4, 2.25, graphite, .055);
      bevel(g, -1.42, 1.54, -.05, .34, 2.45, 2.25, k.white, .04);
      bevel(g, 1.42, 1.54, -.05, .34, 2.45, 2.25, k.white, .04);
      bevel(g, 0, 2.66, -.05, 2.65, .25, 2.25, k.white, .04);
      k.box(g, 0, 1.55, -1.13, 2.7, 2.25, .12, k.stone);
      bevel(g, 0, .52, -.05, 2.65, .22, 2.25, k.white, .035);
      for (const rail of [-.93, .93]) {
        k.cylinder(g, rail, 1.57, -.65, .065, 1.7, k.metal);
        k.box(g, rail, .75, -.55, .25, .17, 1.05, k.dark);
      }
      const spindle = k.group(g); spindle.position.set(0, 0, .07);
      bevel(spindle, 0, 2.09, -.21, .86, .6, .75, k.white, .035);
      k.cylinder(spindle, 0, 1.68, .01, .14, .42, k.metal);
      k.cylinder(spindle, 0, 1.39, .01, .045, .18, k.dark);
      spindle.traverse(object => {object.userData.dynamic = true;});
      spindleGroups.push(spindle);
      k.box(g, 0, .84, .05, 1.7, .14, 1.15, k.dark);
      const grooves = Array.from({length: 8}, (_, i) => [-.71 + i * .2, .916, .05]);
      instances(g, new T.BoxGeometry(.025, .01, 1.05), k.metal, grooves);
      k.cylinder(g, 0, .99, .01, .25, .15, k.metal);
      k.box(g, -.35, .98, .01, .17, .13, .45, k.metal);
      k.box(g, .35, .98, .01, .17, .13, .45, k.metal);
      for (const dx of [-.66, .66]) {
        k.box(g, dx, 1.59, 1.11, 1.26, 1.98, .035, k.glass);
        for (const edge of [-.64, .64]) k.box(g, dx + edge, 1.59, 1.14, .045, 2.04, .07, k.dark);
        k.box(g, dx, 2.6, 1.14, 1.32, .055, .07, k.dark);
        k.box(g, dx, .6, 1.14, 1.32, .055, .07, k.dark);
        k.pipe(g, [[dx * .25, 1.26, 1.18], [dx * .25, 1.92, 1.18]], .025, k.metal);
      }
      const panel = k.group(g); panel.position.set(1.72, 1.75, .89); panel.rotation.y = -.14;
      bevel(panel, 0, 0, 0, .5, 1.05, .15, k.navy, .025);
      k.box(panel, 0, .23, .082, .37, .31, .012, k.dark);
      k.box(panel, 0, .23, .093, .32, .26, .009, k.aqua);
      const keys = [];
      for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) keys.push([-.12 + col * .08, -.025 - row * .065, .087]);
      instances(panel, new T.BoxGeometry(.045, .035, .012), k.cream, keys);
      k.sphere(panel, -.13, -.38, .1, .045, k.red).scale.z = .5;
      k.sphere(panel, .13, -.38, .1, .033, k.amber).scale.z = .5;
      const legPositions = [[-1.22, .06, -.84], [1.22, .06, -.84], [-1.22, .06, .84], [1.22, .06, .84]];
      instances(g, new T.CylinderGeometry(.1, .12, .12, 12), k.dark, legPositions);
      for (const edge of [-1.78, 1.98]) strip(g, edge, .04, .15, .028, 2.9, seam);
      strip(g, .1, .04, 1.58, 3.8, .028, seam);
      return g;
    };
    makeCNC(-2.35, -.8); makeCNC(2.15, .55);
    k.pipe(industry, [[-4.8, -.035, -.8], [-4.8, 4.04, -.8], [4.9, 4.04, -.8]], .11);
    k.cylinder(industry, -4.8, .045, -.8, .18, .055, k.metal);
    const mainCap = k.cylinder(industry, 4.9, 4.04, -.8, .119, .055, k.metal); mainCap.rotation.z = Math.PI / 2;
    for (const [x, z] of [[-2.35, -.8], [2.15, .55]]) {
      tee(industry, [x, 4.04, -.8], [1, 0, 0], [0, -1, 0], .11, .07);
      const feed = x < 0
        ? [[x, 4.04, -.8], [x, 2.76, -.8]]
        : [[x, 4.04, -.8], [x, 3.35, -.8], [x, 3.35, z], [x, 2.76, z]];
      k.pipe(industry, feed, .07);
      // A seated bulkhead connection ends inside the machine enclosure.
      k.cylinder(industry, x, 2.79, z, .135, .085, k.metal);
      k.cylinder(industry, x, 2.88, z, .09, .12, k.metal);
      band(industry, x, 3.06, z, .073, k.aqua);
      k.pipe(industry, [[x, 3.2, z], [x, 3.2, z + .19]], .025);
      gauge(industry, x, 3.2, z + .25, .1);
      bevel(industry, x - .44, 2.82, z, .4, .1, .38, k.navy, .025);
      for (const offset of [-.4, .4]) band(industry, x + offset, 4.04, -.8, .113, k.metal, 'x');
      const stack = k.group(industry); stack.position.set(x + 1.14, 2.8, z - .7);
      k.cylinder(stack, 0, .14, 0, .035, .28, k.dark);
      for (let i = 0; i < 3; i++) k.cylinder(stack, 0, .34 + i * .09, 0, .052, .08, [k.aqua, k.amber, k.red][i]);
    }
    const toolCabinet = k.group(industry); toolCabinet.position.set(-4.48, 0, 2.2);
    bevel(toolCabinet, 0, .58, 0, 1.02, 1.08, .72, k.navy, .035);
    k.box(toolCabinet, 0, 1.15, 0, 1.09, .07, .8, k.metal);
    for (let i = 0; i < 4; i++) {
      k.box(toolCabinet, 0, .22 + i * .235, .367, .91, .2, .025, k.navy);
      k.box(toolCabinet, 0, .27 + i * .235, .398, .58, .025, .035, k.metal);
    }
    return {id: 'industry', group: industry, center: [0, 2.1, 0], radius: 7, update(time, entry = 1) {
      spindleGroups.forEach((g, i) => {g.position.y = -.075 * (1 + Math.sin(time * 1.2 + i * 1.8)) * entry;});
    }};
  }

  function coolingScene() {
    // Data hall: independently routed supply and return with visible service aisle.
    const cooling = base();
    bevel(cooling, 0, 2.24, -3.06, 10.4, 4.48, .15, ivory, .02);
    bevel(cooling, 0, 4.53, -2.56, 10.48, .16, 1.15, ivory, .02);
    strip(cooling, 0, 4.438, -2.045, 9.3, .022, warmLight);
    // Wall joints, a recessed base and a narrow transom give the room depth.
    for (const x of [-4.16, -2.08, 0, 2.08, 4.16]) k.box(cooling, x, 2.22, -2.976, .012, 4.2, .01, seam);
    k.box(cooling, 0, .15, -2.948, 10.28, .21, .055, limestone);
    for (const x of [-4.45, 4.45]) {
      bevel(cooling, x, 3.98, -2.953, .96, .41, .06, graphite, .012);
      k.box(cooling, x, 3.98, -2.914, .88, .33, .015, k.glass);
    }
    const floorLines = [];
    for (let x = -4.5; x <= 4.5; x += .9) floorLines.push([x, .032, 0]);
    instances(cooling, new T.BoxGeometry(.009, .006, 6.18), seam, floorLines);
    instances(cooling, new T.BoxGeometry(10.18, .006, .009), seam, Array.from({length: 7}, (_, i) => [0, .033, -2.7 + i * .9]));
    for (let z = -2.5; z <= 2.5; z += .8) {
      k.box(cooling, 0, .039, z, .72, .015, .45, k.stone);
      instances(cooling, new T.BoxGeometry(.016, .013, .41), k.dark, Array.from({length: 14}, (_, i) => [-.31 + i * .047, .053, z]));
    }
    const ledMaterial = new T.MeshStandardMaterial({color: 0x9fc9cd, emissive: 0x78c5cc, emissiveIntensity: 1.05, roughness: .3});
    ledMaterial.userData.dynamic = true;
    const ledSets = [], lights = [];
    const makeRack = (x, z, side) => {
      const g = k.group(cooling); g.position.set(x, 0, z); g.rotation.y = side * Math.PI / 2;
      bevel(g, 0, 1.7, 0, 1.55, 3.34, 1.18, graphite, .035);
      bevel(g, 0, 1.71, -.605, 1.39, 3.13, .045, k.dark, .018);
      // The rear service doors have real vents, hinges and a recessed pull.
      const rearVents = [];
      for (let row = 0; row < 17; row++) rearVents.push([0, .43 + row * .156, -.635]);
      instances(g, new T.BoxGeometry(1.13, .012, .018), k.black, rearVents);
      for (const y of [.52, 2.82]) k.box(g, -.715, y, -.638, .038, .14, .035, k.metal);
      bevel(g, .57, 1.72, -.642, .065, .36, .018, k.black, .009);
      k.box(g, 0, 1.72, .6, 1.39, 3.14, .025, k.black);
      const vents = [], leds = [], screws = [];
      for (let i = 0; i < 8; i++) {
        const y = .38 + i * .355;
        bevel(g, 0, y, .635, 1.32, .31, .045, k.dark, .008);
        for (let c = 0; c < 10; c++) vents.push([-.54 + c * .075, y, .665]);
        for (let c = 0; c < 3; c++) leds.push([.31 + c * .095, y + .03, .67]);
        screws.push([-.61, y, .67], [.61, y, .67]);
      }
      instances(g, new T.BoxGeometry(.024, .16, .012), k.black, vents);
      instances(g, new T.BoxGeometry(.018, .018, .008), k.metal, screws);
      const led = instances(g, new T.BoxGeometry(.035, .014, .013), ledMaterial, leds);
      led.castShadow = false; led.userData.dynamic = true; ledSets.push(led);
      for (const edge of [-.725, .725]) k.box(g, edge, 1.69, .7, .032, 3.18, .06, k.metal);
      k.box(g, 0, 1.69, .716, 1.4, 3.1, .014, k.glass);
      k.pipe(g, [[.59, 1.4, .76], [.59, 1.91, .76]], .023, k.dark);
      k.box(g, 0, .09, 0, 1.61, .16, 1.22, k.dark);
      strip(g, 0, .175, .62, 1.42, .015, k.metal);
      for (const fanx of [-.4, .4]) {
        k.torus(g, fanx, 3.385, 0, .22, .018, k.dark, Math.PI / 2);
        k.cylinder(g, fanx, 3.38, 0, .19, .018, k.black);
      }
      return g;
    };
    for (const z of [-1.92, 0, 1.92]) {makeRack(-2.4, z, 1); makeRack(2.4, z, -1);}
    // Both silver headers terminate in a visible service unit, rather than
    // hovering above the aisle. Coloured collars identify the paired circuits.
    const cdu = k.group(cooling); cdu.position.set(-4.23, 0, 2.12);
    bevel(cdu, 0, 1.02, 0, 1.35, 1.96, 1.35, k.white, .055);
    bevel(cdu, 0, .15, 0, 1.39, .2, 1.4, k.navy, .025);
    k.box(cdu, 0, 1.11, .687, 1.19, 1.6, .026, k.navy);
    k.box(cdu, 0, 1.55, .706, .79, .35, .018, k.dark);
    k.box(cdu, -.12, 1.55, .718, .45, .2, .009, k.aqua);
    for (let i = 0; i < 9; i++) k.box(cdu, 0, .44 + i * .075, .71, .89, .025, .018, k.dark);
    k.box(cdu, .5, 1.12, .72, .035, .36, .045, k.metal);
    k.sphere(cdu, .35, 1.55, .73, .038, k.aqua).scale.z = .45;
    for (const [x, z, material] of [[-4.55, 2.47, k.aqua], [-3.95, 2.72, k.navy]]) {
      k.cylinder(cooling, x, 2.025, z, .16, .075, k.metal);
      k.cylinder(cooling, x, 2.1, z, .118, .1, k.metal);
      band(cooling, x, 2.22, z, .105, material);
    }
    k.pipe(cooling, [[-4.55, 2.03, 2.47], [-4.55, 3.98, 2.47], [-.76, 3.98, 2.47], [-.76, 3.98, -2.78]], .102);
    const returnHeader = k.pipe(cooling, [[-3.95, 2.03, 2.72], [-3.95, 4.2, 2.72], [.76, 4.2, 2.72], [.76, 4.2, -2.78]], .102);
    returnHeader.userData.flowReverse = true;
    for (const [x, y, material] of [[-.76, 3.98, k.aqua], [.76, 4.2, k.navy]]) {
      for (const z of [-2.4, -.85, 1.16]) band(cooling, x, y, z, .105, material, 'z');
      // A closed header end is part of the assembly; no open airborne pipe mouth.
      const cap = k.cylinder(cooling, x, y, -2.79, .112, .055, k.metal);
      cap.rotation.x = Math.PI / 2;
    }
    for (const z of [-1.92, 0, 1.92]) {
      for (const rackX of [-2.4, 2.4]) {
        const supplyX = rackX - .19, returnX = rackX + .19;
        // Staggered take-offs keep each connection a real three-way press tee,
        // not two overlapping tees that visually form an unsupported cross.
        const supplyZ = z + (rackX < 0 ? -.36 : .3);
        const returnZ = z + (rackX < 0 ? -.22 : .44);
        const branchDirection = rackX < 0 ? -1 : 1;
        tee(cooling, [-.76, 3.98, supplyZ], [0, 0, 1], [branchDirection, 0, 0], .102, .058);
        tee(cooling, [.76, 4.2, returnZ], [0, 0, 1], [branchDirection, 0, 0], .102, .058);
        k.pipe(cooling, [[-.76, 3.98, supplyZ], [supplyX, 3.98, supplyZ], [supplyX, 3.37, supplyZ]], .058);
        const rackReturn = k.pipe(cooling, [[.76, 4.2, returnZ], [returnX, 4.2, returnZ], [returnX, 3.37, returnZ]], .058);
        rackReturn.userData.flowReverse = true;
        // A return branch converges into the header: its endpoint must share
        // the header's travelled distance. Use the actual elbow centreline,
        // rather than an arbitrary animation phase or Manhattan-length guess.
        rackReturn.userData.flowOffset = flowDistance(returnHeader, new T.Vector3(.76, 4.2, returnZ), true) - flowDistance(rackReturn);
        for (const [x, portZ, material] of [[supplyX, supplyZ, k.aqua], [returnX, returnZ, k.navy]]) {
          k.cylinder(cooling, x, 3.39, portZ, .105, .075, k.metal);
          band(cooling, x, 3.55, portZ, .061, material);
        }
      }
      k.box(cooling, 0, 4.5, z, 6.1, .11, .15, k.white);
      lights.push(strip(cooling, 0, 4.43, z, 1.03, .09));
    }
    for (const [x, z, material] of [[-4.55, 2.47, k.aqua], [-3.95, 2.72, k.navy]]) {
      k.cylinder(cooling, x, 2.75, z, .13, .22, k.metal);
      k.pipe(cooling, [[x, 2.75, z], [x, 2.75, z + .16]], .025);
      const v = wheel(cooling, x, 2.75, z + .2, .12);
      v.traverse(o => {if (o.isMesh && o.material === k.red) o.material = material;});
    }
    let previousLedFrame = -1;
    const ledColor = new T.Color();
    return {id: 'cooling', group: cooling, center: [0, 2.1, 0], radius: 7, update(time, entry = 1) {
      const frame = Math.floor(time * 3);
      if (frame === previousLedFrame) return;
      previousLedFrame = frame;
      ledSets.forEach((set, row) => {
        for (let i = 0; i < set.count; i++) {
          const intensity = ((frame + i * 7 + row * 3) % 13 < 4 ? .28 : .83) * Math.max(.3, entry);
          ledColor.setRGB(intensity * .43, intensity, intensity);
          set.setColorAt(i, ledColor);
        }
        set.instanceColor.needsUpdate = true;
      });
    }};
  }

  const models = [];
  if (!sceneId || sceneId === 'fire') models.push(fireScene());
  if (!sceneId || sceneId === 'industry') models.push(industryScene());
  if (!sceneId || sceneId === 'cooling') models.push(coolingScene());
  // The tee owns its three press mouths; remove the pipe's default socket at
  // its branch centre so no spurious fourth ring cuts through the tee body.
  for (const [parent, points] of teeCenters) for (const route of parent.children) {
    if (!route.userData.pipeSelectable) continue;
    for (const child of [...route.children]) {
      if (child.userData.pressSocket && points.some(p => child.position.distanceTo(p) < .001)) route.remove(child);
    }
  }
  // Powder-coated equipment is a subtly different white from the room;
  // retaining small navy control faces is enough to identify the product field.
  for (const {group} of models) group.traverse(object => {
    if (!object.isMesh) return;
    const replace = material => material === k.white ? satin
      : material === k.stone ? limestone
      : material === k.cream ? ivory : material;
    object.material = Array.isArray(object.material) ? object.material.map(replace) : replace(object.material);
  });
  return models;
}
