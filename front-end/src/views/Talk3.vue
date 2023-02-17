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
      <div class="talk-message-clear">
        <a-button type="text" @click="clear">新会话</a-button>
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
interface Conversation {
  u?: String;
  ai?: String;
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

      session_id: "",
    };
  },
  created() {
    let item = localStorage.getItem("session_id");
    if (item) {
      this.session_id = item;

      let message = localStorage.getItem(this.session_id);
      if (message) {
        this.contentDiv = JSON.parse(message);
      }
    }
  },
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

    clear() {
      if (this.session_id) {
        localStorage.removeItem(this.session_id);
        localStorage.removeItem("session_id");
        this.contentDiv = [];
        this.session_id = "";
      }
    },
    /**
     * 用户点击提问
     */
    async submit() {
      let prompt = this.textarea;
      // console.log("content:", a);
      this.textarea = "";
      let inputbox = this.$el.querySelector("#textinput");
      inputbox.style.height = "";
      // inputbox.style.height = inputbox.scrollHeight + "px";
      let c = {
        name: "你",
        url: "",
        content: prompt,
        right: true,
        time: new Date().toLocaleTimeString(),
      };
      this.contentDiv.push(c);
      this.save();
      let data = await this.ask(prompt);
      // console.log(data);
      let d = {
        name: "AI",
        url: "",
        content: data,
        right: false,
        time: new Date().toLocaleTimeString(),
      };

      this.contentDiv.push(d);
      this.save();
    },
    save() {
      if (this.session_id) {
        localStorage.setItem(this.session_id, JSON.stringify(this.contentDiv));
      }
    },

    async ask(q: string): Promise<string> {
      //对数据进行缓存

      const response = await fetch(`/api/ai/ask`, {
        method: "POST",
        body: JSON.stringify({
          prompt: q,
          session_id: this.session_id,
        }),
        headers: { "Content-Type": "application/json" },
      });

      let data = await response.json();
      // data = data.replace(/^\s*\n/, "");
      if (data.session_id && (!this.session_id || !this.session_id.length)) {
        this.session_id = data.session_id;
        this.saveSession(this.session_id);
      }

      return data.message;
    },
    saveSession(data: string) {
      localStorage.setItem("session_id", data);
    },
    exit() {
      this.$emit("close", this.flag);
    },
  },
};
</script>
