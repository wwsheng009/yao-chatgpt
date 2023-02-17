async function Main() {
  const OPENAI_KEY = "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";
  const selected = "你好";
  console.log(selected);
  var es = await fetch(
    "https://api.openai.com/v1/engines/davinci/completions",
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + OPENAI_KEY,
      },
      method: "POST",
      body: JSON.stringify({
        prompt: selected,
        temperature: 0.75,
        top_p: 0.95,
        max_tokens: 10,
        stream: true,
        stop: ["\n\n"],
      }),
    }
  );
  console.log(selected);
  const reader = es.body?.pipeThrough(new TextDecoderStream()).getReader();

  while (true) {
    const res = await reader?.read();
    if (res?.done) break;
    console.log("Received", res?.value);
  }
}
Main();
