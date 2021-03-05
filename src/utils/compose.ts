import { ComposedFetchFnFactory } from '@tehbeard/compose-fetch'
/**
 * Compose takes a set of functions for transforming an input and returns a single function
 * Composition is applied right to left
 * thus compose(a,b,c)(d) is the equivalent to calling a(b(c(d))) => e(args) => a(b(c(d)))(args)
 * So a gets called to wrap first, then b and then c and then d (the original function)
 * This can be used to transform functions with the next pattern
 * e.g. for a fetch transformer:
 * const withAuth = (authHeader) => fetch => (url,init) => fetch(url, {...init, headers: {...init.headers, Authorization: authHeader } })
 * const composedFetchFunction = compose(authHeader('Basic: userPassBase64'))(fetch)
 * @param  {...any} fn
 */

type ComposeFn<T extends Function> = (...fn: T[]) => T

export const compose:ComposeFn<ComposedFetchFnFactory> = (...fn) => {
    if (fn.length == 0) {
        return s => s;
    }
    if (fn.length == 1) {
        return fn[0];
    }
    return fn.reduce((a, b) => {
        return (...args) => a(b(...args));
    });
};