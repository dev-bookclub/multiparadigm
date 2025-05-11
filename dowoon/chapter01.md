# 멀티 패러다임이 현대 언어를 확장하는 방법

## 객체지향 디자인 패턴의 반복자 패턴과 일급 함수
- 객체지향 기반 언어들은 반복자 패턴으로 지연성 있는 이터레이션 프로토콜 구현
- 일급 함수를 바탕으로 map, fliter, reduce 등과 같은 이터레이터 헬퍼 함수 구현
  - 객체지향 디자인 패턴(GoF)과 함수형 패러다임의 일급 함수가 만나 함수형 패러다임의 지연 평가와 리스트 프로세싱 발전

### GoF 반복자 패턴
- 반복자 패턴은 컬렉션 요소를 순차적으로 접근하는 규약을 제시
- 반복자 구조를 타입스크립트 인터페이스로 정의를 사용해 표현하면 아래와 같음
```typescript
// 반복이 아직 완료되지 않은 상태
interface IteratorYieldResult<T> {
    done?: false;
    value: T;
}

// 반복이 완료된 상태
interface IteratorReturnResult<T> {
    done: true;
    value: T;
}

interface Iterator<T> {
    next(): IteratorYieldResult<T> | IteratorReturnResult<T>;
}
```

### ArrayLike로 부터 Iterator 생성하기
- ArrayLike를 받아서 ArrayLike를 순회하는 Iterator를 생성하는 클래스 예시

```typescript
class ArrayLikeIterator<T> implements Iterator<T> {
    private index = 0;

    constructor(private arrayLike: ArrayLike<T>) {
    }

    next(): IteratorResult<T> {
        if (this.index < this.arrayLike.length) {
            return {
                done: false,
                value: this.arrayLike[this.index++]
            }
        }
        else {
            return {
                done: true,
                value: undefined
            }
        }
    }
}
```
- `next()`를 활용해 arrayLike와 array 요소 순회 가능 
- `next()`를 실행한 만큼만 요소를 순회하기 때문에 지연 평가 구현 가능

### ArrayLike를 역순으로 순회하는 이터레이터 만들기
- `array.reverse()` 메서드의 경우 호출 시점에 원본 배열 순서 전환
- 대규모 데이터 처리나 성능이 중요한 경우 불필요한 메모리 이동과 연산 유발
- 이터레이터의 지연 평가를 통해 모든 오소를 뒤집을 필요 없이 필요한 시점에만 연산이 이루어지도록 개선 가능
```typescript
function reverse<T>(arrayLike: ArrayLike<T>): Iterator<T> {
    let idx = arrayLike.length;
    
    return {
        next() {
            if (idx === 0) { 
                return { value: undefined, done: true };
            }
            else {
                return { vlaue : arrayLike[--idx], done: false };
            }
        }
    }
}
```
### 지연 평가되는 map 함수
- 하단 `map`은 Iterator<A\>와 A를 B로 변환하는 transform 함수를 인자로 받아 Iterator<B\>를 반환
> - **일급 함수(First-class function)**: 함수를 값처럼 다루어 변수에 담거나 다른 함수의 인자로 전달하거나 함수의 반환값으로 사용할 수 있는 함수
> - **고차 함수(Higher-order function)**: 하나 이상의 함수를 인자로 받거나 반환하는 함수
```typescript
function map<A, B>(transform: (value: A) => B, iterator: Iterator<A>): Iterator<B> {
    return {
        next(): IteratorResult<B> {
            const { done, value } = iterator.next();
            return done
                ? { done, value }
                : { done, value: transform(value) };
        }
    }
}
```
- `map`또한 `next()`를 실행하기 전까지 아무런 작업을 하지 않음(지연평가 가능)
- 반복자 패턴의 지연성은 지연 평가가 가능한 객체를 생성하게 해주고 일급 함수는 고차 함수를 정의할 수 있게 해줌

### 멀티패러다임의 교차점: 반복자 패턴과 일급 함수
- 자바스크립트 ES6부터 Iterator를 중심으로 Map, Set, Array, Web API의 NodeList 등을 포함한 코어 환경의 모든 컬렉션 타입에 일관된 순환 규약 도입
  - AsyncGenerator, Array.fromAsync, Iterator Helpers 등으로 이 프로토콜이 계속 발전하고 있음
- ES6부터 도입된 class로 자바스크립트도 객체지향적으로 발전
  - 객체지향 디자인 패턴 중 하나인 반복자 패턴을 중심으로 함수형 패러다임 적용
  - 명령형 패러다임으로 작성되는 제네레이터까지 호환 → 멀티패러다임적으로 발전

## 명령형 프로그래밍으로 이터레이터를 만드는 제네레이터 함수
- 제네레이터는 반복자 패턴인 이터레이터를 명령형 코드로 구현하고 생성할 수 있는 도구

### 제네레이터 기본 문법
- **제네레이터는 명령형 스타일로 이터레이터를 작성할 수 있게 해주는 문법**
- `function*` 키워드로 제네레이터 함수 정의 및 호출 시 이터레이터 객첼르 반환

#### Yield, next()
- 제네레이터 함수 반환값인 이터레이터에 대해 `next()` 호출 시 함수의 본문이 `yield` 키워드를 만날 때 까지 실행
- `yield` 키워드를 통해 외부로 값 반환 후 `next()` 호출 시 이전 실행 지점부터 이어서 재개
```ts
function* generator() {
    yield 1;
    yield 2;
    yield 3;
}

const iter = generator();

console.log(iter.next()); // { value: 1, done: false }
console.log(iter.next()); // { value: 2, done: false }
console.log(iter.next()); // { value: 3, done: false }
console.log(iter.next()); // { value: undefined, done: true }
```
- done 속성이 true가 될 때까지 제네레이터는 `yield` 키워드가 있는 지점까지 실행하고 값을 반환하고 일시 중지하는 과정을 반복함

#### 제네레이터와 제어문
- 제네레이터는 명령형으로 구현하기 때문에 다음과 같이 조건문을 사용 가능
```ts
function* generator() {
    yield 1;
    if (condition) {
        yield 2;
    }
    yield 3;
}
```

#### yield*  키워드
- `yield*` 키워드는 제네레이터 함수 안에서 이터러블을 순회하며 해당 이터러블이 제공하는 요소들을 순차적으로 반환
```ts
function* generator() {
    yield 1;
    yield* [2, 3];
    yield 4;
}

const iter = generator();
console.log(iter.next()); // { value: 1, done: false }
console.log(iter.next()); // { value: 2, done: false }
console.log(iter.next()); // { value: 3, done: false }
console.log(iter.next()); // { value: 4, done: false }
}
```
- 두 번째 `iter.next()` 호출 시 `yield* [2, 3]`이 실행되어 배열 [2, 3]의 각 요소를 차례로 반환

#### naturals 제네레이터 함수
- 다음은 자연수의 무한 시퀀스를 생성하는 제네레이터 함수
```ts
function* naturals() {
    let n = 1;
    while (true) {
        yield n++;
    }
}
```
- 무한 루프를 사용하지만 `next()`를 호출할 때만 n을 반환하고 다시 일시 중지하기 때문에 프로세스나 브라우저가 멈추지 않음

### 제네레이터로 작성한 reverse 함수
```ts
function* reverse<T>(arrayLike: ArrayLike<T>): IterableIterator<T> {
    let idx = arrayLike.length;
    
    while (idx) {
        yield arrayLike[--idx];
    }
}
```

## 자바스크립트에서 반복자 패턴 사례: 이터레이션 프로토콜
- 이터레이션 프로토콜은 어떤 객체가 이터러블인지 여부를 나타내는 자바스크립트 규약

### 이터레이터와 이터러블
- 어떤 객체가 이터레이터를 반환하는 메서드를 가지고 있다면 이터러블
- 이터러블 객체는 for..of문, 전개 연산자, 구조 분해 등 다양한 기능과 함께 사용 가능
- 자신이 가진 요소들을 이터레이터를 통해 순회할 수 있도록 하며 대표적으로 Array, Map, Set 등이 해당

#### 이터레이터
- 자연수를 생성하는 이터레이터를 반환하는 함수를 제네레이터가 아닌 일반 함수로 작성
```ts
function naturals(end = Infinity): Iterator<number> {
    let n = 1;
    return {
        next(): IteratorResult<number> {
            return n <= end
            ? { done: false, value: n++ }
            : { done: true, value: undefined };
        }
    }
}
```

#### for...of문 순회
- 아래와 같이 코드 작성 시 에러 발생
```ts
const iterator = naturals(3);

// TS2488: Type 'Iterator<number>'
// must have a '[Symbol.iterator]()' method that returns an iterator.
for (const num of iterator) {
    console.log(num);
}
```
- 따라서 아래와 같이 `[Symbol.iterator]()` 메서드를 구현해야 함
```ts
function naturals(end = Infinity): Iterator<number> {
    let n = 1;
    return {
        [Symbol.iterator]() {
            return this;
        },
        next(): IteratorResult<number> {
            return n <= end
            ? { done: false, value: n++ }
            : { done: true, value: undefined };
        }
    }
}
```
#### 내장 이터러블
- 자바스크립트 내장 이터러블인 Array, Map, Set 등은 모두 `[Symbol.iterator]()` 메서드를 구현하고 있음
```ts
const array = [1, 2, 3];
const set = new Set([1, 2, 3]);
const map = new Map([
    ['a', 1],
    ['b', 2],
    ['c', 3]
]);

const arrayIterator = array[Symbol.iterator]();
const setIterator = set[Symbol.iterator]();
const mapIterator = map[Symbol.iterator]();

console.log(arrayIterator.next());
console.log(setIterator.next());
console.log(mapIterator.next());
```

- 또한 `map.entries()` 메서드는 Map 객체의 엔트리를 IterableIterator로 반환
```ts
const mapEntries = map.entries();

console.log(mapEntries.next()); // { value: ['a', 1], done: false }
console.log(mapEntries.next()); // { value: ['b', 2], done: false }
console.log(mapEntries.next()); // { value: ['c', 3], done: false }
console.log(mapEntries.next()); // { value: undefined, done: true }
```

### 언어와 이터러블의 상호작용
- 자바스크립트와 타입스크립트에서 이터러블은 언어의 다양한 기능과 상호작용하며 동작

#### 전개 연산자와 이터러블
- 전개 연산자는 이터러블을 펼쳐서 요소를 개별적으로 사용할 수 있게 해줌
```ts
const array = [1, 2, 3];
const array2 = [...array, 4, 5];
```

#### 구조 분해 할당과 이터러블
- 구조 분해 할당은 이터러블을 개별 변수에 할당할 수 있게 해줌
```ts
const array = [1, 2, 3];
const [a, b, c] = array;
```

#### 사용자 정의 이터러블과 전개 연산자
- 사용자 정의 이터러블은 전개 연산자와 함께 사용 가능
```ts
const array = [0, ...naturals(3)];
```

### 제네레이터로 만든 이터레이터도 이터러블

#### 제네레이터로 만든 map 함수
- 하단은 map 함수를 제네레이터로 구현했으며 항상 IterableIterator를 반환
```ts
function* map<A, B>(
    f: (value: A) => B, iterable: Iterable<A>
): IterableIterator<B> {
    for (const value of iterable) {
        yield f(value);
    }
}
```
- 위 map 함수는 제네레이터로 구현되었기에 `next()`, `[Symbol.iterator]()` 메서드가 자동으로 구현됨

## 이터러블을 다루는 함수형 프로그래밍
- forEach, map, filter 세 가지 함수를 다양한 방식으로 구현

### forEach 함수
- 함수와 이터러블을 받아 이터러블을 순회하면서 각 요소에 인자로 받은 함수를 적용하는 고차 함수
```ts
function forEach(f, iterable) {
    for (const value of iterable) {
        f(value);
    }
}

const array = [1, 2, 3];
forEach(console.log, array);
```

### map 함수
- map 함수는 제네레이터를 사용하여 구현
```ts
function* map(f, iterable) {
    for (const value of iterable) {
        yield f(value);
    }
}
```
- 이터러블을 인자로 받아 이터레이터를 결과로 반환

### filter 함수 
- filter 함수는 주어진 이터러블의 각 요소에 대해 조건을 확인하여 해당 조건을 만족하는 요소들만 반환하는 고차 함수
```ts
function* filter(f, iterable) {
    for (const value of iterable) {
        if (f(value)) {
            yield value;
        }
    }
}

const array = [1, 2, 3, 4, 5];
const evenNumbers = filter((n) => n % 2 === 0, array);
console.log([...evenNumbers]);
```

### 고차 함수 조합하기
```ts
forEach(console.log,
    map(x => x * 10, 
            filter(x => x % 2 === 0, 
            naturals(5))));
```
- 위 코드는 다음과 같은 순서로 실행됨
1) natural(5) 결과를
2) 2)x%2 === 0 조건으로 필터링하고
3) x * 10으로 변환한 후
4) console.log로 출력

## 이터러블 프로토콜이 상속이 아닌 인터페이스로 설계된 이유
- 객체지향 프로그래밍에서 상속을 사용하면 코드를 추상화해 기능을 공유 가능
- 그러나 반복자 패턴과 이터레이터를 지원하는 헬퍼 함수들은 상속이 아닌 인터페이스로 설계

### Web API의 NodeList도 이터러블
- NoeList는 문서 내의 노드들을 컬렉션 형태로 나타내며 이터러블 프로토콜을 따름
```html
<ul>
    <li>1</li>
    <li>2</li>
    <li>3</li>
    <li>4</li>
</ul>
<script>
  const nodeList = document.querySelectorAll('li');
  
  for (const node of nodeList) {
      console.log(node.textContent);
  }
</script>
```

### 상속이 아닌 인터페이스로 해결해야 하는 이유
#### 이터러블을 사용하는 이유
- 자바스크립트 Array는 map, filter, forEach 등과 같은 고차 함수 지원
```ts
const nodes: NodeList = document.querySelectorAll('li');
console.log(nodes[0], nodes[1], nodes.length);

// Uncaught TypeError: nodes.map is not a function
nodes.map(node => node.textContent);;
```
- NodeList는 Array의 메서드를 상속받지 않기 때문에 위와 같은 에러 발생
- 따라서 이터레이션 프로토콜에 기반한 이터러블 이용 

#### Array를 상속받지 않는 이유
- 자바스크립트, 타입스크립트 내 표준 라이브러리에서 Array를 상속받는 내장 클래스는 없음
- **모두 서로 다른 자료구조를 나타내며 각각 고유한 특성과 동작을 하도록 설계되었기 때문**
- 상속으로 인해 의존성이 생길 시 불필요한 복잡성 초래 및 최적화된 동작을 보장할 수 X
  - **Array**: 가변 길이, 동적 크기, 다양한 메서드 제공
  - **Set**: 중복된 값을 허용하지 않음, 순서 없음
  - **Map**: 키-값 쌍으로 구성, 순서 있음

#### NodeList가 ArrayLike임에도 Array를 상속받지 않는 이유
- NodeList는 DOM 트리 요소를 순서대로 나타내는 특수한 자료구조이며 DOM 조작과 연관
- Array는 생성된 후 정적이며 항상 수동으로 요소를 추가하거나 제거해야 함

### 인터페이스와 클래스 상속
- 인터페이스는 클래스나 객체가 따라야할 규약 정의 및 구현 강제
- 클래스 상속은 부모 클래스의 속성과 메서드를 자식 클래스가 물려받아 재사용하는 것
