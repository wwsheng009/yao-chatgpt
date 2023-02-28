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
  const [text, setText] = useState(undefined);
  const [prompt, setPrompt] = useState("");
  const [session_id, setSessionId] = useState(undefined);
  const [content, setContent] = useState<Content[]>([]);

  async function handleClick() {
    // Do something with the event
    setContent([...content, { content: prompt }]);
    await ask(prompt);
  }

  async function ask(q: string): Promise<string> {
    //对数据进行缓存
    const response = await fetch(`/api/ai/ask`, {
      method: "POST",
      body: JSON.stringify({
        prompt: q,
        session_id: session_id,
      }),
      headers: { "Content-Type": "application/json" },
    });

    let data = await response.json();
    // data = data.replace(/^\s*\n/, "");
    console.log(data);
    setContent([...content, { content: data.message }]);
    setSessionId(data.session_id);
    return data.message;
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
              }}
            >
              <>
                {content?.map((item: Content) => {
                  return (
                    <>
                      <div>{item.content}</div>
                      <br />
                    </>
                  );
                })}

                <div style={{ display: "flex" }}>
                  <textarea
                    style={{ flex: 1 }}
                    onChange={handleChange}
                    value={prompt}
                  ></textarea>
                  <button onClick={handleClick}>提问</button>
                </div>
              </>
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
