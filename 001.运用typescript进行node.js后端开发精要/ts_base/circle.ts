import IShape from './ishape'

export default class Circle implements IShape {
    private r: number
    private name: string
    constructor(r: number) {
        this.r = r
        this.name = 'Circle'
    }
    getName(): string {
        return this.name
    }
    area(): number {
        return Math.pow(this.r, 2) * PI
    }
}