import { ComposedFetchFnFactory } from "@tehbeard/compose-fetch";
/**
 * Parse JSON body
 * @param {*} fetch 
 * @returns 
 */
export const withJSON:ComposedFetchFnFactory = fetch => async (url, init) => {
  // Handle JSON payload
  if (typeof init.body == "object" && init.body.constructor == Object) {
    init.method = ["POST", "PUT", "PATCH"].includes(init.method)
      ? init.method
      : "POST";
    init.body = JSON.stringify(init.body);
    init.headers = new Headers(init.headers ?? {});
    if (!init.headers.has("Content-Type")) {
      init.headers.set("Content-Type", "application/json");
    }
  }
  //Do the fetch
  const resp = await fetch(url, init);
  //Process any JSON response
  if (
    resp instanceof Response &&
    resp.headers.get("content-type") == "application/json"
  ) {
    if (resp.ok) {
      return await resp.json();
    } else {
      throw await resp.json();
    }
  }
  return resp;
};
