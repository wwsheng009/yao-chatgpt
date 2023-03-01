import react from "react";
import styles from "./index.less";
const { useState } = react;

interface IProps {
  __value: string;
}

interface Content {
  name?: String;
  url?: String;
  content: String;
  showAvartar?: Boolean;
  right?: boolean;
  time?: String;
}

const Index = (props: IProps) => {
  const { __value } = props;
  const [prompt, setPrompt] = useState("");
  const [session_id, setSessionId] = useState(undefined);
  const [content, setContent] = useState<Content[]>([
    { content: "你好，AI。", right: true },
    { content: "你好，人类，有什么可以帮到您。", right: false },
  ]);

  react.useEffect(() => {
    if (
      content &&
      content[content.length - 1] &&
      content[content.length - 1].right == true
    ) {
      setPrompt("");
      call();
    }
  }, [content]);

  async function call() {
    let data = await ask(prompt);
    // data = data.replace(/^\s*\n/, "");
    console.log(data);
    setContent([...content, { content: data.message, right: false }]);
    setSessionId(data.session_id);
  }
  async function handleClick() {
    // Do something with the event
    setContent([...content, { content: prompt, right: true }]);
  }

  async function ask(q: string): Promise<{ [key: string]: any }> {
    //对数据进行缓存
    const response = await fetch(`/api/ai/ask`, {
      method: "POST",
      body: JSON.stringify({
        prompt: q,
        session_id: session_id,
      }),
      headers: { "Content-Type": "application/json" },
    });

    return await response.json();
  }
  let handleChange = (event: {
    target: { value: react.SetStateAction<string> };
  }) => {
    setPrompt(event.target.value);
  };
  // if (!__value) return <span>-</span>;
  return (
    <div className="xgen-form-item">
      <div className="xgen-row xgen-form-item-row">
        <div className="xgen-col xgen-form-item-label"></div>
        <div className="xgen-col xgen-form-item-control">
          <div className="xgen-form-item-control-input">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                height: "calc(100vh - 262px)",
                width: "100%",
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  width: "100%",
                  flexDirection: "column",
                  fontSize: "1.5rem",
                  overflow: "auto",
                }}
              >
                {content?.map((item: Content) => {
                  if (item.right) {
                    return (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          margin: "10px",

                          padding: "10px",
                        }}
                      >
                        <div style={{ maxWidth: "80%" }}>{item.content}</div>
                      </div>
                    );
                  } else {
                    return (
                      <div
                        style={{
                          display: "flex",
                          margin: "10px",
                          border: "solid 1px gray",
                          borderRadius: "10px",
                          padding: "10px",
                        }}
                      >
                        <div style={{ maxWidth: "80%" }}>{item.content}</div>
                      </div>
                    );
                  }
                })}
              </div>

              <div style={{ display: "flex" }}>
                <textarea
                  style={{ flex: 1 }}
                  onChange={handleChange}
                  value={prompt}
                ></textarea>
                <button onClick={handleClick}>提问</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1 }}></div>
        <h1>chat</h1>

        
      </div> */}
    </div>
  );
};

export default Index;
