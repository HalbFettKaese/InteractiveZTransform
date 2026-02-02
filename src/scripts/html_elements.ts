import { vec2 } from "gl-matrix";
import { Context } from "./context";
import { RelationName } from "./point";

type SelectionWindowElement = ["number", "real" | "imag" | "radius" | "angle"] | ["relation", RelationName] | ["button", "delete" | "jump"];

type ItemsValue<Items extends [any, any], Key extends Items[0], S extends Items = Items> = S extends [Key, any] ? S[1] : never

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
    ctx.selectionWindow.querySelectorAll("[data-selection]").forEach((input: HTMLInputElement) => {
        const [type, name] = input.getAttribute("data-selection").split(":").reverse() as SelectionWindowElement;
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
    ctx.selectionWindow.querySelectorAll("[data-selection]").forEach((input: HTMLInputElement) => {
        const [type, name] = input.getAttribute("data-selection").split(":").reverse() as SelectionWindowElement;
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

        document.querySelectorAll("#settings_window [data-selection]").forEach((input: HTMLInputElement) => {
            const [type, name] = input.getAttribute("data-selection").split(":").reverse() as SelectionWindowElement;
            if (type == "relation") {
                input.onclick = () => {
                    this.defaultRelations[name] = input.checked;
                    ctx.recoverIndex();
                    ctx.drawScene();
                };
                this.defaultRelations[name] = input.checked;
            }
        });
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

