export default class CircleQueue {
    private head: number
    private list: Array<string>
    private data: object
    private MAX: number
    constructor(max) {
        this.MAX = max
        this.head = 0
        this.list = new Array<string>(max)
        this.data = Object.create(null)
    }
    find(isbn: string) {
        return this.data[isbn]
    }
    push(element: object) {
        let isbn = element['isbn']
        if (isbn && this.data[isbn] === undefined) {
            let old = this.list[this.head]
            this.list[this.head] = isbn
            this.data[isbn] = element
            if (old !== undefined) {
                delete this.data[old]
            }
            if (++this.head >= this.MAX) {
                this.head = 0
                return this.data
            } else {
                return null
            }
        }
    }
}