import { vec2 } from "gl-matrix";

type Relation = {
    flipType: boolean,
    toVirtual: (pos: vec2) => vec2,
    fromVirtual?: (pos: vec2) => vec2
};

export const Relations = {
    allPass: {
        flipType: true,
        toVirtual: pos => {
            const result = [0, 0];
            vec2.copy(result, pos);
            vec2.scale(result, result, 1/vec2.dot(result, result));
            return result as vec2;
        }
    } as Relation,
    complement: {
        flipType: false,
        toVirtual: ([x, y]: vec2) => [x, -y] as vec2
    } as Relation
} as const;

export type RelationName = keyof typeof Relations;

export interface Point {
    pos: vec2,
    type: "zero" | "pole",
    relations: Partial<Record<RelationName, boolean>>
};

export type VirtualPoint = Point & {
    index: number,
    fromVirtual: Relation["fromVirtual"],
    history: RelationName[]
};

export function createVirtualPoint(index: number, point: Point | VirtualPoint, relationName: RelationName): VirtualPoint {
    var {flipType, toVirtual, fromVirtual} = Relations[relationName];
    const type = flipType ? (point.type == "zero" ? "pole" : "zero") : point.type;
    if (fromVirtual === undefined) fromVirtual = toVirtual;
    var history = [];
    if ("fromVirtual" in point) {
        const oldFromVirtual = fromVirtual;
        fromVirtual = pos => point.fromVirtual(oldFromVirtual(pos));
        index = point.index;
        history = point.history;
    }
    const relations = {...point.relations};
    relations[relationName] = false;
    return {
        pos: toVirtual(point.pos),
        type,
        index,
        fromVirtual,
        relations,
        history: [...history, relationName]
    }
}
