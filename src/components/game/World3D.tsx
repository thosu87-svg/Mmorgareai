
"use client"

import { PerspectiveCamera, Float, OrbitControls, Environment, ContactShadows } from "@react-three/drei"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import React, { useMemo, useRef, useState, useEffect, Suspense } from "react"
import * as THREE from "three"
import { useStore } from "../../store"
import { Agent, AgentState, Chunk } from "../../types"
import { createHumanoidModel } from "./HumanoidModel"
import { AnimationController, createAnimationClips } from "./AnimationSystem"
import { WorldBuildingService } from "@/services/WorldBuildingService"
import { textureEngine } from "@/services/TextureEngine"
import { RobustnessEngine } from "@/lib/axiomatic-engine"
import { VFXEngine } from "@/services/VFXEngine"
import skyPresets from '@/data/sky-presets.json'

const ARL_COLORS = {
  void: "#020203",
  arcane: "#4cafcb",
  teal: "#4cafcb",
  gold: "#ffd700",
  silver: "#e8f0f8",
  border: "#1e2a4a",
  white: "#ffffff",
  ground: "#050508",
  forest: "#0a4040",
  city: "#1a3040",
  ruins: "#2a2a35",
  energy: "#102030"
}

const ResourceNode = ({ position, type, time }: { position: [number, number, number], type: string, time: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(time + position[0]) * 0.2;
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <icosahedronGeometry args={[0.3, 2]} />
      <meshStandardMaterial 
        color={type === 'gold' ? "#ffd700" : "#e8f0f8"} 
        emissive={type === 'gold' ? "#ffd700" : "#4cafcb"} 
        emissiveIntensity={0.5} 
      />
    </mesh>
  );
};

const HighScienceSpire = ({ position, rotationY, color, seed }: { position: [number, number, number], rotationY: number, color: string, seed: number }) => {
  const [archTex, setArchTex] = useState<THREE.Texture | null>(null);
  const forceEmissive = useStore(state => state.shaderSettings.forceEmissive);

  useEffect(() => {
    const updateTex = async () => {
      const tex = await textureEngine.getProceduralTexture('ARCHITECTURE', seed);
      if (tex) {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 8);
        setArchTex(tex);
      }
    };
    const unsub = textureEngine.subscribe(updateTex);
    updateTex();
    return unsub;
  }, [seed]);

  return (
    <group position={position} rotation={[0, rotationY || 0, 0]}>
      <mesh position={[0, 15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2, 5, 30, 6]} />
        <meshStandardMaterial 
          color={archTex ? "#ffffff" : color} 
          map={archTex || undefined}
          metalness={0.8} 
          roughness={0.2} 
          emissive={forceEmissive ? (archTex ? "#ffffff" : color) : "#222222"} 
          emissiveIntensity={forceEmissive ? 1.0 : 0.5} 
        />
      </mesh>
      <Float speed={3} rotationIntensity={4} floatIntensity={2}>
        <mesh position={[0, 35, 0]} scale={3}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={15} toneMapped={false} />
        </mesh>
      </Float>
      <pointLight position={[0, 35, 0]} intensity={100} color={color} distance={500} decay={2} />
    </group>
  );
};

const ChunkTerrain = ({ chunk }: { chunk: Chunk }) => {
  const chunkOffsetX = chunk.x * 400;
  const chunkOffsetZ = chunk.z * 400;

  const biomeTiles = useMemo(() => {
    const tiles = [];
    const tileSize = 40;
    for (let x = -200; x < 200; x += tileSize) {
      for (let z = -200; z < 200; z += tileSize) {
        tiles.push({ x, z });
      }
    }
    return tiles;
  }, []);

  return (
    <group position={[chunkOffsetX, -0.1, chunkOffsetZ]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial 
          color="#0a1a2a"
          roughness={0.7} 
          metalness={0.1} 
        />
      </mesh>

      {biomeTiles.map((t, i) => (
        <mesh key={i} position={[t.x + 20, 0.02, t.z + 20]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[38, 38]} />
          <meshStandardMaterial 
            color={ARL_COLORS[chunk.biome?.toLowerCase() as keyof typeof ARL_COLORS] || ARL_COLORS.ground} 
            transparent
            opacity={0.4}
            emissive={ARL_COLORS[chunk.biome?.toLowerCase() as keyof typeof ARL_COLORS] || ARL_COLORS.ground}
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}

      <gridHelper args={[400, 20, ARL_COLORS.teal, "#1a1a24"]} position={[0, 0.05, 0]} />
    </group>
  );
};

const ChunkGridOverlay = ({ chunks }: { chunks: Chunk[] }) => {
  return (
    <group name="AxiomChunkGrid">
      {chunks.map((chunk) => (
        <group key={`grid-group-${chunk.id}`} position={[chunk.x * 400, 0.1, chunk.z * 400]}>
          <gridHelper args={[400, 40, 0x223344, 0x111111]} />
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[400, 400]} />
            <meshBasicMaterial color={0x4cafcb} wireframe transparent opacity={0.05} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const AgentModelWrapper = ({ agent, isLocal = false, vfx }: { agent: Agent; isLocal?: boolean; vfx: VFXEngine | null }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<any>(null);
  const [animController, setAnimController] = useState<any>(null);
  const forceEmissive = useStore(state => state.shaderSettings.forceEmissive);

  useEffect(() => {
    if (!agent) return;
    RobustnessEngine.wrap(() => {
      const appearance = agent.appearance || { skinTone: '#c68642', bodyScale: 1.0 };
      const humanoid = createHumanoidModel({
        skinTone: appearance.skinTone,
        bodyScale: (appearance.bodyScale || 1.0) * 1.5 
      });
      if (humanoid) {
        setModel(humanoid);
        const clips = createAnimationClips(humanoid.bones);
        const controller = new AnimationController(humanoid.mesh, clips);
        setAnimController(controller);
        
        if (humanoid.mesh.material instanceof THREE.MeshStandardMaterial) {
          if (forceEmissive) {
            humanoid.mesh.material.emissive = new THREE.Color(appearance.skinTone);
            humanoid.mesh.material.emissiveIntensity = 0.5;
          } else {
            humanoid.mesh.material.emissive = new THREE.Color(0x333333);
            humanoid.mesh.material.emissiveIntensity = 0.3;
          }
        }
      }
    }, null, "AgentModelCreation");
  }, [agent.id, agent.appearance?.skinTone, agent.appearance?.bodyScale, forceEmissive]);

  useEffect(() => {
    if (animController && agent.state) animController.playForState(agent.state);
  }, [agent.state, animController]);

  useFrame((_state, delta) => {
    if (animController) animController.update(delta);
    if (groupRef.current && agent.position) {
      const targetPos = new THREE.Vector3(agent.position.x, 0, agent.position.z);
      groupRef.current.position.lerp(targetPos, isLocal ? 0.3 : 0.1);
    }
  });

  if (!model) return null;

  return (
    <group ref={groupRef}>
      <primitive object={model.group} />
      {isLocal && <pointLight position={[0, 3, 0]} intensity={20} color="#4cafcb" distance={50} />}
    </group>
  );
};

const CameraController = () => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const controlledAgentId = useStore(state => state.controlledAgentId);
  const agents = useStore(state => state.agents);
  const controlledAgent = useMemo(() => agents.find(a => a.id === controlledAgentId), [agents, controlledAgentId]);

  useFrame(() => {
    if (controlledAgent && controlledAgent.position) {
      const { x, z } = controlledAgent.position;
      const targetPos = new THREE.Vector3(x, 20, z + 50); 
      const lookAtPos = new THREE.Vector3(x, 2, z); 
      
      camera.position.lerp(targetPos, 0.1);
      camera.lookAt(lookAtPos);
      
      if (controlsRef.current) {
        controlsRef.current.target.lerp(lookAtPos, 0.1);
        controlsRef.current.update();
      }
    }
  });

  return <OrbitControls ref={controlsRef} makeDefault enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={1500} />;
};

const WorldContent = ({ localPlayerId, vfx }: { localPlayerId?: string | null; vfx: VFXEngine | null }) => {
  const agents = useStore(state => state.agents) || [];
  const chunks = useStore(state => state.loadedChunks) || [];
  
  const localAgent = useMemo(() => agents.find(a => a.id === localPlayerId), [agents, localPlayerId]);
  const otherAgents = useMemo(() => agents.filter(a => a.id !== localPlayerId), [agents, localPlayerId]);

  const { pois, resources } = useMemo(() => {
    const allPois: any[] = [];
    const allRes: any[] = [];
    chunks.forEach(c => {
      const content = WorldBuildingService.generateAxiomaticContent(c);
      content.pois.forEach(p => allPois.push({ ...p, seed: c.seed }));
      content.resources.forEach(r => allRes.push({ ...r, seed: c.seed }));
    });
    return { pois: allPois, resources: allRes };
  }, [chunks]);

  const [time, setTime] = useState(0);
  useFrame((state) => {
    setTime(state.clock.elapsedTime);
    if (vfx) vfx.update(state.clock.getDelta());
  });

  return (
    <>
      {chunks.map(c => <ChunkTerrain key={c.id} chunk={c} />)}
      <ChunkGridOverlay chunks={chunks} />
      {localAgent && <LocalPlayerController agent={localAgent} vfx={vfx} />}
      {otherAgents.map(a => <AgentModelWrapper key={a.id} agent={a} vfx={vfx} />)}
      {pois.map(p => {
        if (p.type === 'BUILDING' || p.type === 'WALL') return <HighScienceSpire key={p.id} position={p.position} rotationY={p.rotationY} color={ARL_COLORS.arcane} seed={p.seed} />;
        return null;
      })}
      {resources.map(r => (
        <ResourceNode key={r.id} position={r.position} type={r.type.includes('GOLD') ? 'gold' : 'iron'} time={time} />
      ))}
      <ContactShadows resolution={1024} scale={150} blur={2.5} opacity={0.5} far={15} color="#000000" />
    </>
  );
}

const LocalPlayerController = ({ agent, vfx }: { agent: Agent; vfx: VFXEngine | null }) => {
  const { virtualInput, controlMode, targetPosition, setAgents, agents } = useStore();
  const moveSpeed = 1.0; 
  
  useFrame(() => {
    if (!agent || !agent.position) return;
    let moving = false;
    let dx = 0; let dz = 0;
    
    if ((controlMode === 'JOYSTICK' || controlMode === 'KEYBOARD') && (Math.abs(virtualInput.x) > 0.05 || Math.abs(virtualInput.z) > 0.05)) {
      dx = virtualInput.x * moveSpeed; 
      dz = virtualInput.z * moveSpeed; 
      moving = true;
    } 
    else if (targetPosition && controlMode === 'PUSH_TO_WALK') {
      const diffX = targetPosition.x - agent.position.x;
      const diffZ = targetPosition.z - agent.position.z;
      const dist = Math.hypot(diffX, diffZ);
      if (dist > 0.5) { 
        dx = (diffX / dist) * moveSpeed; 
        dz = (diffZ / dist) * moveSpeed; 
        moving = true; 
      }
    }

    if (moving) {
      setAgents(agents.map(a => a.id === agent.id ? { 
        ...a, 
        position: { ...a.position, x: a.position.x + dx, z: a.position.z + dz }, 
        state: AgentState.EXPLORING 
      } : a));
    } else if (agent.state !== AgentState.IDLE) {
      setAgents(agents.map(a => a.id === agent.id ? { ...a, state: AgentState.IDLE } : a));
    }
  });
  return <AgentModelWrapper agent={agent} isLocal vfx={vfx} />;
};

const World3D = ({ localPlayerId }: { localPlayerId?: string | null }) => {
  const shaderSettings = useStore(state => state.shaderSettings);
  const timeOfDay = useStore(state => state.timeOfDay);
  const [vfxEngine, setVfxEngine] = useState<VFXEngine | null>(null);

  const preset = (skyPresets as any)[timeOfDay] || skyPresets.day;

  return (
    <div className="w-full h-full bg-[#050508] touch-none">
      <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-axiom-cyan font-display animate-pulse uppercase tracking-[0.5em] text-xl">Materializing...</div>}>
        <Canvas gl={{ antialias: true }} shadows>
          <PerspectiveCamera makeDefault position={[100, 100, 100]} fov={45} far={5000} />
          <CameraController />
          
          {/* HIGH SCIENCE LIGHTING (12.0 TARGET) - LOCKED PER SPECIFICATION */}
          <ambientLight intensity={12.0} color={preset.light.sunColor} />
          <hemisphereLight intensity={2.0} groundColor={preset.light.groundColor} color={preset.light.sunColor} />
          
          <directionalLight 
            position={preset.light.sunDirection as [number, number, number]} 
            intensity={2.5} 
            color={preset.light.sunColor}
            castShadow
          />

          {shaderSettings.enableEnvironment && <Environment preset="city" />}
          <SceneController setVfx={setVfxEngine} />
          <WorldContent localPlayerId={localPlayerId} vfx={vfxEngine} />
        </Canvas>
      </Suspense>
    </div>
  );
}

const SceneController = ({ setVfx }: { setVfx: (vfx: VFXEngine) => void }) => {
  const { scene } = useThree();
  useEffect(() => {
    const engine = new VFXEngine(scene);
    setVfx(engine);
  }, [scene, setVfx]);

  return null;
};

export default World3D;
