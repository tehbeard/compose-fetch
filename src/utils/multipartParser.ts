export type MultipartSection = { headers?: HeadersInit; body: Blob | ArrayBuffer | string };

export type MultipartType = "multipart/related" | "multipart/mixed";

let _counter = 0;
export const toMultipart = (
  type: MultipartType,
  ...parts: MultipartSection[]
): MultipartSection => {
  const boundaryString = `${btoa("" + Date.now())}-${_counter++}`;
  const boundaryPerFile = new TextEncoder().encode(`\r\n--${boundaryString}\r\n`);
  const boundaryEnd = new TextEncoder().encode(`\r\n--${boundaryString}--\r\n`);

  let multipartBody: (ArrayBuffer|Blob)[] = [];
  for (let part of parts) {
    let headers: HeadersInit = [];
    let body: ArrayBuffer|Blob = null;
    if (part instanceof Blob) {
      headers = [["content-type", part.type]];
      if (part instanceof File) {
        headers.push([
          "Content-Disposition",
          `attachment; filename=${part.name}`,
        ]);
      }
      body = part;
    } else {
      headers = part.headers;
      body = (typeof part.body == "string") ? new TextEncoder().encode(part.body) : part.body;
    }

    headers = new Headers(headers);
    
    multipartBody.push(boundaryPerFile);
    let headerStr = "";
    for (let [k, v] of headers.entries()) {
      headerStr += `${k}: ${v}\r\n`;
    }
    multipartBody.push(new TextEncoder().encode(`${headerStr}\r\n`));
    multipartBody.push(body);
  }

  multipartBody.push(boundaryEnd);
  
  return { headers: {'content-type': `${type}; boundary="${boundaryString}"`}, body: new Blob(multipartBody, { type }) }
  
};

export const jsonPart = (data: any, replacer = null): MultipartSection => ({
  headers: [["content-type", "application/json"]],
  body: JSON.stringify(data, replacer),
});


export const fromMultipart = ( raw: ArrayBuffer, boundary: string, stripPreambleAndTrailer: boolean = true ): MultipartSection[] => {
  
  const boundaryMarker = `\r\n--${boundary}\r\n`;
  const boundaryMarkerEnd = `\r\n--${boundary}--\r\n`;

  const parsed = splitBuffer(new Uint8Array( raw ), boundaryMarker);

  const [lastBuffer, trailer] = splitBuffer(parsed[parsed.length-1],boundaryMarkerEnd, 2);
  parsed[parsed.length-1] = lastBuffer;
  parsed.push(trailer);

  return parsed.map( (rawPart, idx) => {
    if(idx == 0){
      return { body: rawPart, isPreamble: true }
    }
    if(idx == parsed.length - 1)
    {
      return { body: rawPart, isTrailer: true }
    }
    const [headers, body ] = splitBuffer(rawPart, '\r\n\r\n', 2)
    return {
      headers: new TextDecoder().decode(headers).split("\r\n").reduce( (o, a) => ({...o, [a.substring(0, a.indexOf(": "))]: a.substring(a.indexOf(": ")+2) }), {}),
      body,
    }
  }).filter( e => {
    console.log(e, !stripPreambleAndTrailer,  !(e.isPreamble || e.isTrailer) );
    return !stripPreambleAndTrailer || !(e.isPreamble || e.isTrailer)
    
  }  );
}


export const getHeaderOption = (header, opt) => parseHeaderContent(header)[1][opt]

export const parseHeaderContent = content => {
  const [headerValue, ...parts] = content.split(';'); // $parts = explode(';', $content);
                                                      // $headerValue = array_shift($parts);
  const options = {}; //$options = array();
      // Parse options
  for(let part of parts){ // foreach ($parts as $part) {
    if(part.trim().length > 0){
      const partSplit = part.split('=');
      let [key, ...values] = partSplit;
      if(partSplit.length > 1){
        let value = values.join('=');
        if(key.endsWith("*")){
          console.warn(`Cannot decode header option '${key}' in non-utf8 charset`)
          key = key.substring(0, key.length - 1);
          const matches = value.match(/(?<charset>[\w!#$%&+^_`{}~-]+)'(?<language>[\w-]*)'(?<value>.*)$/);
          if(matches){
            /*
             $value = mb_convert_encoding(
                  rawurldecode($matches['value']),
                  'utf-8',
                  $matches['charset']
              );
            */
          }
        }
        options[key.trim()] = value.replace(/[\s\"]+$|^[\s\"]+/g,'');
      }else{
        options[key.trim()] = '';
      }

    }
  }
  return [headerValue, options];
}

//TODO: needs to appropriately consider incoming Uint8Arrays byteOffset + length
export const splitBuffer = (input: Uint8Array, delimiter: string, limit:number = null): Uint8Array[] => {
  const d = new TextEncoder().encode(delimiter);
  
  let buffers = [];

  let offset = 0;

  let data = input;

  if(input.length == 0){
    return [input];
  }

  let t = 0;
  while(t < input.length){ //Ensure we don't perma-loop
    // console.log("-----");
    t++;
    const idx = data.indexOf(d[0],offset);
    // console.log("idx", idx);
    if(idx == -1){
      buffers.push(data);
      return buffers;
    }else{
      const checkValue = new TextDecoder().decode(data.slice(idx, idx + d.length));
      // console.log({ checkValue, delimiter })
      if(checkValue == delimiter){
        buffers.push(new Uint8Array(data.buffer, data.byteOffset, idx));
        data = new Uint8Array(data.buffer, data.byteOffset + d.length + idx, data.length - (d.length + idx)  );
        if(limit !== null && (limit-1) == buffers.length){
          buffers.push(data);
          return buffers;
        }
        // console.log("new section", 0, idx, buffers.map( e => new TextDecoder().decode(e)));
        // console.log("remaining data", idx, new TextDecoder().decode(data) );
        // console.log("next index", data.indexOf(d[0]));
        offset = 0;
      }else{
        
        offset = idx + 1;
        // console.log("increasing offset to ", offset ,"using", idx )
      }
    }
  }
  throw new Error("Shouldn't escape the loop")

}
