import { vec2 } from "gl-matrix";
import { drawScatter } from "./scatter";
import { Context } from "./context";
import { updateSelectionWindow } from "./html_elements";
import { mod } from "./util";

function overlap(p1: vec2, p2: vec2) {
    return vec2.distance(p1, p2) < 15;
}

function main() {
    const canvas = document.getElementById("gl_canvas") as HTMLCanvasElement;
    const sidebar = document.getElementsByClassName("sidebar-container").item(0);
    const infoButton = document.getElementById("info-button") as HTMLButtonElement;
    const infoText = document.getElementById("info-text") as HTMLDivElement;
    infoButton.onclick = () => {
        infoButton.toggleAttribute("data-toggle")
    };
    const ctx = new Context(canvas);
    var didMove = false;
    canvas.onmousedown = ev => {
        didMove = false;
        if (ev.shiftKey || ev.ctrlKey || ev.button !== 0) return;
        const mousePos: vec2 = [ev.x, ev.y];
        const ind = ctx.virtualPoints.findIndex(p => overlap(ctx.viewFrame.toCanvasCoords(p.pos), mousePos));
        if (ind !== -1) {
            ctx.press.update(0, mousePos);
            selectPoint(ctx, ind);
            return;
        }
        ctx.press.update(-1, mousePos);
    };
    canvas.onmousemove = ev => {
        didMove = true;
        if (!ctx.press.isDown) return;
        const mousePos = [ev.x, ev.y];
        const canvasDelta = vec2.create();
        vec2.sub(canvasDelta, mousePos, ctx.press.mouse);
        const delta = ctx.viewFrame.fromCanvasDelta(canvasDelta);
        switch (ctx.press.element) {
            case -1:
                vec2.sub(ctx.viewFrame.corner0, ctx.viewFrame.corner0, delta);
                vec2.sub(ctx.viewFrame.corner1, ctx.viewFrame.corner1, delta);
                break;
            case 0:
                const newPos = [0, 0];
                vec2.add(newPos, ctx.virtualPoints[ctx.press.ind].pos, delta);
                ctx.movePoint(ctx.press.ind, newPos);
                break;
        }
        ctx.press.mouse = mousePos;
        ctx.drawScene();
    }
    canvas.onmouseleave = canvas.onmouseup = () => {
        ctx.press.isDown = false;
    };
    canvas.onclick = ev => {
        const mousePos = ctx.viewFrame.fromCanvasCoords([ev.x, ev.y]);
        if (ev.shiftKey) {
            ctx.points.push({
                pos: mousePos,
                type: "pole",
                relations: { }
            });
            selectPoint(ctx, ctx.points.length - 1);
        }
        else if (ev.ctrlKey) {
            ctx.points.push({
                pos: mousePos,
                type: "zero",
                relations: { }
            });
            selectPoint(ctx, ctx.points.length - 1);
        } else if (!didMove) {
            const ind = ctx.virtualPoints.findIndex(p => overlap(ctx.viewFrame.toCanvasCoords(p.pos), [ev.x, ev.y]));
            if (ind === -1) {
                ctx.selectionWindow.hidden = true;
                ctx.press.ind = -1;
            }
        }
        ctx.drawScene();
    };

    canvas.onwheel = (ev: WheelEvent) => {
        const mousePos = ctx.viewFrame.fromCanvasCoords([ev.x, ev.y]);
        const zoom = Math.pow(2, 10 * ev.deltaY / canvas.height);
        vec2.sub(ctx.viewFrame.corner0, ctx.viewFrame.corner0, mousePos);
        vec2.sub(ctx.viewFrame.corner1, ctx.viewFrame.corner1, mousePos);
        vec2.scale(ctx.viewFrame.corner0, ctx.viewFrame.corner0, zoom);
        vec2.scale(ctx.viewFrame.corner1, ctx.viewFrame.corner1, zoom);
        vec2.add(ctx.viewFrame.corner0, ctx.viewFrame.corner0, mousePos);
        vec2.add(ctx.viewFrame.corner1, ctx.viewFrame.corner1, mousePos);
        ctx.drawScene();
        ev.preventDefault();
    };

    window.addEventListener("keydown", ev => {
        if (ev.key == "Escape") {
            (document.activeElement as HTMLElement).blur();
        }
        switch (ev.key) {
            case "d":
                ctx.displayFunction = (ctx.displayFunction + 1) % 2; // 🐇🥚
                break;
            case "Delete":
                if (sidebar.contains(document.activeElement)) return;
                ctx.deleteSelectedPoint();
                break;
            case "j":
                ctx.jumpToSelectedPoint();
                break;
            case "Enter":
                if (sidebar.contains(document.activeElement)) return;
                if (ctx.virtualPoints.length == 0) return;
                const sign = ev.shiftKey ? -1 : 1;
                selectPoint(ctx, mod(ctx.press.ind + sign, ctx.virtualPoints.length));
                ctx.jumpToSelectedPoint();
                break;
            case "i":
                infoButton.toggleAttribute("data-toggle");
                return;
            default:
                return;
        }
        ev.preventDefault();
        ctx.drawScene();
    })

    window.onresize = () => {
        const previousAspect = canvas.height / canvas.width;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const newAspect = canvas.height / canvas.width;
        ctx.viewFrame.corner0[1] -= ctx.viewFrame.corner1[1];
        ctx.viewFrame.corner0[1] *= newAspect / previousAspect;
        ctx.viewFrame.corner0[1] += ctx.viewFrame.corner1[1];
        ctx.gl.viewport(0, 0, canvas.width, canvas.height);
        ctx.drawScene();
    };
    ctx.drawScene();
}
export function selectPoint(ctx: Context, index: number) {
    ctx.press.ind = index;
    ctx.updateVirtualPoints();
    updateSelectionWindow(ctx);
}

main();
