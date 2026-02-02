import vsSourceScreenquad from "/shaders/screenquad.vert?raw";
import fsSourceZTransform from "/shaders/ztransform.frag?raw";
import fsSourceScatter from "/shaders/scatter.frag?raw";
import vsSourceScatter from "/shaders/scatter.vert?raw";
import imgScatterGlow from "/assets/scatter_glow.png";
import imgScatterX from "/assets/scatter_x.png";
import imgScatterY from "/assets/scatter_o.png";
import { vec2 } from "gl-matrix";
import { loadShaderProgram, ProgramInfo } from "./shader_program";
import { calculateNormalizationFactor, objectFromFunction } from "./util";
import { createVirtualPoint, VirtualPoint, Point, RelationName, Relations } from "./point";
import { initSelectionWindow, SettingsWindow, updateSelectionWindow } from "./html_elements";
import { drawScatter } from "./scatter";
import { drawZTransform } from "./ztransform";

const zTransformAttributes = [] as const;
const zTransformUniforms = ["uZeros", "uPoles", "uNumZeros", "uNumPoles", "uFactor", "uViewCorner0", "uViewCorner1", "uDisplayFunc"] as const;
const scatterAttributes = ["vPos"] as const;
const scatterUniforms = ["uSampler", "uViewCorner0", "uViewCorner1", "uRadius"] as const;

const bufferNames = ["points"] as const;

export class Context {
    canvas: HTMLCanvasElement;
    gl: WebGL2RenderingContext = null;
    viewFrame: ViewFrame;
    points: Point[] = [];
    virtualPoints: (Point | VirtualPoint)[] = [];
    shaderPrograms: {
        zTransform: ProgramInfo<typeof zTransformAttributes[number], typeof zTransformUniforms[number]>,
        scatter: ProgramInfo<typeof scatterAttributes[number], typeof scatterUniforms[number]>
    };
    buffers: Record<typeof bufferNames[number], WebGLBuffer>;
    displayFunction: number = 0;
    press: Press;
    selectionWindow: HTMLElement;
    settingsWindow: SettingsWindow = null;
    #drawingScene = false;
    #factor: number = 1;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        canvas["ctx"] = this;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.press = new Press(canvas);
        initSelectionWindow(this);
        this.settingsWindow = new SettingsWindow(this);

        const gl = canvas.getContext("webgl2", {
            alpha: false,
            premultipliedAlpha: false
        });
        
        if (gl === null) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.");
            return;
        }
        this.gl = gl;
        this.viewFrame = new ViewFrame(canvas);
        this.shaderPrograms = {
            zTransform: loadShaderProgram(gl, vsSourceScreenquad, fsSourceZTransform, zTransformAttributes, zTransformUniforms),
            scatter: loadShaderProgram(gl, vsSourceScatter, fsSourceScatter, scatterAttributes, scatterUniforms)
        };
        this.buffers = objectFromFunction(bufferNames, () => gl.createBuffer());
    }

    get factor() {
        return this.#factor;
    }

    set factor(factor: number) {
        this.#factor = factor;
        if (this.settingsWindow !== null) this.settingsWindow.update();
        this.drawScene();
    }

    updateVirtualPoints() {
        this.virtualPoints = this.points.map((point, index) => ({...point}) as Point);
        const max = this.virtualPoints.length * 4;
        for (const relationName of Object.keys(Relations) as RelationName[]) {
            for (var i = 0; i < this.virtualPoints.length; i++) {
                if (this.getRelation(this.virtualPoints[i], relationName)) {
                    this.virtualPoints.push(createVirtualPoint(i, this.virtualPoints[i], relationName));
                }
            }
        }
    }

    movePoint(index: number, newPos: vec2) {
        const point = this.virtualPoints[index];
        if ("fromVirtual" in point) {
            newPos = point.fromVirtual(newPos);
            vec2.copy(this.points[point.index].pos, newPos);
        } else {
            vec2.copy(this.points[index].pos, newPos);
        }
    }

    deleteSelectedPoint() {
        if (this.press.ind === -1) return;
        const point = this.virtualPoints[this.press.ind];
        const index = "fromVirtual" in point ? point.index : this.press.ind;
        this.points.splice(index, 1);
        this.press.ind = -1;
        this.selectionWindow.hidden = true;
        this.drawScene();
    }

    
    jumpToSelectedPoint() {
        if (this.press.ind === -1) return;
        const point = this.virtualPoints[this.press.ind];
        const mid = vec2.create();
        vec2.add(mid, this.viewFrame.corner0, this.viewFrame.corner1);
        vec2.scale(mid, mid, 0.5);
        vec2.sub(mid, point.pos, mid);
        vec2.add(this.viewFrame.corner0, this.viewFrame.corner0, mid);
        vec2.add(this.viewFrame.corner1, this.viewFrame.corner1, mid);
        this.drawScene();
    }
    
    drawScene() {
        if (this.#drawingScene || this.gl === null) return;
        this.#drawingScene = true;
        this.updateVirtualPoints();
        if (this.settingsWindow.factorNorm.checked) {
            this.factor = calculateNormalizationFactor(this.virtualPoints);
        }
        updateSelectionWindow(this);
        const gl = this.gl;
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
        gl.clear(gl.COLOR_BUFFER_BIT);
    
        drawZTransform(this);
    
        drawScatter(this, (_, index) => index === this.press.ind, imgScatterGlow, 20);
        drawScatter(this, point => point.type == "pole", imgScatterX);
        drawScatter(this, point => point.type == "zero", imgScatterY);
        this.#drawingScene = false;
        gl.flush();
    }

    getRelation(point: Point, relation: RelationName) {
        return (relation in point.relations ? point.relations : this.settingsWindow.defaultRelations)[relation];
    }

    recoverIndex() {
        if (this.press.ind == -1) return;
        const prevInd = this.press.ind;
        const point = this.virtualPoints[prevInd];
        this.updateVirtualPoints();
        if ("fromVirtual" in point) {
            this.press.ind = this.virtualPoints.findIndex(newPoint => {
                return "fromVirtual" in newPoint && newPoint.index === point.index && JSON.stringify(newPoint.history) == JSON.stringify(point.history);
            });
            if (this.press.ind === -1) {
                this.selectionWindow.hidden = true;
            }
        }
    }
}

class Press {
    isDown = false;
    ind = -1;
    element = -1;
    mouse = vec2.create();
    canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }

    update(element: number, mousePos: vec2) {
        this.isDown = true;
        this.element = element;
        this.mouse = mousePos;
    }
};

class ViewFrame {
    canvas: HTMLCanvasElement;
    corner0: vec2;
    corner1: vec2;

    constructor(canvas: HTMLCanvasElement, corner0?: vec2, corner1?: vec2) {
        this.canvas = canvas;
        if (!corner0 || !corner1) {
            var w = canvas.width
            var h = canvas.height;
            var m = Math.min(w, h) / 2 / 1.2;
            w /= m;
            h /= m;
            this.corner0 = [-w/2, -h/2];
            this.corner1 = [ w/2,  h/2];
        } else {
            this.corner0 = corner0;
            this.corner1 = corner1;
        }
    }

    fromCanvasCoords(point: vec2): vec2 {
        const result = [point[0], this.canvas.height - point[1]];
        vec2.div(result, result, [this.canvas.width, this.canvas.height]);
        const temp: vec2 = [0, 0];
        vec2.sub(temp, this.corner1, this.corner0);
        vec2.mul(result, result, temp);
        vec2.add(result, result, this.corner0);
        return result;
    }

    fromCanvasDelta(canvasDelta: vec2): vec2 {
        const result = [canvasDelta[0], -canvasDelta[1]];
        vec2.div(result, result, [this.canvas.width, this.canvas.height]);
        const temp = vec2.create();
        vec2.sub(temp, this.corner1, this.corner0);
        vec2.mul(result, result, temp);
        return result;
    }

    toCanvasCoords(point: vec2): vec2 {
        // (point - c0) / (c1 - c0)
        const result = vec2.create();
        vec2.sub(result, point, this.corner0)
        const temp = vec2.create();
        vec2.sub(temp, this.corner1, this.corner0);
        vec2.div(result, result, temp);
        vec2.mul(result, [result[0], 1 - result[1]], [this.canvas.width, this.canvas.height]);
        return result;
    }
}
