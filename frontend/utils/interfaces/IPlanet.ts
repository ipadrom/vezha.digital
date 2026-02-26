import * as THREE from "three";

export interface IPlanet {
    id: string
    label: string
    mesh: THREE.Group
    obj: THREE.Object3D | null
    orbitPlane: THREE.Group
    angle: number
    speed: number
    r: number
    rotSpeed: number
    selfAngle: number
}