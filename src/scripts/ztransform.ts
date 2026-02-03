import { Context } from "./context";


export function drawZTransform(ctx: Context) {
    const gl = ctx.gl;
    const programInfo = ctx.shaderPrograms.zTransform;

    gl.useProgram(programInfo.program);
    const zeros = ctx.virtualPoints.filter(point => point.type == "zero").map(point => point.pos);
    const poles = ctx.virtualPoints.filter(point => point.type == "pole").map(point => point.pos);
    if (zeros.length > 0)
        gl.uniform2fv(programInfo.uniformLocations.uZeros, zeros.flat() as Float32List);
    if (poles.length > 0)
        gl.uniform2fv(programInfo.uniformLocations.uPoles, poles.flat() as Float32List);
    gl.uniform1i(programInfo.uniformLocations.uNumZeros, zeros.length);
    gl.uniform1i(programInfo.uniformLocations.uNumPoles, poles.length);
    gl.uniform1f(programInfo.uniformLocations.uFactor, ctx.factor);
    gl.uniform2fv(programInfo.uniformLocations.uViewCorner0, ctx.viewFrame.corner0 as [number, number]);
    gl.uniform2fv(programInfo.uniformLocations.uViewCorner1, ctx.viewFrame.corner1 as [number, number]);
    gl.uniform1i(programInfo.uniformLocations.uDisplayFunc, ctx.displayFunction);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}