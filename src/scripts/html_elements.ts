import { vec2 } from "gl-matrix";
import { Context, DisplayFunction } from "./context";
import { RelationName } from "./point";

type SelectionWindowElement = 
    | ["number", "real" | "imag" | "radius" | "angle"]
    | ["relation", RelationName]
    | ["button", "delete" | "jump"];

type ItemsValue<Items extends [any, any], Key extends Items[0], S extends Items = Items> = S extends [Key, any] ? S[1] : never

function iterateElements(parent: HTMLElement, op: (el: HTMLInputElement, [type, name]: SelectionWindowElement) => void) {
    parent.querySelectorAll("[data-selection]").forEach(
        (el: HTMLInputElement) => op(
            el,
            el.getAttribute("data-selection").split(":").reverse() as SelectionWindowElement
        )
    );
}

export function updateSelectionWindow(ctx: Context) {
    const index = ctx.press.ind;
    if (index == -1) {
        ctx.selectionWindow.hidden = true;
        return;
    }
    const point = ctx.virtualPoints[index];
    const numberDisplays: Record<ItemsValue<SelectionWindowElement, "number">, number> = {
        real: point.pos[0],
        imag: point.pos[1],
        radius: vec2.length(point.pos),
        angle: (180 / Math.PI * Math.atan2(point.pos[1], point.pos[0]))
    };
    iterateElements(ctx.selectionWindow, (input, [type, name]) => {
        if (type == "number") {
            if (document.activeElement !== input)
                input.value = numberDisplays[name].toString();
        } else if (type == "relation") {
            const rootPoint = "fromVirtual" in point ? ctx.points[point.index] : point;
            if (name in rootPoint.relations) {
                input.indeterminate = false;
                input.checked = rootPoint.relations[name];
            } else {
                input.indeterminate = true;
            }
        } else {
            (type satisfies "button");
        }
    });
    ctx.selectionWindow.hidden = false;
}

export function initSelectionWindow(ctx: Context) {
    const elements: Partial<Record<SelectionWindowElement[1], HTMLInputElement>> = {};
    function updatePoint(newPos: vec2) {
        ctx.movePoint(ctx.press.ind, newPos);
        ctx.drawScene();
    }
    const updateFromCartesian = () => {
        const real = Number.parseFloat(elements.real.value);
        const imag = Number.parseFloat(elements.imag.value);
        if (Number.isNaN(real) || Number.isNaN(imag)) return;
        updatePoint([real, imag]);
    }
    const updateFromPolar = () => {
        const radius = Number.parseFloat(elements.radius.value);
        var angle = Number.parseFloat(elements.angle.value);
        if (Number.isNaN(radius) || Number.isNaN(angle)) return;
        angle = Math.PI * angle / 180;
        const newPos = [Math.cos(angle), Math.sin(angle)];
        vec2.scale(newPos, newPos, radius);
        updatePoint(newPos);
    }
    const updateRelation = (relation: RelationName) => (ev: Event) => {
        const input = ev.target as HTMLInputElement;
        const point = ctx.virtualPoints[ctx.press.ind];
        const rootPoint = ctx.points["fromVirtual" in point ? point.index : ctx.press.ind];
        var state: 0 | 1 | 2;
        if (relation in rootPoint.relations) {
            state = rootPoint.relations[relation] ? 1 : 0;
        } else {
            state = 2;
        }
        state = (state + 1) % 3;
        if (state == 2) {
            input.indeterminate = true;
            delete rootPoint.relations[relation];
        } else if (state == 1) {
            input.checked = rootPoint.relations[relation] = true;
        } else {
            input.checked = rootPoint.relations[relation] = false;
        }
        if ("fromVirtual" in point) {
            if (!ctx.getRelation(rootPoint, relation) && point.history.indexOf(relation) !== -1) {
                ctx.press.ind = -1;
                ctx.selectionWindow.hidden = true;
            } else {
                ctx.recoverIndex();
            }
        }
        ctx.drawScene();
    }
    ctx.selectionWindow = document.getElementById("selected_point_window") as HTMLElement;

    iterateElements(ctx.selectionWindow, (input, [type, name]) => {
        elements[name] = input;
        if (type == "number") {
            if (name == "real" || name == "imag") input.oninput = updateFromCartesian;
            else if (name == "radius" || name == "angle") input.oninput = updateFromPolar;
            else (name satisfies never);
        } else if (type == "relation") {
            input.onclick = updateRelation(name);
        } else if (type == "button") {
            const button = input as HTMLButtonElement;
            if (name == "delete") button.onclick = () => ctx.deleteSelectedPoint();
            else if (name == "jump") button.onclick = () => ctx.jumpToSelectedPoint();
            else (name satisfies never);
        } else (type satisfies never);
    });
}


export class SettingsWindow {
    factorSlider: HTMLInputElement;
    factorText: HTMLInputElement;
    factorNorm: HTMLInputElement;
    defaultRelations: Partial<Record<RelationName, boolean>> = {};
    ctx: Context;
    lastFactor: number;

    constructor(ctx: Context) {
        this.ctx = ctx;
        this.lastFactor = ctx.factor;
        this.factorSlider = document.getElementById("scale_slider") as HTMLInputElement;
        this.factorText = document.getElementById("scale_input") as HTMLInputElement;
        this.factorNorm = document.getElementById("scale_norm") as HTMLInputElement;
        
        this.factorSlider.addEventListener("input", () => {
            this.factorNorm.checked = false;
            ctx.factor = Math.pow(2, this.factorSlider.valueAsNumber);
        });
        this.factorText.onbeforeinput = (ev) => {
            const hasDot = /\./.test((ev.target as HTMLInputElement).value);
            var isValid = ev.data === null || (!hasDot && ev.data == ".") || /\d/.test(ev.data);
            if (!isValid) ev.preventDefault();
        };
        this.factorText.oninput = (ev) => {
            const valueAsNumber = Number.parseFloat(this.factorText.value);
            if (Number.isNaN(valueAsNumber)) return;
            if (ev !== null) this.factorNorm.checked = false;
            ctx.factor = valueAsNumber;
        };
        this.factorNorm.onclick = () => {
            ctx.drawScene();
        }
        this.factorText.oninput(null);
        
        iterateElements(
            document.getElementById("settings_window"),
            (input, [type, name]) => {
                if (type == "relation") {
                    input.onclick = () => {
                        this.defaultRelations[name] = input.checked;
                        ctx.recoverIndex();
                        ctx.drawScene();
                    };
                    this.defaultRelations[name] = input.checked;
                }
            }
        );
    }

    update() {
        if (this.lastFactor == this.ctx.factor) return;
        if (document.activeElement !== this.factorSlider) {
            this.factorSlider.value = this.ctx.factor === 0 ? this.factorSlider.min : Math.log2(this.ctx.factor).toString();
        }
        if (document.activeElement !== this.factorText) {
            this.factorText.value = this.ctx.factor.toString();
        }
        this.lastFactor = this.ctx.factor;
    }
};

export class InfoMenu {
    infoButton: HTMLButtonElement;
    infoText: HTMLElement;
    legendButton: HTMLButtonElement;
    legendBox: HTMLElement;
    legendCanvas: HTMLCanvasElement;
    legendCanvasCtx: CanvasRenderingContext2D;

    state: "none" | "info" | "colorLegend" = "none";
    
    constructor() {
        this.infoButton = document.getElementById("info-button") as HTMLButtonElement;
        this.infoText = document.getElementById("info-text");
        this.legendButton = document.getElementById("color-legend-button") as HTMLButtonElement;
        this.legendBox = document.getElementById("color-legend-box");
        this.legendCanvas = document.getElementById("color-legend-canvas") as HTMLCanvasElement;
        this.infoButton.onclick = () => this.toggleState("info");
        this.legendButton.onclick = () => this.toggleState("colorLegend");

        this.legendCanvasCtx = this.legendCanvas.getContext("2d");
    }

    toggleState(state: Exclude<InfoMenu["state"], "none">) {
        this.infoText.hidden = true;
        this.legendBox.hidden = true;
        if (this.state == state) {
            this.state = "none";
            return;
        }
        this.state = state;
        switch (state) {
            case "info":
                this.infoText.hidden = false;
                break;
            case "colorLegend":
                this.legendBox.hidden = false;
                break;
            default:
                state satisfies never;
        }
    }
    updateDisplayFunction(displayFunction: DisplayFunction) {
        const m = 10;
        const thickness = 50;
        const w = this.legendCanvas.width;
        const h = this.legendCanvas.height;
        const ctx = this.legendCanvasCtx;
        ctx.clearRect(0, 0, w, h);
        const grad = ctx.createLinearGradient(0, h-m, 0, m);
        if (displayFunction === 0) {
            grad.addColorStop(0.0, "#0000ff");
            grad.addColorStop(0.5, "#ffffff");
            grad.addColorStop(1.0, "#ff0000");
        } else if (displayFunction === 1 || displayFunction > 1) {
            grad.addColorStop(0  , "#ff0000");
            grad.addColorStop(1/6, "#ffff00");
            grad.addColorStop(2/6, "#00ff00");
            grad.addColorStop(3/6, "#00ffff");
            grad.addColorStop(4/6, "#0000ff");
            grad.addColorStop(5/6, "#ff00ff");
            grad.addColorStop(1  , "#ff0000");
        } else displayFunction satisfies never;
        ctx.fillStyle = grad;
        ctx.fillRect(0, m, thickness, h-2*m);

        
        const points: [number, string][] = []; // [pos, label]
        if (displayFunction === 0) {
            for (let i = 0; i <= 10; i++) {
                const y = i/10;
                const L = Math.sqrt(y);
                points.push([y * 0.5, L.toFixed(2)]);
            }
            for (let i = 1; i <= 10; i++) {
                const y = i/10;
                const L = 1/Math.sqrt(1-y);
                points.push([0.5 + 0.5 * y, L.toFixed(2)]);
            }
        } else if (displayFunction === 1 || displayFunction > 1) {
            points.push([0.0, "-π"])
            points.push([1/12, "-5/6 π"])
            points.push([1/6, "-2/3 π"])
            points.push([0.25, "-1/2 π"])
            points.push([1/3, "-1/3 π"])
            points.push([5/12, "-1/6 π"])
            points.push([0.5, "0"])
            points.push([7/12, "+1/6 π"])
            points.push([2/3, "+1/3 π"])
            points.push([0.75, "+1/2 π"])
            points.push([5/6, "+2/3 π"])
            points.push([11/12, "+5/6 π"])
            points.push([1.0, "+π"])
        } else displayFunction satisfies never;

        ctx.lineWidth = 1;
        ctx.strokeStyle = "#000000";
        ctx.fillStyle = "black";
        ctx.textBaseline = "middle";
        for (var [pos, label] of points) {
            // pos goes from 0 to 1, remap this from bottom to top pixel positions.
            const y = Math.floor(h - m - 0.5 + (2*m - h + 1) * pos) + 0.5;
            ctx.beginPath();
            ctx.moveTo(thickness, y);
            ctx.lineTo(thickness + 5, y);
            ctx.stroke();
            ctx.fillText(label, thickness + 8, y);
        }
    }
}