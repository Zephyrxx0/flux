"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"
import { useScenarioStore } from "@/hooks/useScenarioStore"
import { useMemo } from "react"

const SEVERITY_SCORES: Record<string, number> = { green: 1, amber: 2, red: 3, critical: 4 }
const SEVERITY_COLORS: Record<string, string> = {
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#ef4444",
  critical: "#991b1b",
}

function StadiumZoneRing({ thetaStart, color }: { thetaStart: number, color: string }) {
  const thetaLength = Math.PI / 2.2 // slight gap for sections
  
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <ringGeometry args={[2.2, 3.6, 32, 1, thetaStart, thetaLength]} />
      <meshStandardMaterial 
        color={color} 
        metalness={0.2} 
        roughness={0.6} 
        emissive={color} 
        emissiveIntensity={0.15} 
        side={THREE.DoubleSide} 
      />
    </mesh>
  )
}

function StadiumScene() {
  const latestOutput = useScenarioStore((state) => state.latestSimulationOutput)

  const zoneColors = useMemo(() => {
    const defaultColor = "#0f172a" // phase-12 default static ring color
    const colors: Record<string, string> = { north: defaultColor, south: defaultColor, east: defaultColor, west: defaultColor }
    
    if (!latestOutput) return colors

    const ranks: Record<string, number> = {}

    latestOutput.phaseZoneMatrix.forEach(row => {
      const score = SEVERITY_SCORES[row.occupancySeverity] || 0
      if (!ranks[row.zoneId] || score > ranks[row.zoneId]) {
        ranks[row.zoneId] = score
        colors[row.zoneId] = SEVERITY_COLORS[row.occupancySeverity as keyof typeof SEVERITY_COLORS] || defaultColor
      }
    })

    return colors
  }, [latestOutput])

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 8, 4]} intensity={1} castShadow />

      {/* 4 Distinct Stadium Zones replacing the static solid Ring */}
      <StadiumZoneRing thetaStart={-Math.PI / 4} color={zoneColors.north} />
      <StadiumZoneRing thetaStart={Math.PI / 4} color={zoneColors.east} />
      <StadiumZoneRing thetaStart={3 * Math.PI / 4} color={zoneColors.south} />
      <StadiumZoneRing thetaStart={5 * Math.PI / 4} color={zoneColors.west} />

      {/* Inner Central Structure (from phase-12) */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[1.8, 2.2, 0.55, 64]} />
        <meshStandardMaterial color="#1e293b" metalness={0.25} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.58, 0]} castShadow>
        <cylinderGeometry args={[1.15, 1.75, 0.26, 64]} />
        {/* The top-most cylinder had a static green in phase-12, kept identical here */}
        <meshStandardMaterial color="#22c55e" metalness={0.1} roughness={0.7} />
      </mesh>

      {/* Base Floor Component (from phase-12) */}
      <mesh position={[0, -0.25, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4.6, 96]} />
        <meshStandardMaterial color="#0b1220" metalness={0.12} roughness={0.86} />
      </mesh>

      {/* OrbitControls identical to phase-12 */}
      <OrbitControls enableDamping autoRotate autoRotateSpeed={0.4} />
    </>
  )
}

export default function ThreeStadium() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-black/40">
      <Canvas camera={{ position: [4, 3.4, 4.2], fov: 50 }} shadows>
        <StadiumScene />
      </Canvas>
    </div>
  )
}
