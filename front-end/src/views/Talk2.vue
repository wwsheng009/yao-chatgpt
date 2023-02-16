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

      conversation: [] as Conversation[],
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
    },
    async ask(q: string): Promise<string> {
      //对数据进行缓存
      this.conversation.push({
        u: q,
      });

      const response = await fetch(`/api/ai/ask2`, {
        method: "POST",
        body: JSON.stringify({
          prompt: q,
          conversation: this.conversation,
        }),
        headers: { "Content-Type": "application/json" },
      });

      let data = await response.json();
      // data = data.replace(/^\s*\n/, "");
      this.conversation.push({
        ai: data,
      });

      this.checkLenAndDelete();

      return data;
    },
    checkLenAndDelete() {
      let total = 0;
      let idx = 0;
      for (let index = this.conversation.length - 1; index >= 0; index--) {
        const element = this.conversation[index];
        if (element.u) {
          total += element.u?.length;
        } else if (element.ai) {
          total += element.ai?.length;
        }
        if (total > 10240) {
          idx = index;
          break;
        }
      }
      console.log(idx);
      console.log(this.conversation);
      while (idx > 0);
      {
        this.conversation.shift();
        idx--;
      }
    },

    exit() {
      this.$emit("close", this.flag);
    },
  },
};
</script>
