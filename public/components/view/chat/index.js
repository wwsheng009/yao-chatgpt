System.register(['react/jsx-runtime', 'react'], (function (exports) {
  'use strict';
  var jsx, jsxs, Fragment, react;
  return {
    setters: [function (module) {
      jsx = module.jsx;
      jsxs = module.jsxs;
      Fragment = module.Fragment;
    }, function (module) {
      react = module.default;
    }],
    execute: (function () {

      const { useState  } = react;
      const Index = exports('default', (props)=>{
          useState(undefined);
          const [prompt, setPrompt] = useState("");
          const [session_id, setSessionId] = useState(undefined);
          const [content, setContent] = useState([]);
          async function handleClick() {
              // Do something with the event
              setContent([
                  ...content,
                  {
                      content: prompt
                  }
              ]);
              await ask(prompt);
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
              let data = await response.json();
              // data = data.replace(/^\s*\n/, "");
              console.log(data);
              setContent([
                  ...content,
                  {
                      content: data.message
                  }
              ]);
              setSessionId(data.session_id);
              return data.message;
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
                              children: /*#__PURE__*/ jsx("div", {
                                  style: {
                                      display: "flex",
                                      flexDirection: "column",
                                      height: "calc(100vh - 262px)"
                                  },
                                  children: /*#__PURE__*/ jsxs(Fragment, {
                                      children: [
                                          content?.map((item)=>{
                                              return /*#__PURE__*/ jsxs(Fragment, {
                                                  children: [
                                                      /*#__PURE__*/ jsx("div", {
                                                          children: item.content
                                                      }),
                                                      /*#__PURE__*/ jsx("br", {})
                                                  ]
                                              });
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
                      })
                  ]
              })
          });
      });

    })
  };
}));
