import { ComposedFetchFnFactory } from "./index";

/**
 * When a non OK response is given, trigger a throw with the resp so we know how to handle it
 * @param fetch 
 * @returns 
 */
export const withThrowOnBadResponse: ComposedFetchFnFactory = (fetch) => async (url,init) => {
  const resp = await fetch(url, init);
  if(resp instanceof Response && !resp.ok)
  {
    throw resp;
  }
  return resp;
};
