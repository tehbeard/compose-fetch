import { ComposedFetchFnFactory } from "./index";
import { fromMultipart, getHeaderOption, toMultipart } from "./utils/multipartParser";


export const withMultipartResponse:ComposedFetchFnFactory = (fetch) => async (url, init) => {
    const resp = await fetch(url, init);

    if(resp instanceof Response && resp.headers.get('content-type').startsWith("multipart/"))
    {
        const boundary = getHeaderOption(resp.headers.get('content-type'),'boundary');
        const parts = fromMultipart(await resp.arrayBuffer(), boundary, true);
        return parts;
    }
    return resp;
};


export const withMultipartBody:ComposedFetchFnFactory = (fetch) => async (url, init) => {
    
    if(init?.body && Array.isArray(init.body))
    {
        const multipartBody = toMultipart('multipart/related', ...init.body);
        const headers = init.headers instanceof Headers ? init.headers : (new Headers(init.headers ?? {})); 
        headers.set('content-type', multipartBody.headers['content-type'])
        init = {
            ...init,
            headers,
            body: multipartBody.body
        };
    }

    return await fetch(url, init);
};