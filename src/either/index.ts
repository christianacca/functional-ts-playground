interface Func<T, TResult> {
    (x: T): TResult
}

export interface Either<L, R> {
    chain<TResult>(f: (x: R) => Either<L, TResult>): Either<L, TResult>;
    map<TResult>(f: (x: R) => TResult): Either<L, TResult>;
    fold<TLeftResult, TRightResult>(left: (x: L) => TLeftResult, right: (x: R) => TRightResult): TLeftResult | TRightResult;
}

function Right<TOther, T>(x: T): Either<TOther, T> {
    return {
        chain: <TResult>(f: (x: T) => Either<TOther, TResult>) => f(x),
        map: <TResult>(f: (x: T) => TResult) => Right<TOther, TResult>(f(x)),
        fold: <TLeft, TRight>(left: (x: TOther) => TLeft, right: (x: T) => TRight) => right(x)
    };
}

function Left<T, TOther>(x: T): Either<T, TOther> {
    return {
        chain: <TResult>(f: (x: TOther) => Either<T, TResult>) => Left(x),
        map: <TResult>(f: (x: TOther) => TResult) => Left<T, TResult>(x),
        fold: <TLeft, TRight>(left: (x: T) => TLeft, right: (x: TOther) => TRight) => left(x)
    };
}


// ------------------
// Example usage
// ------------------

interface Configs {
    port: number;
}

const fs = {
    readFileSync: (name: string) => {
        if (name === 'config.json') {
            return JSON.stringify({ port: 8888 })
        } else {
            throw ('missing file!')
        }
    }
}

function tryCatch<T>(sector: () => T) {
    try {
        return Right<Error, T>(sector());
    } catch (e) {
        return Left<Error, T>(e);
    }
}

function run<T>(pipeline: Either<T, number>) {
    return pipeline
        .map(n => String.fromCharCode(n))
        .map(s => s.toUpperCase())
        .fold(n => 'X', s => s);
}

// 1.
const rightResult = run(Right(113));
console.log(rightResult); // -> Q

const leftResult = run(Left(113));
console.log(rightResult); // -> X

// 2.

const successPipe = tryCatch(() => 115);
const successResult = run(successPipe);
console.log(successResult); // -> S

const failurePipe = tryCatch<number>(() => {
    throw new Error('BANG');
});
const failureResult = run(failurePipe);
console.log(failureResult); // -> X

// 3.

function getPort() {
    return tryCatch(() => fs.readFileSync('config.json'))
        .chain(c => tryCatch(() => JSON.parse(c) as Configs))
        .fold(e => 3000, c => c.port)
}

const result = getPort()
console.log(result)