import { ComposedFetchFnFactory} from "@tehbeard/compose-fetch";

type WithBaseFn = (base:string) => ComposedFetchFnFactory
export const withBaseURL:WithBaseFn = base => fetch => (url, init) => fetch([base, url].join("/"), init);
