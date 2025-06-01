# 코드:객체:함수 = Generator:Iterator:LISP = IP:OOP:FP

## 코드가 곧 데이터 - 로직이 담긴 리스트
코드를 리스트로 바라보는 사고방식은 프로그래밍 패러다임을 확장하는 강력한 도구임.

**AS-IS**
```ts
// n개의 홀수를 제곱하여 모두 더하는 함수
function sumOfSquaresOfOddNumbers(limit: number, list:number[]): number {
    let acc = 0;
    for (const a of list) {
        if (a % 2 === 1) {
            const b = a * a;
            acc += b;
            if (--limit === 0) break;
        }
    }
    return acc;
}
```
- 순회: `for (const a of list)`를 통해 list 배열의 각 요소를 순회
- 홀수 검사: `if (a % 2 === 1)`를 통해 홀수인지 검사
- 제곱 계산: `const b = a * a`를 통해 홀수의 제곱을 계산
- 누적 합계 갱신: `acc += b`를 통해 누적 합계를 갱신
- 길이 검사 및 종료: `if (--limit === 0) break`를 통해 지정된 길이만큼 처리 후 종료
- 결과 반환: `return acc`를 통해 최종 누적 합계를 반환

**TO-BE**

```ts
class FxIterable<A> {
    constructor(private iterable: Iterable<A>) {}
    
    take(limit: number): FxIterable<A> {
        return fx(take(limit, this));
    }
}

const sumbOfSquaresOfOddNumbers = (limit: number, list: number[]): number =>
    fx(list)
        .filter(a => a % 2 === 1)
        .map(a => a * a)
        .take(limit)
        .reduce((acc, b) => acc + b, 0);
```
- 순회: `fx(list)`로 순회할 지연된 리스트를 생성
- 홀수 검사: `.filter(a => a % 2 === 1)`로 홀수만 남길 지연된 리스트
- 제곱 계산: `.map(a => a * a)`로 홀수의 제곱을 계산하는 지연된 리스트
- 길이 검사 및 종료: `.take(limit)`로 limit 만큼만 순회할 지연된 리스트 생성
- 누적 합계 갱신: `.reduce((acc, b) => acc + b, 0)`로 최종 누적 합계를 계산
- 결과 반환: `=> ((()))`로 중첩된 리스트를 평가하여 누적 합계 반환

**리스트 프로세싱**은 명령형 코드 라인들을 리스트로 변환하며 함수를 값(일급 함수)으로 다루어 작은 코드들의 목록으로 복잡한 문제를 해결해나가는 것임.

## 하스켈로부터 배우기
**하스켈**은 순수 함수형 프로그래밍 언어로 평가되며 함수형 패러다임을 잘 반영하도록 설계됨.
하스켈에선 함수 시그니처를 통해 입력과 출력 타입이 명확하게 정의되어 동작을 직관적으로 파악 가능함.
```ts
function square(x: number): number {
    return x * x;
}
```
```haskell
square :: Int -> Int
square x = x * x
```

언어 수준에서 **커링** 지원함. **커링(currying)이란** 여러 인자를 받는 함수를 일련의 단일 인자를 받는 함수로 변환하는 기법임.
```haskell
-- 두 개의 Int를 받아 Int를 반환하는 함수
add: Int -> Int -> Int
add x y = x + y
```

하스켈에선 모든 프로그램이 main 함수로 시작하며 main 함수는 IO 타입을 반환함.
```haskell
main :: IO ()
main = do
    print (addFive 10)
```
- `main :: IO ()`: 함수 타입 시그니처이며 main 함수가 IO 타입 반환을 의미함.
- `()`: 의미 없는 값을 나타내며 타입스크립트의 void와 비슷한 의도를 가짐.
- `main =`: 함수 정의의 시작 부분으로 인자가 없다는 것을 의미함.
- do 구문을 사용하면 여러 개의 IO 액션 순차 실행 가능함.

하스켈은 항상 동일한 결과를 내놓는 순수성을 지향하는데 실제 프로그램은 부수 효과(사용자 입력, 파일 IO 등)가 반드시 잇따름.
이를 위해 **부수효과가 있는 함수는 IO 타입을 통해 격리하는 식으로 해결**함.  

| 함수명    | 함수 시그니처                                   | 설명                                                   |
|--------|-------------------------------------------|------------------------------------------------------|
| head   | `head :: [a] -> a`                        | 리스트의 첫 번째 요소를 반환함.                                   |
| map    | `map :: (a -> b) -> [a] -> [b]`           | 리스트 [a]의 각 요소에 함수를 적용하여 새로운 리스트 [b]를 반환함.            |
| filter | `filter :: (a -> Bool) -> [a] -> [a]`     | 리스트의 각 요소에 조건을 적용하여 조건을 만족하는 요소들로 이루어진 새로운 리스트를 반환함. |
| foldl  | `foldl :: (b -> a -> b) -> b -> [a] -> b` | 리스트의 각 요소에 함수를 적용하여 누적 결과를 반환함. (reduce와 유사)         |

하스켈에서 . 연산자는 함수 합성을 위해, $ 연산자는 합수 적용을 위해 사용함.
```haskell
main :: IO ()
main = do
    let result = f . g. h $ 5 -- f(g(h(5)))
    print result
```

하스켈에서 작성한 `sumOfSquaresOfOddNumbers` 함수는 다음과 같이 작성할 수 있음.
```haskell
sumOfSquaresOfOddNumbers :: Int -> [Int] -> Int
sumOfSquaresOfOddNumbers limit list =
    foldl (+) 0 . take limit . map square . filter odd $ list
```
코드를 오른쪽에서 왼쪽으로 읽는 경우,
1. $ list에 의해 list를 왼쪽에 합성된 함수들에게 전달
2. filter odd로 홀수만 남김
3. map square로 홀수의 제곱을 계산
4. take limit는 주어진 limit 만큼의 제곱된 값 선택
5. foldl (+) 0으로 누적 합계 계산

하스켈은 try - catch 과 같은 방식이 아닌 Either 타입을 통해 예외 처리를 함.
Either 타입은 성공(Right)과 실패(Left)를 구분함.

```haskell
safeDiv :: Int -> Int -> Either String Int
safeDiv _ 0 = Left "0으로 나눌 수 없습니다"
safeDiv x y = Right (x `div` y)
```
위의 경우 두 번째 인자가 0일 경우 Left를 반환함.
여기서 `safeDiv _ 0`의 `_`는 와일드카드 패턴으로 어떤 값이든 상관없음을 의미함.
와일드 카드가 아닌 패턴 매칭으로 각각 다른 처리 방식을 적용할 수도 있음.
```haskell
processResult :: Either String Int -> String
processResult (Left errMsg) = "오류: " ++ errMsg
processResult (Right value) = "결과: " ++ show value

main :: IO ()
main = do
    let result = safeDiv 10 0
    putStrLn (processResult result)
```

## 지연 평가 자세히 살펴보기
> 지연 평가를 지원하는 Iterator의 실제 실행 순서 살펴보기 및 find, every, some과 같은 고차 함수를 구현해보는 것을 목표로 함. 

take, map, filter 함수를 조합해 만든 중첩 이터레이터가 어떤 순서로 실행되는지 로그를 남겨 추적해보고자 함.
```ts
function* filter<A>(f: (a: A) => boolean, iterable: Iterable<A>): IterableIterator<A> {
    const iterator = iterable[Symbol.iterator]();
    while (true) {
        console.log('filter');
        const { value, done } = iterator.next();
        if (done) break;
        if (f(value)) yield value;
    }
}

function* map<A, B>(f : (a: A) => B, iterable: Iterable<A>): IterableIterator<B> {
    const iterator = iterable[Symbol.iterator]();
    
    while (true) {
        console.log('map');
        const { value, done } = iterator.next();
        if (done) break;
        yield f(value);
    }
}

function* take<A>(limit: number, iterable: Iterable<A>): IterableIterator<A> {
    const iterator = iterable[Symbol.iterator]();
    let count = 0;
    
    while (true) {
        console.log('take limit:', limit);
        const { value, done } = iterator.next();
        if (done || count >= n) break;
        yield value;
        if (--limit === 0) break;
    }
}

const iterable = fx([1,2,3,4,5])
    .filter(x => x % 2 === 1)
    .map(x => x * x)
    .take(2);

for (const a of iterable) {
    console.log('result:', a);
}
```
위의 경우 아래와 같은 실행 순서로 로그가 출력됨.
```text
take limit: 2
map
filter
result: 1
take limit: 1
map
filter
filter
result: 9
```


핵심 부분을 단순화하여 표현하면 아래와 같으며 take -> map -> filter 순으로 진행하여 결과를 반환하면서 다시 filter -> map -> take 방향으로 돌아옴.
```ts
const filtered = {
    next() {
        return iterator.next();
    }
}

const mapped = {
    next() {
        return filtered.next();
    }
}

const taked = {
    next() {
        return mapped.next();
    }
}

taked.next();
```

## 지연 평가와 안전한 합성
> 고차 함수를 리스트 프로세싱 함수 조합만으로 구현하면서 Generator:Iterator:LISP가 서로 완전히 대체될 수 있음을 확인 및 함수 합성과 안전한 값 접근 등을 확인해보는 것을 목표로 함.

find 함수는 지연된 이터레이터를 평가하여 결과를 만드는 유형의 함수임.
이터러블을 순회하면서 요소마다 f로 조건을 검사하여 참으로 평가되는 첫 번째 요소 반환함.
단, 만족하는 값이 하나도 없을 땐 undefined 반환함.
```ts
type Find = <A>(f: (a: A) => boolean, iterable: Iterable<A>) => A | undefined;
```

하스켈의 find 함수 시그니처는 다음과 같음.
(a -> Bool) 타입의 함수와 [a] 타입 리스트를 받아서 Maybe a 타입의 값을 반환함을 나타냄.
```haskell
find :: (a -> Bool) -> [a] -> Maybe a
```

명령형 코드로 작성된 find 함수는 다음과 같음.
```ts
function find<A>(f: (a: A) => boolean, iterable: Iteralb)
```
