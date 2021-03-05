export type ComposedRequestInit = Omit<RequestInit, "body"> & {
    body: BodyInit | Object;
  }; //Override body to allow objects

  export type ComposedFetchFn = (
    input: RequestInfo,
    init?: ComposedRequestInit
  ) => Promise<any>;

  export type ComposedFetchFnFactory = (
    fetch: ComposedFetchFn
  ) => ComposedFetchFn;

export * from './utils/compose';
export * from './withBaseURL';
export * from './withHeaders';
export * from './withJSON';
export * from './withThrowOnBadResponse';