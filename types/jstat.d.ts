declare module 'jstat' {
  interface Distribution {
    pdf: (...args: number[]) => number;
    cdf: (...args: number[]) => number;
    inv: (...args: number[]) => number;
    mean: (...args: number[]) => number;
    variance: (...args: number[]) => number;
  }

  const jStat: {
    normal: Distribution;
    studentt: Distribution;
    chisquare: Distribution;
    centralF: Distribution;
    beta: Distribution;
    gamma: Distribution;
    exponential: Distribution;
    poisson: Distribution;
    binomial: Distribution;
    lognormal: Distribution;
    uniform: Distribution;
    weibull: Distribution;
    // Funciones estadísticas generales
    mean: (arr: number[]) => number;
    median: (arr: number[]) => number;
    stdev: (arr: number[], flag?: boolean) => number;
    variance: (arr: number[], flag?: boolean) => number;
    percentile: (arr: number[], k: number) => number;
    covariance: (arr1: number[], arr2: number[]) => number;
    corrcoeff: (arr1: number[], arr2: number[]) => number;
    sum: (arr: number[]) => number;
    min: (arr: number[]) => number;
    max: (arr: number[]) => number;
    [key: string]: unknown;
  };
  export default jStat;
}
