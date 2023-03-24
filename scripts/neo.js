function chat(args) {
  // console.log(args);
  // const date = new Date();

  // return {
  //   text: `<Test>Hello, World!</Test>
  //           现在的时间是：
  //           ${date.getFullYear()}-${
  //     date.getMonth() + 1
  //   }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}
  //           `,
  // };

  const resp = Process("scripts.ai.chatgpt.Call", { prompt: args.text });
  return { text: resp.message };
}
