import {
  ACESFilmicToneMapping, AmbientLight, CanvasTexture, Color, CylinderGeometry, DirectionalLight,
  GridHelper, Group, HemisphereLight, Mesh, MeshStandardMaterial, PCFSoftShadowMap,
  PerspectiveCamera, PlaneGeometry, RepeatWrapping, Scene, SRGBColorSpace, Vector3, WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { AvatarAsset, AvatarParameters, DiagnosticResult, GarmentAsset, GarmentSettings } from '../types';
import { buildAvatar, poseAvatar } from '../avatar/body';
import { ProxyGarmentEngine } from '../garments/proxy-engine';
import { CollisionDiagnostics } from '../diagnostics/collisions';
import { FABRICS } from '../garments/catalog';
export class Studio {
  readonly scene = new Scene(); readonly assets = new Group();
  readonly renderer: WebGLRenderer; readonly camera = new PerspectiveCamera(32, 1, .05, 40);
  readonly orbit: OrbitControls;
  avatar!: AvatarAsset; garment!: GarmentAsset; private checker!: CollisionDiagnostics;
  private engine = new ProxyGarmentEngine(); private lastDiagnostic = 0; private motionTime = 0;
  private dirty = true; private wireframe = false; private overlay = false;
  private result?: DiagnosticResult; private texture?: CanvasTexture;
  animated = false;
  constructor(private container: HTMLElement, private onDiagnostic: (result: DiagnosticResult) => void) {
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true; this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.toneMapping = ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.12;
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.domElement.setAttribute('aria-label', 'Interactive synthetic avatar. Drag to orbit and scroll to zoom.');
    this.renderer.domElement.setAttribute('role', 'img'); this.renderer.domElement.tabIndex = 0;
    container.prepend(this.renderer.domElement);
    this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbit.enableDamping = true; this.orbit.minDistance = 1.9; this.orbit.maxDistance = 7;
    this.orbit.maxPolarAngle = Math.PI * .52; this.orbit.minPolarAngle = .18;
    this.scene.add(this.assets); this.assets.name = 'synthetic-assets';
    this.scene.add(new AmbientLight('#ffffff', .8), new HemisphereLight('#ffffff', '#b0b6a1', 2.2));
    const key = new DirectionalLight('#fff8ea', 3.1); key.position.set(-2, 5, 4); key.castShadow = true;
    key.shadow.mapSize.set(2048,2048); key.shadow.camera.left = -2; key.shadow.camera.right = 2;
    key.shadow.camera.top = 3; key.shadow.camera.bottom = -2; key.shadow.normalBias = .015;
    this.scene.add(key);
    const rim = new DirectionalLight('#edf3ff', 1.7); rim.position.set(3,3,-3); this.scene.add(rim);
    const floor = new Mesh(new PlaneGeometry(200,200), new MeshStandardMaterial({color:'#e5e6df', roughness:1}));
    floor.rotation.x = -Math.PI/2; floor.position.y = -.038; floor.receiveShadow = true; this.scene.add(floor);
    const pedestal = new Mesh(new CylinderGeometry(.66,.67,.028,96), new MeshStandardMaterial({color:'#ebebe5',roughness:.85}));
    pedestal.position.y = -.016; pedestal.receiveShadow = true; this.scene.add(pedestal);
    const grid = new GridHelper(10,100,'#c4c9bf','#d3d7cf'); grid.position.y = -.036; grid.material.transparent = true; grid.material.opacity = .45; this.scene.add(grid);
    new ResizeObserver(() => this.resize()).observe(container); this.resize();
    this.renderer.domElement.addEventListener('keydown', e => {
      if (e.key === 'Home') this.view('reset');
      if (e.key === '+' || e.key === '=') this.zoom(.88);
      if (e.key === '-') this.zoom(1.12);
    });
    this.renderer.setAnimationLoop((ms) => {
      if (!this.avatar) return;
      if (this.animated) {
        this.motionTime = ms / 1000; poseAvatar(this.avatar, this.motionTime);
        if (ms - this.lastDiagnostic > 350) this.dirty = true;
      }
      if (this.dirty) {
        this.result = this.checker.evaluate(this.garment); this.onDiagnostic(this.result);
        this.paintDiagnostics(); this.lastDiagnostic = ms; this.dirty = false;
      }
      this.orbit.update(); this.renderer.render(this.scene,this.camera);
    });
  }
  updateBody(parameters: AvatarParameters, garment: GarmentSettings) {
    this.disposeAssets();
    this.avatar = buildAvatar(parameters);
    this.assets.add(this.avatar.mesh, this.avatar.rig, this.avatar.hair, this.avatar.accessories);
    this.checker = new CollisionDiagnostics(this.avatar); this.updateGarment(garment);
  }
  updateGarment(settings: GarmentSettings) {
    if (this.garment) { this.assets.remove(this.garment.mesh); this.garment.mesh.geometry.dispose(); (this.garment.mesh.material as MeshStandardMaterial).dispose(); }
    this.garment = this.engine.build(this.avatar,settings); this.assets.add(this.garment.mesh);
    this.setMaterial(settings); this.setWireframe(this.wireframe); this.dirty = true;
  }
  setMaterial(settings: GarmentSettings) {
    const material = this.garment.mesh.material as MeshStandardMaterial;
    material.color.set(settings.color); material.roughness = FABRICS[settings.fabric].roughness;
    this.texture?.dispose();
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d')!; ctx.fillStyle = '#999'; ctx.fillRect(0,0,64,64);
    const fabric = settings.fabric;
    for (let y = 0; y < 64; y += fabric === 'knit' ? 4 : 2) {
      ctx.strokeStyle = y % 4 === 0 ? '#aaa' : '#888'; ctx.lineWidth = 1;
      ctx.beginPath();
      if (fabric === 'denim') { ctx.moveTo(0,y); ctx.lineTo(64,y+64); ctx.moveTo(0,y-64); ctx.lineTo(64,y); }
      else { ctx.moveTo(y,0); ctx.lineTo(y,64); }
      ctx.stroke();
    }
    this.texture = new CanvasTexture(canvas); this.texture.wrapS = this.texture.wrapT = RepeatWrapping;
    this.texture.repeat.set(8,8); material.bumpMap = this.texture; material.bumpScale = fabric === 'stiff' ? .0002 : .001;
    material.needsUpdate = true; this.garment.settings = {...settings};
  }
  setWireframe(value: boolean) {
    this.wireframe = value;
    for (const mesh of [this.avatar.mesh, this.garment.mesh]) (mesh.material as MeshStandardMaterial).wireframe = value;
  }
  setOverlay(value: boolean) { this.overlay = value; this.paintDiagnostics(); }
  setAnimated(value: boolean) { this.animated = value; if (!value) poseAvatar(this.avatar,0); this.dirty = true; }
  private paintDiagnostics() {
    if (!this.result) return;
    const colors = this.garment.mesh.geometry.attributes.color;
    for (let i = 0; i < colors.count; i++) {
      const hit = this.overlay && this.result.hitVertices.has(i);
      colors.setXYZ(i,1,hit ? .12 : 1,hit ? .06 : 1);
    }
    colors.needsUpdate = true;
    const mat = this.garment.mesh.material as MeshStandardMaterial;
    mat.color.set(this.overlay ? '#ddd8c9' : this.garment.settings.color);
  }
  view(view: 'front'|'side'|'back'|'reset') {
    const h = this.avatar?.parameters.height ?? 1.76;
    this.orbit.target.set(0,h*.49,0);
    const d = h*2.05;
    if (view === 'front') this.camera.position.set(0,h*.51,d);
    else if (view === 'side') this.camera.position.set(d,h*.51,0);
    else if (view === 'back') this.camera.position.set(0,h*.51,-d);
    else this.camera.position.set(d*.60,h*.70,d*.92);
    this.orbit.update();
  }
  zoom(factor: number) {
    const direction = this.camera.position.clone().sub(this.orbit.target);
    direction.setLength(Math.min(this.orbit.maxDistance, Math.max(this.orbit.minDistance,direction.length()*factor)));
    this.camera.position.copy(this.orbit.target).add(direction); this.orbit.update();
  }
  private resize() {
    const w = this.container.clientWidth, h = this.container.clientHeight;
    if (!w || !h) return; this.renderer.setSize(w,h); this.camera.aspect = w/h; this.camera.updateProjectionMatrix();
  }
  private disposeAssets() {
    if (!this.avatar) return;
    this.assets.clear(); this.checker.dispose(); this.avatar.mesh.geometry.dispose();
    (this.avatar.mesh.material as MeshStandardMaterial).dispose();
    this.avatar.parts.forEach(p=>p.geometry.dispose()); this.avatar.skeleton.dispose();
  }
  snapshot() {
    return { schemaVersion:1, name:'Garment Playground', units:'m', accuracyTier:'visual-proxy', avatar:this.avatar.parameters, garment:this.garment.settings, pose:this.animated?'skeletal-preview':'A-pose', camera:{position:this.camera.position.toArray(),target:this.orbit.target.toArray()}, limitations:'Synthetic visual parameters only. No real-world fit, size, pressure, comfort, tailoring, or validated drape.' };
  }
}
