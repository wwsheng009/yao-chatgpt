export interface HttpOption {
  url: string;
  data?: any;
  method?: string;
  headers?: any;
  onDownloadProgress?: (progressEvent: any) => void;
}

export interface Response<T = any> {
  data: T;
  message: string | null;
  status: string;
}
export function post<T = any>({
  url,
  data,
  headers,
  onDownloadProgress,
}: HttpOption) {
  const p = new Promise<Response<T>>((resolve, reject) => {
    // return new Promise((resolve, reject) => {
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        ...headers,
      },
      body: JSON.stringify({
        stream: true,
        ...data,
      }),
    })
      .then((response) => {
        const reader = response.body?.getReader();
        function readStream() {
          if (reader) {
            reader
              .read()
              .then(({ value, done }) => {
                const data = new TextDecoder().decode(value);
                // console.log(`data :${data}`);
                // console.log(`done:${done}`);
                if (!done) {
                  const lines = data.split("\n\n");
                  for (const key in lines) {
                    const line = lines[key];
                    if (line.startsWith("event:session_id\ndata:")) {
                      let sesseion_id = line.substring(
                        "event:session_id\ndata:".length
                      );
                      onDownloadProgress?.({ sesseion_id: sesseion_id });
                    } else {
                      // 有可能有nil值，还不知是哪里来的
                      if (!line.includes("event:messages")) {
                        continue;
                      }
                      let newLines = line.replace(/event:messages\n/g, "");
                      newLines = newLines.replace(/data:/g, "");
                      onDownloadProgress?.({ message: newLines });
                    }
                  }

                  return readStream();
                } else {
                  // eslint-disable-next-line no-console
                  console.log("done");
                  resolve({
                    data: { data: "" },
                    message: "",
                    status: 200,
                  } as unknown as Response<T>);
                }
              })
              .catch((error) => {
                reject(error);
              });
          }
        }
        return readStream();
      })
      .catch((error) => {
        reject(error);
      });
  });
  return p;
  // return Promise.resolve({ data: '' } as Response<T>)
}
