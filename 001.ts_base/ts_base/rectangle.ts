import IShape from './ishape'

export default class Rectangle implements IShape {
    private a: number
    private b: number
    private name: string
    constructor(a: number, b: number, name?: string) {
        this.a = a
        this.b = b
        if (name === undefined)
            this.name = 'Rectangle'
        else
            this.name = name
    }
    getName(): string {
        return this.name
    }
    area(): number {
        return this.a * this.b
    }
}