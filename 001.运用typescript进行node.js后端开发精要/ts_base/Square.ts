import Rectangle from './rectangle'

export default class Square extends Rectangle {
    constructor(a: number) {
        super(a, a, 'Square')
    }
}