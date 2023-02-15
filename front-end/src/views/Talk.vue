<template>
  <div class="talk" v-show="flag">
    <div class="talk-header">
      <h2>智能AI对话</h2>
      <!-- <div class="talk-header-icon">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-gengduocaozuo"></use>
        </svg>
        <svg class="icon" aria-hidden="true" @click="exit">
          <use xlink:href="#icon-guanbi"></use>
        </svg>
      </div> -->
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
            <div v-text="item.content"></div>
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
            <div v-text="item.content"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="talk-message">
      <!-- <div class="talk-message-face">
        <svg class="icon" aria-hidden="true" @click="isShow">
          <use xlink:href="#icon-biaoqing"></use>
        </svg>
      </div> -->
      <div class="talk-message-content">
        <a-textarea
          style="overflow-y: hidden"
          v-model:value="textarea"
          resize="none"
          type="textarea"
          rows="1"
          @keyup.enter.native="submit"
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
// import emotion from "../components/emotion.vue";
import "../assets/talk.css";
// import { timePickerProps } from "ant-design-vue/lib/time-picker/time-picker";
// import "../utils/iconfont";

interface Content {
  name: String;
  url: String;
  content: String;
  right: boolean;
  time: String;
}

export default {
  components: {
    // emotion,
  },

  data() {
    return {
      contentDiv: [] as Content[],
      textarea: "",
      a: [],
      flag: true,
      show: false,
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
      console.log("content:", a);
      this.textarea = "";

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
