import { Vector } from "./Vector";


export class Viewbox {
    public position: Vector;

    public dimensions: Vector;

    constructor(position: Vector, dimensions: Vector) {
        this.position = position;
        this.dimensions = dimensions;
    }

    public toString(): string {
        return this.position.x + ", " + this.position.y + ", " + this.dimensions.x + ", " + this.dimensions.y;
    }
}