import { ComposedFetchFnFactory, ComposedRequestInit } from "@tehbeard/compose-fetch";

type AdditionalHeaders = HeadersInit | ((url: RequestInfo, init: ComposedRequestInit) => HeadersInit);

type WithHeadersFn = (
  headersToAdd: AdditionalHeaders
) => ComposedFetchFnFactory;

export const withHeaders: WithHeadersFn = (headersToAdd: AdditionalHeaders) => (
  fetch
) => (url, init) => {
  const headers =
    init.headers instanceof Headers
      ? init.headers
      : (new Headers(init.headers ?? {}) as Headers);
  Array.from(
    (new Headers(
      (typeof headersToAdd == "function" ? headersToAdd(url, init) : headersToAdd) as HeadersInit
    ))
  ).forEach(([k, v]) => headers.append(k, v));
  return fetch(url, { ...init, headers });
};
