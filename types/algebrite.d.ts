declare module 'algebrite' {
  const Algebrite: {
    run: (expr: string) => string;
    eval: (expr: string) => unknown;
    simplify: (expr: string) => unknown;
    derivative: (expr: string, variable: string) => unknown;
    integral: (expr: string, variable: string) => unknown;
    float: (expr: string) => unknown;
    factor: (expr: string) => unknown;
    expand: (expr: string) => unknown;
  };
  export default Algebrite;
}
