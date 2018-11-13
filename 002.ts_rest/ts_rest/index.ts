import Circle from './circle'
import Rectangle from './rectangle'
import Square from './Square'
import Initer from './initGlobal'

Initer.init()

let pf = function(data: string, n: number, callback: Function) {
    console.log(`begin run ${data}`)
    setTimeout(() => {
        console.log(`end run ${data}`)
        callback(null, data)
    }, n)
}
let p = Promise.promisify(pf);

(async () => {
    // let ps = Array<any>()
    // ps.push(p('1111', 2000))
    // ps.push(p('2222', 1000))
    // ps.push(p('3333', 3000))
    // // await Promise.all(ps)
    let p1 = p('1111', 3000)
    let p2 = p('2222', 2000)
    let p3 = p('3333', 1000)
    let p4 = p('4444', 4000)
    let r1 = await p1
    console.log(r1)
    let r2 = await p2
    console.log(r2)
    let r3 = await p3
    console.log(r3)
    let r4 = await p4
    console.log(r4)
})()

// let printData = function(err: any, data: string): void {
//     if (err)
//         console.log(err)
//     else
//         console.log(data)
// }
// let doAjax = function (data: string, callback: Function): void {
//     callback(null, data)
// }
// doAjax('hello', printData)

// let arr = [2, 4, 6, 2, 7, 8, 9, 3]
// console.log(JSON.stringify(arr.reduce((a, b) => {
//     return a + b
// })))

// console.log(JSON.stringify(arr.splice(0, 3)))
// console.log(JSON.stringify(arr.splice(0, 3)))
// console.log(JSON.stringify(arr.splice(0, 3)))

// function max<T>(a: T, b: T): T {
//     return a > b ? a : b
// }
// console.log(max('abc', 'bcd'))

// let shapes = Array<any>()
// shapes.push(new Circle(2))
// shapes.push(new Rectangle(5, 4))
// shapes.push(new Square(3))
// shapes.forEach((element) => {
//     console.log(`shape name: ${element.getName()}; shape area: ${element.area()}`)
// })

// let circle = new Circle(2)
// console.log(`shape name: ${circle.getName()}; shape area: ${circle.area()}`)

// let rect = new Rectangle(5, 4)
// console.log(`shape name: ${rect.getName()}; shape area: ${rect.area()}`)

// let square = new Square(3)
// console.log(`shape name: ${square.getName()}; shape area: ${square.area()}`)

// let str: string = 'hello world.'
// str = 'I am fine!'
// console.log(str)