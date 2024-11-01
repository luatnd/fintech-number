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

export class DynamicNumberFormat {
  // rounding with auto decimal always have minimum of 6 meaningful digits
  static MEANINGFUL_LENGTH = 6;
  // changed to opt.tinySupport
  // static MIN_TINY_SUPPORT = 1e-6; // if the number is smaller than this, it is considered "0", cannot apply tinySupport
  static EMPTY_NUMBER = '--';
  static DEBUG = false;

  static safeFormat(n: number | undefined, opt: DynamicFormatOption = {}): string {
    try {
      return DynamicNumberFormat.format(n, opt);
    } catch (e) {
      console.error('{safeFormat} e: ', e);
      return n?.toString() ?? this.defaultValue(opt);
    }
  }

  static format(n: number | undefined, opt: DynamicFormatOption = {}): string {
    if (n === undefined || isNaN(n)) {
      return this.defaultValue(opt);
    }

    // parse option with default value
    const meaningful = opt?.meaningful !== false; // default true

    // tryna format
    // eslint-disable-next-line prefer-const
    let { rounded, decimal } = this.dynamicRound(n, opt);
    this.DEBUG && console.log('{dynamicNumberFormat} rounded, decimal: ', rounded, decimal);

    // support negative decimal:
    // 12345678.89 and decimal -2 = 12345600
    if (decimal && decimal < 0) {
      decimal = 0; // rounded has been already rounded with negative decimal, so we don't need to round anymore
    }

    const optFmt: Intl.NumberFormatOptions = {
      minimumFractionDigits: meaningful ? 0 : decimal,
      maximumFractionDigits: decimal,
    };
    // if (opt.minDecimal) optFmt.minimumFractionDigits = minDecimal as number
    // if (opt.maxDecimal) optFmt.maximumFractionDigits = maxDecimal as number

    let prettyNum = new Intl.NumberFormat('en-US', optFmt).format(rounded);
    // if (meaningful) {
    //   // rm leading and trailing zero
    //   prettyNum = prettyNum
    //     // .replace(/^0+(?=\d)/, '') // format from number so we never have leading zero
    //     .replace(/(\.\d*?[1-9])0+$/, '$1')
    //     .replace(/\.0+$/, '')
    // }

    if (opt.showPlus && n >= 0 && prettyNum.charAt(0) !== '-') {
      prettyNum = `+${prettyNum}`;
    }

    return prettyNum;
  }

  static dynamicRound(
    n: number,
    opt: DynamicFormatOption = {},
  ): {
    rounded: number;
    decimal: number;
  } {
    // fixed decimal
    if (opt.decimal !== undefined) {
      // console.log('{dynamicNumberRound} dynamicDecimal 2: ', n, opt);
      let rounded = this.roundDecimal(n, opt);
      let decimal = opt.decimal;
      const tinyDecimal = opt.tinySupport ?? 0; // default is not support tiny
      const minTinySupport = Math.pow(10, -tinyDecimal);
      if (Math.abs(n) >= minTinySupport && rounded === 0 && tinyDecimal > 0) {
        rounded = 0;
        const maxZeroAfterPeriodChar = Math.log10(1 / minTinySupport);
        while (rounded === 0 && decimal <= maxZeroAfterPeriodChar) {
          decimal += 2; // jump 2 step at once
          rounded = this.roundDecimal(n, { ...opt, decimal: decimal });
        }
        this.DEBUG && console.log('{dynamicNumberFormat} rounded, decimal with tinySupport: ', rounded, decimal);
      }

      return {
        rounded: rounded,
        decimal: decimal,
      };
    }

    const dynamicDecimal = this.getDecimal(n);
    this.DEBUG && console.log('{dynamicNumberRound} dynamicDecimal 2: ', dynamicDecimal);

    return {
      rounded: this.roundDecimal(n, { ...opt, decimal: Math.min(dynamicDecimal, opt.maxDecimal ?? 9999) }),
      decimal: dynamicDecimal,
    };
  }

  static roundDecimal(n: number, opt: any) {
    // this also support negative decimal
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const p = Math.pow(10, opt.decimal);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    switch (opt.round) {
      case 'up':
        return n > 0 ? Math.ceil(n * p) / p : Math.floor(n * p) / p;
      case 'down':
        return n > 0 ? Math.floor(n * p) / p : Math.ceil(n * p) / p;
      case 'auto':
      default:
        return Math.round(n * p) / p;
    }
  }

  // auto smart decimal
  static getDecimal(n: number): number {
    const MeaningfulLength = this.MEANINGFUL_LENGTH;
    let dynamicDecimal = 0;
    const positiveN = Math.abs(n);
    if (Math.abs(n) >= 1) {
      const intDigitCount = Math.floor(Math.log10(positiveN)) + 1;
      dynamicDecimal = intDigitCount > MeaningfulLength ? 0 : MeaningfulLength - intDigitCount;
      this.DEBUG && console.log('{dynamicNumberRound} intDigitCount, dynamicDecimal: ', intDigitCount, dynamicDecimal);
    } else {
      // it's +-0.0000abcdefghi => zeroAfterDecimalPlace=-4
      const zeroAfterDecimalPlace = positiveN === 0 ? 0 : Math.floor(Math.log10(positiveN)) + 1;

      // +-0.0000abcdef
      dynamicDecimal = zeroAfterDecimalPlace > MeaningfulLength ? 0 : MeaningfulLength - zeroAfterDecimalPlace;
    }

    this.DEBUG && console.log('{getDecimal} dynamicDecimal: ', dynamicDecimal);

    return dynamicDecimal;
  }

  static defaultValue(opt: DynamicFormatOption = {}): string {
    return opt.defaultValue !== undefined ? opt.defaultValue : this.EMPTY_NUMBER;
  }
}

// use this for short
// See DynamicFormatOption for usage
// eslint-disable-next-line @typescript-eslint/unbound-method
export const f = DynamicNumberFormat.safeFormat;
