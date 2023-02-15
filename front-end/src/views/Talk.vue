<template>
  <div class="talk" v-show="flag">
    <div class="talk-header">
      <h2>智能AI对话</h2>
    </div>

    <div class="talk-content">
      <div v-for="item in contentDiv" style="margin-top: 20px">
        <div v-if="item.right">
          <div
            style="
              display: flex;
              justify-content: flex-end;
              align-items: center;
            "
          >
            <div class="name_right">
              <p style="font-size: 0.5rem; color: #9b9b9b">{{ item.time }}</p>
            </div>
            <!-- <div class="name_right">
              <p style="font-size: 0.5rem">{{ item.name }}</p>
            </div> -->
            <div class="url_right">
              <a-avatar shape="circle" :size="30">你</a-avatar>
            </div>
          </div>

          <div class="content_right">
            <pre>{{ item.content }}</pre>
          </div>
        </div>
        <div v-if="!item.right">
          <div style="display: flex; align-items: center">
            <div class="url_left">
              <a-avatar
                shape="circle"
                :size="30"
                :style="{ backgroundColor: '#f56a00', verticalAlign: 'middle' }"
                >AI</a-avatar
              >
            </div>
            <!-- <div class="name_left">
              <p style="font-size: 0.5rem">{{ item.name }}</p>
            </div> -->
            <div class="name_left">
              <p style="font-size: 0.5rem; color: #9b9b9b">{{ item.time }}</p>
            </div>
          </div>

          <div class="content_left">
            <pre>{{ item.content }}</pre>
          </div>
        </div>
      </div>
    </div>

    <div class="talk-message">
      <div class="talk-message-content">
        <a-textarea
          id="textinput"
          style="overflow-y: hidden"
          v-model:value="textarea"
          resize="none"
          type="textarea"
          :rows="1"
          @keypress.enter.prevent="submit"
          oninput='this.style.height = "";this.style.height = this.scrollHeight + "px"'
        ></a-textarea>
      </div>
      <div class="talk-message-send">
        <a-button type="text" @click="submit">发送</a-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import "../assets/talk.css";

interface Content {
  name: String;
  url: String;
  content: String;
  right: boolean;
  time: String;
}

export default {
  components: {},

  data() {
    return {
      contentDiv: [] as Content[],
      textarea: "",
      right: true,
      show: false,
      flag: true,
      closeChat: this.close,
    };
  },
  created() {},
  mounted() {
    this.scrollToBottom();
  },
  updated() {
    this.scrollToBottom();
  },
  methods: {
    scrollToBottom() {
      this.$nextTick(() => {
        let box = this.$el.querySelector(".talk-content");
        box.scrollTop = box.scrollHeight;
      });
    },
    sendInfo() {
      alert("aaa");
    },
    isShow() {
      // this.emotionIsShow = !this.emotionIsShow;
    },
    iptFocus() {},

    async submit() {
      let a = this.textarea;
      // console.log("content:", a);
      this.textarea = "";
      let inputbox = this.$el.querySelector("#textinput");
      inputbox.style.height = "";
      // inputbox.style.height = inputbox.scrollHeight + "px";
      let c = {
        name: "你",
        url: "",
        content: a,
        right: true,
        time: new Date().toLocaleTimeString(),
      };
      this.contentDiv.push(c);

      const response = await fetch(`/api/ai/ask`, {
        method: "POST",
        body: JSON.stringify({ prompt: a }),
        headers: { "Content-Type": "application/json" },
      });

      let data = await response.json();
      data = data.replace(/^\s*\n/, "");
      // console.log(data);
      let d = {
        name: "AI",
        url: "",
        content: data,
        right: false,
        time: new Date().toLocaleTimeString(),
      };

      this.contentDiv.push(d);
    },

    exit() {
      this.$emit("close", this.flag);
    },
  },
};
</script>
