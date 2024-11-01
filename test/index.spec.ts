import { DynamicFormatOption, DynamicNumberFormat, f } from '../src';

describe('index', () => {
  it('test_roundDecimal', () => {
    const testCases: {
      n: number;
      expected: number;
      opt?: DynamicFormatOption;
      desc?: string;
    }[] = [
      // auto
      { n: 10.123, expected: 11, opt: { round: 'up', decimal: 0 }, desc: 'round up' },
      { n: 10.123, expected: 10, opt: { round: 'down', decimal: 0 }, desc: 'round down' },
      { n: 10.123, expected: 10, opt: { round: 'auto', decimal: 0 }, desc: 'round auto down' },
      { n: 10.523, expected: 11, opt: { decimal: 0 }, desc: 'round auto up' },
      { n: 11101.123, expected: 11100, opt: { decimal: -2 }, desc: 'decimal negative round auto down' },
      { n: 11150.123, expected: 11200, opt: { decimal: -2 }, desc: 'decimal negative round auto up' },
      { n: 11101.123, expected: 11200, opt: { decimal: -2, round: 'up' }, desc: 'decimal negative force round up' },
      { n: 11100.123, expected: 11200, opt: { decimal: -2, round: 'up' }, desc: 'decimal negative force round up' },
      { n: 11199.123, expected: 11100, opt: { decimal: -2, round: 'down' }, desc: 'decimal negative force round down' },

      // zero
      { n: 0, expected: 0, opt: { decimal: -2, round: 'down' }, desc: 'zero should work' },

      // negative
      { n: -10.123, expected: -11, opt: { round: 'up', decimal: 0 }, desc: 'round up' },
      { n: -10.123, expected: -10, opt: { round: 'down', decimal: 0 }, desc: 'round down' },
      { n: -10.123, expected: -10, opt: { round: 'auto', decimal: 0 }, desc: 'round auto down' },
      { n: -10.523, expected: -11, opt: { decimal: 0 }, desc: 'round auto up' },
      { n: -11101.123, expected: -11100, opt: { decimal: -2 }, desc: 'decimal negative round auto down' },
      { n: -11150.123, expected: -11200, opt: { decimal: -2 }, desc: 'decimal negative round auto up' },
      { n: -11101.123, expected: -11200, opt: { decimal: -2, round: 'up' }, desc: 'decimal negative force round up' },
      { n: -11100.123, expected: -11200, opt: { decimal: -2, round: 'up' }, desc: 'decimal negative force round up' },
      {
        n: -11199.123,
        expected: -11100,
        opt: { decimal: -2, round: 'down' },
        desc: 'decimal negative force round down',
      },
    ];

    for (let i = 0; i < testCases.length; i++) {
      const t = testCases[i];
      const r = DynamicNumberFormat.roundDecimal(t.n, t.opt);
      expect(r).toEqual(t.expected);
    }
  });

  it('test_dynamicNumberFormat', () => {
    const testCases: {
      n: number | undefined;
      expected: string;
      opt?: DynamicFormatOption;
      desc?: string;
    }[] = [
      // auto
      { n: 10000000.123, expected: '10,000,000', opt: undefined, desc: 'normal number should work' },
      { n: 10000, expected: '10,000', opt: undefined, desc: 'normal number should work' },
      { n: 10000.123456789, expected: '10,000.1', opt: undefined, desc: 'normal number should work' },
      { n: 1000.1299, expected: '1,000.13', opt: undefined, desc: 'normal number should work' },
      { n: -1000.1299, expected: '-1,000.13', opt: undefined, desc: 'normal number should work for negative' },
      {
        n: 0.000000000123123456789,
        expected: '0.000000000123123',
        opt: undefined,
        desc: 'auto should work in range 0-1',
      },
      {
        n: 0.000000000123456789,
        expected: '0.000000000123457',
        opt: undefined,
        desc: 'auto should work in range 0 -> -1',
      },
      {
        n: -0.000000000123123456789,
        expected: '-0.000000000123123',
        opt: undefined,
        desc: 'auto should work in range 0-1',
      },
      {
        n: -0.000000000123456789,
        expected: '-0.000000000123457',
        opt: undefined,
        desc: 'auto should work in range 0 -> -1',
      },

      // zero
      { n: 0, expected: '0', opt: { decimal: -2 }, desc: 'zero' },

      // fixed decimal
      { n: 123449.789, expected: '123,400', opt: { decimal: -2 }, desc: 'decimal negative auto down' },
      {
        n: -123449.789,
        expected: '-123,400',
        opt: { decimal: -2 },
        desc: 'decimal negative with negative num auto up',
      },
      { n: 123456.789, expected: '123,500', opt: { decimal: -2 }, desc: 'decimal negative auto up' },
      {
        n: -123456.789,
        expected: '-123,500',
        opt: { decimal: -2 },
        desc: 'decimal negative with negative num auto up',
      },

      // round direction
      { n: 1234.51, expected: '1,234.51', opt: { round: 'up' }, desc: 'can round up' },
      { n: 1234.51001, expected: '1,234.52', opt: { round: 'up' }, desc: 'can round up' },
      { n: -1234.51023, expected: '-1,234.52', opt: { round: 'up' }, desc: 'can round up, negative' },
      { n: 1234.51023, expected: '1,234.51', opt: { round: 'down' }, desc: 'can round down' },
      { n: 1234.51923, expected: '1,234.51', opt: { round: 'down' }, desc: 'can round down' },
      { n: -1234.51023, expected: '-1,234.51', opt: { round: 'down' }, desc: 'can round down, negative' },

      // meaningful
      { n: 1234.50023, expected: '1,234.50', opt: { round: 'down', meaningful: false }, desc: 'meaningful' },
      {
        n: -1234.50023,
        expected: '-1,234.50',
        opt: { round: 'down', meaningful: false },
        desc: 'meaningful, negative',
      },
      { n: 0, expected: '0.0000', opt: { meaningful: false, decimal: 4 }, desc: 'meaningful, negative' },
      { n: 0, expected: '0', opt: { meaningful: false, decimal: -2 }, desc: 'meaningful, negative' },

      // tiny support
      { n: 0.0000000123, expected: '0', opt: { decimal: 2, tinySupport: 6 }, desc: 'tinySupport' },
      { n: -0.0000000123, expected: '-0', opt: { decimal: 2, tinySupport: 6 }, desc: 'tinySupport, negative' },
      { n: 0.000123456789, expected: '0.0001', opt: { decimal: 2, tinySupport: 6 }, desc: 'tinySupport' },
      { n: -0.000123456789, expected: '-0.0001', opt: { decimal: 2, tinySupport: 6 }, desc: 'tinySupport, negative' },

      // show plus
      { n: 0, expected: '+0', opt: { showPlus: 1 }, desc: 'show plus' },
      { n: -0, expected: '-0', opt: { showPlus: 1 }, desc: 'show plus' },
      { n: 0.0000000123, expected: '+0', opt: { decimal: 2, tinySupport: 6, showPlus: 1 }, desc: 'show plus' },
      {
        n: -0.0000000123,
        expected: '-0',
        opt: { decimal: 2, tinySupport: 6, showPlus: 1 },
        desc: 'show plus, negative',
      },
      { n: 0.000123456789, expected: '+0.0001', opt: { decimal: 2, tinySupport: 6, showPlus: 1 }, desc: 'show plus' },
      {
        n: -0.000123456789,
        expected: '-0.0001',
        opt: { decimal: 2, tinySupport: 6, showPlus: 1 },
        desc: 'show plus, negative',
      },

      // maxDecimal
      {
        n: 0.000123456,
        expected: '+0.000123',
        opt: { decimal: undefined, tinySupport: 5, maxDecimal: 6, showPlus: 1 },
        desc: '',
      },
    ];

    for (let i = 0; i < testCases.length; i++) {
      const t = testCases[i];
      const r = f(t.n, t.opt);
      expect(r).toEqual(t.expected);
    }
  });
});
