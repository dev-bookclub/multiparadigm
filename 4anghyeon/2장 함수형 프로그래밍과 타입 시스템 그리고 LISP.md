## 타입 추론과 함수 타입 그리고 제네릭

타입스크립트를 사용하면 타입 추론을 통해 명시적 타입 선언 없이도 안전한 코드를 작성할 수 있고, 고차 함수와 제네릭을 이용하여 복잡한 함수형 패턴을 구현할 수 있다.



### 타입 추론

타입스크립트의 타입 추론은 명시적 타입 선언 없이도 타입스크립트 컴파일러가 자동으로 변수, 함수, 표현식 등의 타입을 추론해주는 기능이다.

```typescript
let a = 10; // 10이라는 값을을통해 a의 타입을 number로 추론한다.
let message = "Hello TypeScript!" // string 타입을으로 추론한다.

const selected = true; // const는 값을 재할당할 수 없기에 타입이 true로 추론된다.
let checked = true; // let으로 선언되어 재할당할 수 있기에 boolean으로 추론된다.


function add(a: number, b: number) {
  return a + b; // 반환 타입을 명시적으로 지정하지 않았지만 a와 b를 통해 number로 추론한다.
}


// 객체 리터럴의 속성 타입도 추론할 수 있다.
let user = {
  name: "Marty",
  age: 30
}

user.name; // string
user.age; // number


// 함수 인자의 타입도 추론할 수 있다.
let strs = ['a', 'b', 'c'];
strs.forEach(str => console.log(str.toUpperCase()));
```

#### 제네릭을 통한 타입 추론

타입스크립트에서 **제네릭 함수**를 사용하면 하나의 함수가 다양한 타입을 지원하여 다형성이 높은  함수가 된다. 제네릭은 함수 호출 시점에 전달된 인자의 타입에 따라 실제 타입이 결정된다.

```typescript
function identity<T>(arg: T): T {
  return arg;
}

const a = identity("hi");

const e = identity(new User());
```

문자열과 같은 기본 타입 뿐만아니라 `User` 같은 객체를 전달하는 경우도 동일하게 작동한다.



### 함수 타입과 제네릭

타입스크립트는 함수형 프로그래밍을 지원하기 위해 고차 함수, 함수 타입, 제네릭 등 다양한 기능을 제공한다. 함수 타입을 명시적으로 정의하여 입력과 출력 타입을 명확하게 표현할 수 있고, 제네릭을 활용하여 폭넓은 범용 함수를 만들 수 있다. 고차 함수는 전달받은 함수의 매개변수 타입을 추론하고 다른 인자들의 타입과도 연계해 타입을 유연하게 추론할 수 있게 한다.



#### 함수의 타입을 정의하는 여러 가지 방법

가장 기본적인 방법은 함수의 매개변수와 반환 값에 타입을 명시하는 것이다.

```typescript
function add(a: number, b: number): number {
  return a + b;
}
```



또한 **함수 오버로드** 방식으로 동일한 함수명으로 다양한 시그니처를 정의할 수 있다.

```typescript
function double(a: number): number;
function double(a: string): string;
function double(a: number | string): number | string {
  if (typeof a === 'number') {
    return a * 2;
  } else {
    return a + a;
  }
}
```



> [!WARNING]
> 타입스크립트에서 함수 오버로드를 사용할 땐 구체적인 시그니처를 위에 정의하고, 더 *일반적인* 시그니처를 아래 정의 해야 한다.
> ```typescript
> /* WRONG */
> declare function fn(x: unknown): unknown;
> declare function fn(x: HTMLElement): number;
> declare function fn(x: HTMLDivElement): string;
> var myElem: HTMLDivElement;
> var x = fn(myElem); // x: unknown, wat?
> 
> /* OK */
> declare function fn(x: HTMLDivElement): string;
> declare function fn(x: HTMLElement): number;
> declare function fn(x: unknown): unknown;
> var myElem: HTMLDivElement;
> var x = fn(myElem); // x: string, :)
> 
> ```
> 
> 참조: [https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html#function-overloads](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html#function-overloads)



함수 타입을 만들어 여러 곳에서 재활용할 수도 있다.

```typescript
type Add = (a: number, b: number) => number;
const add: Add = (a, b) => a + b;
```



아래 `constant` 함수는 인자로 입력받은 값을 항상 그대로 돌려주는 함수를 반환한다. 이 함수는 특정 값을 캡처하여 호출될 때마다 해당 값을 반환한다.

```typescript
function constant<T>(a: T): () => T {
  return () => a;
}

const getFive = constant(5);
const ten = getFive() + getFive();
```

제네릭을 사용하였기 때문에 어떤 타입의 값도 처리할 수 있으며, 타입 추론 덕에 명시적인 타입 선언 없이도 올바르게 동작한다.





## 멀티패러다임 언어에서 함수형 타입 시스템

### 함수형 고차 함수와 타입 시스템

우리가 구현하는 반복자 패턴을 활용한 함수형 고차 함수들은 이터러블 자료구조를 중심으로 구성되므로 이터러블 헬퍼 함수라고 부를 수 있겠다. 이제 이터러블 헬퍼 함수에 타입 시스템을 적용하면서 멀티패러다임 언어에서의 함수형 타입 시스템에 대해 알아보자.



#### reduce와 타입

`reduce` 함수는 함수와 초깃값을 받고, 요소를 순회하며 함수를 실행하며 누적값을 계산하고, 최종적으로 누적값을 반환한다.

```typescript
function reduce<A, Acc>(f: (acc: Acc, a: A) => Acc, acc: Acc, iterable: Iterable<A>): Acc {
  for (const a of iterable) {
    acc = f(acc, a)
  }
  return acc;
}
```

#### reduce 함수 오버로드

자바스크립트에 내장된 `Array.prototype.reduce` 함수는 초깃값을 생략할 수 있다. 위에서 만든 `reduce` 에도 동일한 스펙을 지원하도록 해보자.

- 초깃값이 있을 때는 세 개의 인자를 받는다.
- 초깃값을 생략할 때는 `f` 와 `itreable` 만 받는다. 이터러벌의 첫 번째 요소가 초깃값이 된다.
- 초깃값이 없고, 빈 배열이 전달될 경우 타입이 올바르지 않으므로 에러를 발생 시킨다.



이를 위해서는 함수 오버로드를 사용해햐 한다. 함수 오버로드는 시그니처를 여러개 정의하고 실제 구현은 하나만 제공한다.

```typescript
function baseReduce<A, Acc>(
  f: (acc: Acc, a: A) => Acc, acc: Acc, iterator: Iterator<A>
): Acc {
  while (true) {
    const { done, value } = iterator.next();
    if (done) break;
    acc = f(acc, value);
  }
  return acc;
}

// (1)
function reduce<A, Acc>(
  f: (acc: Acc, a: A) => Acc, acc: Acc, iterable: Iterable<A>
): Acc;
// (2)
function reduce<A, Acc>(
  f: (a: A, b: A) => Acc, iterable: Iterable<A>
): Acc;
function reduce<A, Acc>(
  f: (a: Acc | A, b: A) => Acc, 
  accOrIterable: Acc | Iterable<A>, 
  iterable?: Iterable<A>
): Acc {
  if (iterable === undefined) { // (3)
    const iterator = (accOrIterable as Iterable<A>)[Symbol.iterator]();
    const { done, value: acc } = iterator.next();
    if (done) throw new TypeError("'reduce' of empty iterable with no initial value");
    return baseReduce(f, acc, iterator) as Acc;
  } else { // (4)
    return baseReduce(f, accOrIterable as Acc, iterable[Symbol.iterator]());
  }
}
```



함수 시그니처 부분(1, 2)과 구현 부분(3, 4)을 설명하면 다음과 같다.

1. 누적값과 초깃값을 받는 함수 f와 초깃값 acc(Acc), iterable(Iterbale<A>)을 인자로 받는다. 그리고 Acc 타입의 값을 반환한다.
2. 두 값을 받는 함수 f와, iterable(Iterbale<A>)을 인자로 받는다. 이터러벌의 첫 번째 요소를 초깃값으로 사용하여 누적값을 계산한 후 Acc 타입의 값을 반환한다.
3. 마지막 인자인 iterable이 없는 경우 두 번째 인자인 accOrItrable이 이터러블이 된다.
4. 세 개의 인자를 모두 받은 경우 두 번째 인자인 accOrItrable이 초깃값이다.



## 멀티패러다임 언어와 메타프로그래밍 - LISP로부터

이 절의 예제들에서는 제네릭, 일급 함수, 클래스, 이터러블 프로토콜 등 다양한 언어 기능을 조합해 유연하고 확장성 높은 추상화하는 과정을 살펴본다. 이를 통해 메타프로그래밍에서 얻을 법한 코드 표현력 향상, 런타임에서의 기능 변형을 구현하면서 마치 언어 자체를 확장한 듯한 경험을 얻어보자.



> [!NOTE]
> 여기서 **메타프로그래밍** 이란 프로그램이 자기 자신 혹은 다른 프로그램을 데이터처럼 바라보며 분석,변형,생성하거나 실행하는 기법을 말한다. 프로그램이 코드를 데이터로 다루면서 동적으로 조작하고 확장하는 방식은 전통적인 LISP 계열 언어에서 극대화 되었다.



### Pipe Operator

아래와 같은 코드는 가독성이 좋지 않다. 코드를 오른쪽 아래에서 왼쪽 위 방향으로 읽어야 하기 때문이다.

```typescript
forEach(printNumber,
  map(n => n * 10,
    filter(n => n % 2 === 1,
      naturals(5))));
```



LISP는 지연 평가와 메타프로그래밍 측면에서 탁월한 강점이 있으므로 개발자가 직접 pipe 함수를 만들어 이러한 문제를 해결할 수 있다.

또한 몇몇 언어에서는 이미 Pipe Operator를 지원하여 가독성 문제를 완화하고 있다.

```typescript
naturals(5)
  |> filter(n => n % 2 === 1, %)
  |> map(n => n * 10, %)
  |> forEach(printNumber, %)
```



### 클래스와 고차 함수, 반복자, 타입 시스템을 조합하기

객체지향 패러다임의 클래스와 이터러블, 함수형 함수, 타입 시스템을 적절히 결합하여 가독성 문제를 직접 해결해보자.



#### 제네릭 클래스로 Iterable 확장하기

Iterable을 확장한 클래스를 만들어보자. `FxIterable<A>` 라고 작성하여 제네릭 클래스로 정의하고 내부적으로 `iterable`  프로퍼티를 갖게 했다.

```typescript
class FxIterable<A> {
  constructor(private iterable: Iterable<A>) {}
}
```

이제 이 제네릭 클래스에 다양한 고차 함수들을 메서드로 추가해보자.



#### FxIterable<A>에 map 메서드 추가하기

```typescript
function* map<A, B>(f: (a: A) => B, iterable: Iterable<A>): IterableIterator<B> {
  for (const a of iterable) {
    yield f(a);
  }
}

class FxIterable<A> {
  constructor(private iterable: Iterable<A>) {}

  map<B>(f: (a: A) => B): FxIterable<B> {
    return new FxIterable(map(a => f(a), this.iterable));
  }
}

const mapped = new FxIterable(['a', 'b']) 
  .map(a => a.toUpperCase())             
  .map(b => b + b);                     
```

`map` 메서드는 `this.iterable` 에 `map(f)` 를 적용한 이터러블 이터레이터를 만든 후 `FxIterable<B>` 를 생성하여 반환한다. `FxIterable` 클래스의 인스턴스는 체이닝 방식으로 `map` 을 연속적으로 실행할 수 있다.



아래와 같이 헬퍼 함수를 추가하여 더 간결하게 만들 수 있다.

```typescript
function fx<A>(iterable: Iterable<A>): FxIterable<A> {
  return new FxIterable(iterable);
}

const mapped2 = fx(['a', 'b'])
  .map(a => a.toUpperCase())
  .map(b => b + b);
```



#### reduce 메서드 만들기

reduce는 앞서 구현하 것처럼 메서드 오버로드를 통해 두 가지 호출 방식을 지원해야 한다. 타입스크립트에서 메서드 오버로드는 함수 오버로드와 동알힌 방식으로 처리된다.

```typescript
class FxIterable<A> {
  constructor(private iterable: Iterable<A>) {}

  // ... 

  reduce<Acc>(f: (acc: Acc, a: A) => Acc, acc: Acc): Acc;
  reduce<Acc>(f: (a: A, b: A) => Acc): Acc;
  reduce<Acc>(f: (a: Acc | A, b: A) => Acc, acc?: Acc): Acc {
    return acc === undefined
      ? reduce(f, this.iterable) // (3)
      : reduce(f, acc, this.iterable); // (4)
  }
}
```



## LISP(클로저)에서 배우기 - 코드가 데이터, 데이터가 코드

LISP는 오래된 역사와 독특한 문법으로 유명하다. LISP의 가장 큰 특징은 '코드가 데이터이고 데이터가 코드' 라는 개념이다. 이를 통해 프로그래밍 언어의 구문을 데이터 구조로 표현하고 조작할 수 있다.

이번 절에서는 LISP 계열 언어인 클로저를 예로 들어 LISP의 기본 개념과, 매크로, 메타프로그래밍 등에 대해 알아보자.



### 클로저(Clojure)

클로저는 리치 히키가 2007년에 개발한 함수형 프로그래밍언 언어로 LISP 게열에 속한다. JVM 위에서 실행되며 LISP 언어의 특성과 함께 자바의 라이브러리를 쉽게 호출할 수 있다. 함수형 프로그래밍, 불변성, 동시성등을 지원한다. 클로저 또한 코드와 데이터를 동일하게 취급한다.



#### S - 표현식

LISP의 S-표현식은 리스트 형태의 구문 표현을 의미 한다.

```lisp
(+ 1 2) ;; 1과 2를더하는 코드이자 동시에 리스트 형태의 데이터
```

- 첫 번째 요소: 연산자(함수) +
- 나머지 요소: 피연산자 1과 2

LISP 계열 언어에서는 함수 호출이 리스트 구조로 이루어지며, 첫 번째 요소가 함수, 나머지 요소들이 인자이다.



### 클로저에서 map이 실행될 때

```lisp
(map #(+ % 10) [1 2 3 4])
```

이 코드는 다음과 같이 동작한다.

- 첫 번째 요소: 함수 map
- 두 번째 요소: 익명 함수
    - 현재 요소에 10을 더하는 함수
- 세 번째 요소: 벡터
    - 클로저에서 `[]` 는 벡터, `()` 는 리스트를 의미

`#(+ % 10)` 은 리더 매크로에 의해 `(fn [x] (+ x 10))` 형태의 익명함수로 확장된다. 클로저에서는 함수 정의도 리스트로 표현하므로 함수 정의 구문 자체를 '코드이자 데이터 구조'로 다룰 수 있다.

> [!NOTE]
> **리더 매크로**란 클로저와 같은 언어가 소스 코드를 읽는 단계에서 특정 기호나 패턴을 미리 정해진 형태의 다른 코드로 치환하는 것을 말한다.





#### 앞에서부터 두 개의 값 꺼내기

다음 코드는 `let` 과 구조 분해를 통해 `map` 의 결과에서 앞의 두 값을 추출하는 예제이다.

```lisp
v(let [[first second] (map #(+ % 10) [1 2 3 4])]
  (println first second))
;; 11 12
```

`map` 은 지연 평가되므로 실제로 필요할 때만 요소를 계산한다.

LISP 계열 언어에서는 코드가 리스트 형태로 표현되며 리스트는 평가되기 전까지는 단순한 데이터 구조에 불과하다. 평가 과정이 시작되서야 리스트가 실제 함수 호출이나 로직으로 해석되어 실행된다. 예를 들어 익명함수 `(fn [x] (+ x 10))` 역시 아직 평가되지 않은 '코드' 이자 리스트 형태로 구성된 '값'이다.

이처럼 코드와 데이터를 동일한 형태로 다루며 필요할 때 점진적으로 평가하는 것이 LISP 계열 언어의 특징이자 강점 중 하나이다.



## 멀티패러다임 언어에서 사용자가 만든 코드이자 클래스를 리스트로 만들기

클로저로 만든 코드와 동일한 시간 복잡도를 가지면서 동일한 표현력을 가지도록 `FxIterable` 클래스를 확장해보자.

답은 간단하다. `FxIterable`을 이터레이션 프로토콜을 따르는 값으로 만드는 것이다.

```typescript
class FxIterable<A> {
  constructor(private iterable: Iterable<A>) {}
  
  [Symbol.iterator]() {
    return this.iterable[Symbol.iterator]();
  }
  
  // ...
}

const [first, second] = fx([1, 2, 3, 4]).map(a => a + 10);
console.log(first, second); // 11 12
```

이렇게 하면 두 값을 추출하기 위해 10을 더하는 연산이 단 두 번만 실행된다.



## LISP의 확장성 - 매크로와 메타프로그래밍

LISP 계열 언어에서 매크로는 단순한 텍스트 치환이 아니라 **리스트 형태의 코드를 입력받아 리스트 형태의 코드를 반환하는 함수**라고 할 수 있다.

유명한 예제인 unless 매크로를 예로 들어보자.

```lisp
(defmacro unless [test body]
  `(if (not ~test) ~body nil))
```

unless 정의를 보면 test와 body는 매크로에게 전달되는 '코드 형태의 인자' 이다. **함수 호출에서는 인자들이 먼저 평가 된 뒤 함수에 전달되지만, 매크로에서는 인자들이 평가되지 않은 '원본 코드 형태'로 주어진다.**

이 말은 unless 매크로가 test와 body를 함수의 인자처럼 받되, 그 값을 실행하지 않고 코드 구조 자체로 취급한다는 의미다.

매크로는 코드 조각들을을 재구성하여 컴파일 타임에 새로운 코드를 뱉어내는 역할을 한다. **이로써 개발자는 손쉽게 확장할 수 있으며 이는 LISP 계열 언어가 지닌 강력한 메타프로그래밍 능력 중 하나이다.**



### 코드, 객체, 함수가 협력하여 구현한 언어의 확장

명령형 문법인 구조 분해 할당, 객체지향 디자인 패턴인 메서드 체이닝 패턴, 그리고 함수형 고차 함수가 이터레이션 프로토콜을 매개로 긴밀하게 협력하여 마치 언어를 확장한 것 같은 높은 수준의 추상화와 유연성을 확보하는 과정을 거쳤다.

```typescript
const [first, second] = fx([1, 2, 3, 4, 5, 6])
  .map(a => a + 10)
  .reject(isOdd);
```

**이 외에도 명령형 코드인 제네레이터, 객체지향 패턴인 이터레이터, 일급 함수, 클래스, 제네릭과 타입 추론등의 개념과 기능들이 서로 상호작용하며 많은 가치와 가능성을 담아내고 있다.**

또한 이 코드는 특정 도메인이나 문제를 해결하는 구현체가 아니라 어디서나 사용될 수 있는 범용적인 면모를 보여준다.

결론적으로 이 코드는 멀티패러다임적으로 구현되었으며 동시에 멀티패러다임 언어가 지원할 모든 기능과 상호작용이 가능할 범용적인 코드다.



## 마무리

언어가 제공하는 다양한 기능들이 여러 프로그래밍 패러다임과 패턴이 복합적으로 얽혀 있다는 사실을 깊이 생각해본 적이 없었다. 이터러블 프로토콜을 중심으로 한 예제를 통해 객체지향, 함수형, 명령형 패러다임이 어떻게 조화롭게 작동하는지 명확히 이해하게 되었다.

이제 새로운 기술을 접할 때 "어떻게 사용하는가"를 넘어 "어떤 패러다임에 기반하는가", "다른 패턴과 어떻게 상호작용하는가"와 같은 더 깊은 질문을 던지게될 것 같다.