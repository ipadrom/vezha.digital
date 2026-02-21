import * as THREE from "three";

export default function parseOBJ(text: string): THREE.BufferGeometry {
    const positions: [number, number, number][] = []
    const vColors:   [number, number, number][] = []
    const normals:   [number, number, number][] = []
    const posArr: number[] = []
    const colArr: number[] = []
    const norArr: number[] = []

    for (const raw of text.split('\n')) {
        const line = raw.trim()
        if (line.startsWith('v ')) {
            const p = line.split(/\s+/)
            positions.push([+p[1], +p[2], +p[3]])
            vColors.push(p.length >= 7 ? [+p[4], +p[5], +p[6]] : [1, 1, 1])
        } else if (line.startsWith('vn ')) {
            const p = line.split(/\s+/)
            normals.push([+p[1], +p[2], +p[3]])
        } else if (line.startsWith('f ')) {
            const verts = line.split(/\s+/).slice(1)
            for (let k = 1; k < verts.length - 1; k++) {
                for (const v of [verts[0], verts[k], verts[k + 1]]) {
                    const idx = v.split('/')
                    const vi  = (parseInt(idx[0]) || 1) - 1
                    const ni  = idx[2] ? (parseInt(idx[2]) - 1) : -1
                    posArr.push(...(positions[vi] ?? [0, 0, 0]))
                    colArr.push(...(vColors[vi]   ?? [1, 1, 1]))
                    norArr.push(...(ni >= 0 ? (normals[ni] ?? [0, 1, 0]) : [0, 1, 0]))
                }
            }
        }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(posArr, 3))
    geo.setAttribute('color',    new THREE.Float32BufferAttribute(colArr, 3))
    geo.setAttribute('normal',   new THREE.Float32BufferAttribute(norArr, 3))

    geo.computeBoundingBox()
    const bbox = geo.boundingBox!
    const center = new THREE.Vector3()
    bbox.getCenter(center)
    const size = new THREE.Vector3()
    bbox.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    geo.translate(-center.x, -center.y, -center.z)

    // Нормализуем до ~0.75 единиц
    const s = 0.75 / maxDim
    const pos = geo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) {
        pos.setXYZ(i, pos.getX(i) * s, pos.getY(i) * s, pos.getZ(i) * s)
    }
    pos.needsUpdate = true
    geo.computeBoundingBox()
    return geo
}