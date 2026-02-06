declare module 'schema-dts' {
  export type WithContext<T> = T & { '@context': string };
  export type WebApplication = Record<string, unknown>;
  export type SoftwareApplication = Record<string, unknown>;
  export type FAQPage = Record<string, unknown>;
  export type HowTo = Record<string, unknown>;
}
