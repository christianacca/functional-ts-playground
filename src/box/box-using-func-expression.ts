interface BoxCtor {
    <T>(x: T): Box<T>
}

interface BoxTypedCtor<T> {
    (x: T): Box<T>
}

interface Box<T> {
    map<TResult>(f: (x: T) => TResult): Box<TResult>,
    fold<TResult>(f: (x: T) => TResult): TResult
}

// notes:
// 1. merging the `Box` constant with a `Box` interface
// 2. `Box` needs the `BoxCtor` annotation, without it the `map` method has a return type of `any`
// 3. Contrast this with `box-using-func-declaration` which does not need a `BoxCtor` annotation
const Box: BoxCtor = <T>(x: T) => ({
    map: <TResult>(f: (x: T) => TResult) => Box(f(x)),
    fold: <TResult>(f: (x: T) => TResult) => f(x)
});


// ------------------
// Example usage
// ------------------

// 1. 
const result = Box(110)
    .map(n => String.fromCharCode(n))
    .map(s => s.toUpperCase())
    .fold(s => s);
console.log(result);


// 2.
function run(pipeline: Box<number[]>) {
    const result = pipeline
        .map(n => String.fromCharCode(...n))
        .map(s => s.toUpperCase())
        .fold(s => s);
    console.log(result);
}
run(Box(Array.of(110, 111)));


// 3.
function createAndRun(Box: BoxTypedCtor<number>) {
    Box(112)
        .map(n => String.fromCharCode(n))
        .map(s => s.toUpperCase())
        .fold(console.log);
}
createAndRun(Box);


export { };