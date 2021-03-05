declare module "@tehbeard/compose-fetch" {
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
}
