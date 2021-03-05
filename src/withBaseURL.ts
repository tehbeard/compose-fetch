import { ComposedFetchFnFactory} from "./index";

type WithBaseFn = (base:string) => ComposedFetchFnFactory
export const withBaseURL:WithBaseFn = base => fetch => (url, init) => fetch([base, url].join("/"), init);
