System.register(['react/jsx-runtime', 'react'], (function (exports) {
  'use strict';
  var jsx, jsxs, react;
  return {
    setters: [function (module) {
      jsx = module.jsx;
      jsxs = module.jsxs;
    }, function (module) {
      react = module.default;
    }],
    execute: (function () {

      const { useState  } = react;
      const Index = exports('default', (props)=>{
          const [prompt, setPrompt] = useState("");
          const [session_id, setSessionId] = useState(undefined);
          const [content, setContent] = useState([
              {
                  content: "你好，AI。",
                  right: true
              },
              {
                  content: "你好，人类，有什么可以帮到您。",
                  right: false
              }
          ]);
          react.useEffect(()=>{
              if (content && content[content.length - 1] && content[content.length - 1].right == true) {
                  setPrompt("");
                  call();
              }
          }, [
              content
          ]);
          async function call() {
              let data = await ask(prompt);
              // data = data.replace(/^\s*\n/, "");
              console.log(data);
              setContent([
                  ...content,
                  {
                      content: data.message,
                      right: false
                  }
              ]);
              setSessionId(data.session_id);
          }
          async function handleClick() {
              // Do something with the event
              setContent([
                  ...content,
                  {
                      content: prompt,
                      right: true
                  }
              ]);
          }
          async function ask(q) {
              //对数据进行缓存
              const response = await fetch(`/api/ai/ask`, {
                  method: "POST",
                  body: JSON.stringify({
                      prompt: q,
                      session_id: session_id
                  }),
                  headers: {
                      "Content-Type": "application/json"
                  }
              });
              return await response.json();
          }
          let handleChange = (event)=>{
              setPrompt(event.target.value);
          };
          // if (!__value) return <span>-</span>;
          return /*#__PURE__*/ jsx("div", {
              className: "xgen-form-item",
              children: /*#__PURE__*/ jsxs("div", {
                  className: "xgen-row xgen-form-item-row",
                  children: [
                      /*#__PURE__*/ jsx("div", {
                          className: "xgen-col xgen-form-item-label"
                      }),
                      /*#__PURE__*/ jsx("div", {
                          className: "xgen-col xgen-form-item-control",
                          children: /*#__PURE__*/ jsx("div", {
                              className: "xgen-form-item-control-input",
                              children: /*#__PURE__*/ jsxs("div", {
                                  style: {
                                      display: "flex",
                                      flexDirection: "column",
                                      height: "calc(100vh - 262px)",
                                      width: "100%"
                                  },
                                  children: [
                                      /*#__PURE__*/ jsx("div", {
                                          style: {
                                              flex: 1,
                                              display: "flex",
                                              width: "100%",
                                              flexDirection: "column",
                                              fontSize: "1.5rem",
                                              overflow: "auto"
                                          },
                                          children: content?.map((item)=>{
                                              if (item.right) {
                                                  return /*#__PURE__*/ jsx("div", {
                                                      style: {
                                                          display: "flex",
                                                          justifyContent: "flex-end",
                                                          margin: "10px",
                                                          padding: "10px"
                                                      },
                                                      children: /*#__PURE__*/ jsx("div", {
                                                          style: {
                                                              maxWidth: "80%"
                                                          },
                                                          children: item.content
                                                      })
                                                  });
                                              } else {
                                                  return /*#__PURE__*/ jsx("div", {
                                                      style: {
                                                          display: "flex",
                                                          margin: "10px",
                                                          border: "solid 1px gray",
                                                          borderRadius: "10px",
                                                          padding: "10px"
                                                      },
                                                      children: /*#__PURE__*/ jsx("div", {
                                                          style: {
                                                              maxWidth: "80%"
                                                          },
                                                          children: item.content
                                                      })
                                                  });
                                              }
                                          })
                                      }),
                                      /*#__PURE__*/ jsxs("div", {
                                          style: {
                                              display: "flex"
                                          },
                                          children: [
                                              /*#__PURE__*/ jsx("textarea", {
                                                  style: {
                                                      flex: 1
                                                  },
                                                  onChange: handleChange,
                                                  value: prompt
                                              }),
                                              /*#__PURE__*/ jsx("button", {
                                                  onClick: handleClick,
                                                  children: "提问"
                                              })
                                          ]
                                      })
                                  ]
                              })
                          })
                      })
                  ]
              })
          });
      });

    })
  };
}));
