// Canvas Utilities
export class CanvasManager {
    constructor() {
        this.canvases = new Map();
    }

    addCanvas(id, element) {
        this.canvases.set(id, {
            element,
            ctx: element.getContext('2d'),
            width: element.width,
            height: element.height
        });
    }

    getCanvas(id) {
        return this.canvases.get(id);
    }

    setupDimensions(size = 400) {
        this.canvases.forEach(canvas => {
            canvas.element.width = size;
            canvas.element.height = size;
            canvas.width = size;
            canvas.height = size;
        });
    }

    clearCanvas(id) {
        const canvas = this.getCanvas(id);
        if (canvas) {
            canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    setCanvasStyle(id, style) {
        const canvas = this.getCanvas(id);
        if (canvas) {
            Object.assign(canvas.ctx, style);
        }
    }
}
