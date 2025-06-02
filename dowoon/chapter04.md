# 비동기 프로그래밍

## 값으로 다루는 비동기

### Promise
Promise를 반복자 패턴과 조합하여 비동기 프로그래밍 모델을 만들 수 있다. 
Promise는 생성 즉시 대기 상태로 시작, 작업 성공 시 이행, 실패 시 거부 상태로 전환된다.
- ECMAScript 2017: async/await이 도입되어 Promise를 간결하고 직관적으로 사용
- ECMAScript 2018: AsyncGenerator, AsyncIterator가 도입되어 비동기 작업 유연하게 처리

Promise가 지속적으로 보강되는 이유는 **자바스크립트 IO를 다루는 핵심 기술**이기 때문이다.
다음은 Promise를 반환하는 delay 함수이다.
```ts
function delay<T>(time: number, value: T): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), time));
}
```
setTimeout 함수는 첫 번째 인자로 전달된 콜백함수를 실행할 때 세 번째 인자부터 시작해서 전달된 값들을 콜백함수 인자로 전달하므로 간결하게 수정이 가능하다.
```ts
function delay<T>(time: number, value: T): Promise<T> {
    return new Promise((resolve) => setTimeout(resolve, time, value));
}
```

### new Promise()
필자는 면접에서 아래와 같은 질문을 하곤 한다.
- 실제 업무에서 new Promise()를 사용해본 경험이 있는지
- 학습,실습 과정에서 작업할 때 실제 서비스 코드에서 new Promise()를 활용한 사례가 있는지
- Promise 인스턴스를 인자로 받아 처리하는 함수를 구현해본 적이 있는지
- Promise.all 이나 Promise.race를 사용해본 경험이 있는지  

최근에는 Web API, Node.js를 비롯한 서드파티 라이브러리에서 Promise 기반 인터페이스를 제공하기 때문에 직접 호출할 일이 적어졌다.
그럼에도 new Promise() 등을 통해 비동기 제어에 대한 깊이있는 이해와 문제 해결 능력을 갖고 있는지를 평가하는 척도가 될 수 있다.


1. `Promise.race`: 병렬로 실행된 여러 Promise 중 가장 먼저 완료된 Promise 결과나 에러를 반환
2. `Promise.all`: 병렬로 실행된 여러 Promise의 결과를 배열로 반환, 모든 Promise가 성공해야 함
3. `Promise.allSettled`: 병렬로 실행된 여러 Promise의 결과를 배열로 반환, 각 Promise의 성공 여부와 결과를 포함
4. `Promise.any`: 병렬로 실행된 여러 Promise 중 가장 먼저 성공한 Promise의 결과를 반환, 모든 Promise가 실패하면 에러 발생

## 지연성으로 다루는 비동기
`Promise.all`을 통해 한번에 호출할 때 부하를 조절하고 싶은 경우 아래와 같이 비동기 작업을 나누어 실행할 수 있다.
```ts
async function executeWithLimit<T>(
    promises: Promise<T>[],
    limit: number
): Promise<T[]> {
    const result1 = await Promise.all([promise[0], promise[1], promise[2]]);
    const result2 = await Promise.all([promise[3], promise[4], promise[5]]);
    return [...result1, ...result2];
}
```
Promise 객체는 생성 즉시 실행되기 때문에 3개씩 그룹화하여도 6개의 Promise가 동시에 실행된다.
따라서 아래와 같이 기호를 추가하여 즉시 실행을 방지할 수 있다.
```ts
async function executeWithLimit<T>(
    fs: (() => Promise<T>)[],
    limit: number
): Promise<T[]> {
    const result1 = await Promise.all([fs[0](), fs[1](), fs[2]()]);
    const result2 = await Promise.all([fs[3](), fs[4](), fs[5]()]);
    return [...result1, ...result2];
}
```
Promise를 함수로 감싸서 필요할 때 실행되도록 실행을 지연했다.

`executeWithLimit`을 함수형으로도 구현 가능하다.
여기서 `chunk`함수는 주어진 크기로 이러블을 나누는 리스트 프로세싱 함수이다.
```ts
function* chunk<T>(size: number, iterable: Iterable<T>): IterableIterator<T[]> {
    ...
}

class FxIterable<A> {
    ... 
    chunk(size: number) {
        return fx(chunk(size, this));
    }
}

const executeWithLimit = <T>(fs: (() => Pormise<T>), limit: number): Promise<T[]> =>
    fx(fs)
        .chunk(limit) // 3개씩 그룹화
        .map(fs => fs.map(f => f())) // 비동기 함수 실행
        .map(ps => Promise.all(ps)) // 3개씩 대기하도록 Promise.all로 감싸기
        .to(fromAsync) // Promise.all들의 결과 꺼내기
        .then(arr => arr.flat()); // 1차원 배열로 평탄화
```
여기서 `fromAsync`는 ECMAScript에는 도입되었지만 아직 타입스크립트에는 도입되지 않은 함수이다.

## 타입으로 다루는 비동기
JS는 AsyncIterator, AsyncIterable, AsyncGenerator와 같은 프로토콜을 제공하여 비동기 작업의 순차적 처리를 지원한다.
```ts
interface IteratorYieldResult<T> {
    done?: false;
    value: T;
}

interface IteratorReturnResult {
    done: true;
    value: undefined;
}

interface AsyncIterator<T> {
    next(): Promise<IteratorYieldResult<T> | IteratorReturnResult>
}

interface AsyncIterable<T> {
    [Symbol.asyncIterator](): AsyncIterator<T>;
}

interface AsyncIterableIterator<T> extends AsyncIterator<T> {
    [Symbol.asyncIterator](): AsyncIterableIterator<T>;
}
```

AsyncGenerator는 비동기적으로 값을 생성하고 순차적으로 처리한다.
```ts
async function* stringAsyncTest(): AsyncIterableIterator<string> {
    yield delay(1000, 'a');
    
    const b = await delay(500, 'b'); + 'c';
    
    yield b;
}
```
첫 번째 yield는 100ms 후에 'a'를 반환하고, 두 번째 yield는 500ms 후에 'b'에 'c'를 더해 반환한다.

`toAsync` 함수는 동기적인 Iterable 또는 Promsise가 포함된 Iterable을 받아 비동기적으로 처리할 수 있는 AsyncIterable로 변환한다.
```ts
async function test() {
    const asyncIterable = toAsync([1]);
    const asyncIterator = asyncIterable[Symbol.asyncIterator]();
    await asyncIterator.next().then(({ value }) => console.log(value)); // 1

    const asyncIterable2 = toAsync([Promise.resolve(2)]);
    const asyncIterator2 = asyncIterable2[Symbol.asyncIterator]();
    await asyncIterator2.next().then(({ value }) => console.log(value)); // 2
}
```
`toAsync` 함수는 일반 Iterable을 AsyncIterable로 변환하여 실제 런타임에서 값을 처리할 뿐만 아니라 **컴파일 타임에 타입이 변경되는 것을 선언**한다.

### AsyncIterable을 다루는 고차 함수
먼저 mapAsync 함수이다.
```ts
function mapAsync<A,B>(
    f: (a: A) => B, // A 타입의 입력값을 B로 변환하는 함수 (B는 Promise일수도 있음)
    asyncIterable: AsyncIterable<A> // 비동기적으로 반복가능한 객체
): AsyncIterableIterator<Awaited<B>> { // Awaited<B>는 B가 Promise일 경우 그 결과 타입을 반환
    const asyncIterator = asyncIterable[Symbol.asyncIterator]();
    
    return {
        async next() {
            const { value, done } = await asyncIterator.next();
            return done
                ? { done: true, value: undefined }
                : { done: false, value: await f(value) };
        },
        [Symbol.asyncIterator]() {
            return this;
        }
    };
}
```
`mapAsync` 함수는 동기적으로 처리하는 `mapSync`와 코드 흐름이 동일하며 비동기 이터러블을 다룰 수 있도록 설계된 데에 차이가 있다.

제네레이터를 활용한 경우 다음과 같이 구현 가능하다.
```ts
async function* mapAsync<A,B>(
    f: (a: A) => B,
    asyncIterable: AsyncIterable<A>
): AsyncIterableIterator<Awaited<B>> {
    for await (const value of asyncIterable) {
        yield f(value);
    }
}
```

함수 오버로드를 활용하여 mapSync와 mapAsync를 하나의 함수로 통합할 수 있다.
```ts
function map<A,B>(
    f: (a: A) => B,
    iterable: Iterable<A>
) : IterableIterator<B>;

function map<A,B>(
    f: (a: A) => B,
    asyncIterable: AsyncIterable<A>
): AsyncIterableIterator<Awaited<B>>;

function map<A,B>(
    f: (a: A) => B,
    iterable: Iterable<A> | AsyncIterable<A>
): IterableIterator<B> | AsyncIterableIterator<Awaited<B>> {
    return isIterable(iterable)
    ? mapSync(f, iterable)
    : mapAsync(f, iterable);
}
```

## 비동기 에러 핸들링
### 여러 이미지 불러와서 높이 구하기
url의 이미지를 비동기적으로 불러와 이미지의 높이를 계산하고 총합을 구하는 예제이다.
```ts
async function calcToHeight(urls: string[]) {
    try {
        const totalHeight = await urls
            .map(async (url) => {
                const img = await loadImage(url);
                return img.height;
            })
            .reduce(
                async (a, b) => await a + await b,
                Promise.resolve(0)
            );
        return totalHeight;
    } catch (e) {
        console.error(`Error:`, e);
    }
}
```
위 코드는 1) 에러가 발생해도 나머지 URL에 대해 이미지 다운로드 시도, 2) 같은 방식으로 POST나 INERT와 같은 API 제어 시 필요한 요청으로 부수효과 발생 등과 같은 문제점이 존재한다.

따라서 에러 발생 시 즉시 요청을 멈추고 추가적인 부하를 방지하는 코드로 개선할 수 있다.
```ts
async function calcTotalHeight(urls: string[]) {
    try {
        const totalHeight = await fx(urls)
            .toAsync()
            .map(loadImage)
            .map(img => img.height)
            .reduce((a,b) => a + b, 0);
        return totalHeight;
    } catch (e) {
        console.error(`error:`, e);
    }
}
```

