import { vec2 } from "gl-matrix";
import { Point } from "./point";

export type Predicate<T extends any[]> = (...value: T) => boolean;

export function objectFromFunction<K extends string, V>(keys: readonly K[], func: (key: K) => V): Record<K, V> {
    return Object.fromEntries(keys.map(key => [key, func(key)])) as Record<K, V>;
}

export function mod(x: number, m: number): number {
    return ((x % m) + m) % m;
}

export function calculateNormalizationFactor<T extends Point>(points: T[]): number {
    const z: vec2 = [0, 1];
    const numerator: vec2 = [1, 0];
    const denominator: vec2 = [1, 0];
    const currentFactor = vec2.create();
    points.forEach(point => {
        const out = point.type == "zero" ? numerator : denominator;
        vec2.sub(currentFactor, z, point.pos);
        cmul(out, out, currentFactor);
    });
    const result = vec2.create();
    cdiv(result, numerator, denominator);
    return 1/vec2.length(result);
}

function cmul(out: vec2, [ar, ai]: vec2, [br, bi]: vec2) {
    vec2.copy(out, [ar*br - ai*bi, ai*br + ar*bi]);
}

function cdiv(out: vec2, a: vec2, b: vec2) {
    cmul(out, a, [b[0], -b[1]]);
    vec2.scale(out, out, 1/vec2.dot(b, b));
}