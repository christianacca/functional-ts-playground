export interface Either<L, R> {
    chain<LResult, RResult>(f: (x: R) => Either<L | LResult, RResult>): Either<L | LResult, RResult>;
    map<TResult>(f: (x: R) => TResult): Either<L, TResult>;
    fold<LResult, RResult>(left: (x: L) => LResult, right: (x: R) => RResult): LResult | RResult;
}

function Right<TOther, T>(x: T): Either<TOther, T> {
    return {
        chain: <TResult>(f: (x: T) => Either<TOther, TResult>) => f(x),
        map: <TResult>(f: (x: T) => TResult) => Right<TOther, TResult>(f(x)),
        fold: <LResult, RResult>(left: (x: TOther) => LResult, right: (x: T) => RResult) => right(x)
    };
}

function Left<T, TOther>(x: T): Either<T, TOther> {
    return {
        chain: <TResult>(f: (x: TOther) => Either<T, TResult>) => Left(x),
        map: <TResult>(f: (x: TOther) => TResult) => Left<T, TResult>(x),
        fold: <LResult, RResult>(left: (x: T) => LResult, right: (x: TOther) => RResult) => left(x)
    };
}


// ------------------
// Example usage
// ------------------


// language extensions
function iif<TVal, FVal>(predicate: () => boolean, value: TVal, falseVal: FVal) {
    return predicate() ? Right<FVal, TVal>(value) : Left<FVal, TVal>(falseVal);
}

function ifTruthy<TVal, FVal>(test: any, value: TVal, falseVal: FVal) {
    return iif(() => test, value, falseVal);
}

function maybe<T>(x: T | null | undefined) {
    return x != null ? Right<null | undefined, T>(x) : Left<null | undefined, T>(x);
}

function tryCatch<T>(sector: () => T) {
    try {
        return Right<Error, T>(sector());
    } catch (e) {
        return Left<Error, T>(e);
    }
}


// setup
interface Configs {
    port: number;
    url?: string;
}

interface User {
    address?: {
        street?: {
            name: string
        }
    };
    premium: boolean;
    preferences: Preferences;
}

interface Preferences {
    rememberMe: boolean;
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
        .fold(e => 3000, c => c.port);
}

const result = getPort();
console.log(result);


// 4.

function openSite(currentUser: string | null) {
    return maybe(currentUser)
        .fold(_ => `<div>Login</div>`, user => `<div>Hello ${user}</div>`)
}


// 5.

function getPrefs(user: User): Preferences {
    return (user.premium ? Right<null, User>(user) : Left<null, User>(null))
        .fold(_ => ({ rememberMe: false }), u => u.preferences)
}

function getPrefs2(user: User): Preferences {
    return ifTruthy(user.premium, user, ({ rememberMe: false }))
        .fold(defaults => defaults, u => u.preferences)
}


// 6.

function getStreetName(user: User): string {
    return maybe(user.address)
        .chain(a => maybe(a.street))
        .map(s => s.name)
        .fold(_ => 'no street', n => n);
}


// 7.

function parseDbUrl(cfg: string) {
    return tryCatch(() => JSON.parse(cfg) as Configs)
        .chain(c => maybe(c.url))
        .fold(x => null, url => url)
}


function parseDbUrl2(cfg: string) {
    return tryCatch(() => JSON.parse(cfg) as Configs)
        .chain(c => maybe(c.url))
        .chain(url => iif(() => url.indexOf('hacker') !== -1, 'http://safesite', url))
        .fold(x => x instanceof Error ? x : x || '', url => url)
}