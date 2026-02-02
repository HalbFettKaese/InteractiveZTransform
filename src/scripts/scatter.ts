import { Context } from "./context";
import { loadTexture } from "./load_texture";
import { Point, VirtualPoint } from "./point";
import { Predicate } from "./util";

export function drawScatter(ctx: Context, predicate: Predicate<[Point | VirtualPoint, number]>, textureUrl: string, radius?: number) {
    const gl = ctx.gl;
    const texture = loadTexture(ctx, textureUrl);
    const points = ctx.virtualPoints.filter(predicate).map(point => point.pos);

    if (points.length == 0) {
        return;
    }
    if (radius === undefined) {
        radius = 10;
    }
    const programInfo = ctx.shaderPrograms.scatter;
    gl.useProgram(programInfo.program);

    gl.bindBuffer(gl.ARRAY_BUFFER, ctx.buffers.points);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points.flat() as number[]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(programInfo.attribLocations.vPos);
    gl.vertexAttribPointer(programInfo.attribLocations.vPos, 2, gl.FLOAT, false, 0, 0);

    gl.uniform2fv(programInfo.uniformLocations.uViewCorner0, ctx.viewFrame.corner0 as Float32List);
    gl.uniform2fv(programInfo.uniformLocations.uViewCorner1, ctx.viewFrame.corner1 as Float32List);

    gl.uniform1f(programInfo.uniformLocations.uRadius, radius);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    gl.drawArrays(gl.POINTS, 0, points.length);
}
