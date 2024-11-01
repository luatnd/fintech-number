# fintech-number

> Used in an existing fintech app to smart format number base on human need

## Features

- Auto decimal place base on the semantic, the meaning of the number
- Manual decimal place like some other libs
- Hide/show non-meaningful number, trim leading & trailing zero
- Fallback to a defined value if the number cannot be formated
- +- sign supported
- With `tinySupport`: Auto fallback to smart decimal place if the specified decimal place provide a 0 value
- Can limit max decimal to limit the digits on the UI, avoid UI overflow 
- Can round up/down/auto or 10,100,... steps 

## Getting started
```typescript
import {f, DynamicFormatOption} from 'fintech-number' 

// smart auto get short number that enough info for human
formated = f(1122.000100012) // return 1122
// show sign 
formated = f(0.0001213123, { showPlus: true }) // return +0.000121
// custom round
formated = f(1234.56789, { round: 'down' }) // return 1,234.56
```

Here the option:
```typescript
export type DynamicFormatOption = {
  decimal?: number; // default: undefined => auto choose decimal, force show decimal
  // if decimal < 0: eg, -2 => round up to step 100 => 123456.789 => 123400

  meaningful?: boolean | number; // [default true] hide non-meaningful 0 digits at first and last of number string
  round?:
    | 'up' // force round up, round up a negative number will return a bigger absolute value, eg: abs(-11) > abs(10)
    | 'down' // force round down, absolute
    | 'auto'; // default: 'auto', rule by default javascript
  defaultValue?: string; // if passed, undefined/NaN will return this default value instead
  showPlus?: boolean | number; // default: false, show "+" sign before positive number, eg: 123 => +123

  // if the number is tiny, we will try to show at least 1 meaningful number,
  // eg: f(0.0000123, {decimal: 2}) return "0"
  // eg: f(0.00000123, {decimal: 2, tinySupport: 6}) return "0.000001"
  // eg: f(0.0000123, {decimal: 2, tinySupport: 5}) return "0.00001" or "0.000012" depends.
  // tiny support always combined `decimal` option above
  tinySupport?: number;

  // if maxDecimal was specified => auto decimal might not show enough MEANINGFUL_LENGTH meaningful digit
  maxDecimal?: number;
};
```

See test cases for some example:
[index.spec.ts](test%2Findex.spec.ts)
