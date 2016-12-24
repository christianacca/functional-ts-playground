interface BoxCtor<T> {
    (x: T): Box<T>
}

interface Box<T> {
    map<TResult>(f: (x: T) => TResult): Box<TResult>,
    fold<TResult>(f: (x: T) => TResult): TResult
}

// notes:
// 1. merging the `Box` function with a `Box` interface

function Box<T>(x: T): Box<T> {
    return {
        map: <TResult>(f: (x: T) => TResult) => Box(f(x)),
        fold: <TResult>(f: (x: T) => TResult) => f(x)
    };
}


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
function createAndRun(Box: BoxCtor<number>) {
    Box(112)
        .map(n => String.fromCharCode(n))
        .map(s => s.toUpperCase())
        .fold(console.log);
}
createAndRun(Box);


export { };