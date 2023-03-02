<template>
  <div class="talk" v-show="flag">
    <div class="talk-header">
      <div class="talk-message-title">智能AI对话</div>
      <div class="talk-role-title">选择AI角色:</div>
      <a-select
        class="talk-role"
        dropdownClassName="talk-role"
        v-model:value="template_id"
        :options="template"
        @change="fetchTemplate"
      ></a-select>
      <div class="talk-message-clear">
        <a-switch
          checked-children="暗"
          un-checked-children="亮"
          v-model:checked="isDarkTheme"
        />
        <a-button type="text" @click="clear">新会话</a-button>
      </div>
    </div>

    <div class="talk-content">
      <div v-for="item in contentDiv">
        <div v-if="item.right">
          <div
            style="
              display: flex;
              justify-content: flex-end;
              align-items: center;
            "
            v-if="item.showAvartar"
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
            <pre class="content">{{ item.content }}</pre>
            <!-- <div class="content" v-html="item.content"></div> -->
          </div>
        </div>
        <div v-if="!item.right">
          <div
            v-if="item.showAvartar"
            style="display: flex; align-items: center"
          >
            <div class="url_left">
              <a-avatar
                shape="circle"
                :size="30"
                :style="{ backgroundColor: '#f56a00', verticalAlign: 'middle' }"
                >AI</a-avatar
              >
            </div>
            <div class="name_left">
              <p style="font-size: 0.5rem; color: #9b9b9b">{{ item.time }}</p>
            </div>
          </div>

          <div class="content_left">
            <pre class="content">{{ item.content }}</pre>
            <!-- <div class="content" v-html="item.content"></div> -->
          </div>
        </div>
      </div>
    </div>

    <div class="talk-message">
      <div class="talk-message-content">
        <a-textarea
          class="input-area"
          ref="textarea"
          id="textinput"
          v-model:value="textarea"
          autoSize
          :rows="1"
          @keydown.enter.exact.prevent="submit()"
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
// import { marked } from "marked";
interface Content {
  name: String;
  url: String;
  content: String;
  showAvartar: Boolean;
  right: boolean;
  time: String;
}
interface Conversation {
  u?: String;
  ai?: String;
}
interface Option {
  label: string;
  value: string;
}
export default {
  components: {},

  data() {
    return {
      isDarkTheme: false,
      contentDiv: [] as Content[],
      textarea: "",
      right: true,
      show: false,
      flag: true,
      closeChat: this.close,
      sessionId: "",
      template: [] as Option[],
      template_id: "",
    };
  },
  async created() {
    let dark_theme = localStorage.getItem("dark_theme");
    this.isDarkTheme = dark_theme == "dark" ? true : false;

    let item = localStorage.getItem("session_id");
    if (item) {
      this.sessionId = item;

      let message = localStorage.getItem(this.sessionId);
      if (message) {
        this.contentDiv = JSON.parse(message);
      }
    }

    this.scrollToBottom();

    const response = await fetch(`/api/ai/templates`, {
      method: "GET",

      headers: { "Content-Type": "application/json" },
    });
    this.template = await response.json();
    this.template_id = this.template[0].value;
  },
  watch: {
    isDarkTheme: {
      handler(newVal, oldVal) {
        if (oldVal == undefined) {
          return;
        }
        localStorage.setItem("dark_theme", this.isDarkTheme ? "dark" : "light");
        if (this.isDarkTheme) {
          //  document.documentElement.style.setProperty("--bg-color", "#213547");
          //  document.documentElement.style.setProperty("--text-color", "#FFF");
          document.body.classList.remove("light-theme");
          document.body.classList.add("dark-theme");
        } else {
          //  document.documentElement.style.setProperty("--bg-color", "#ffffff");
          //  document.documentElement.style.setProperty("--text-color", "#000000");
          document.body.classList.remove("dark-theme");
          document.body.classList.add("light-theme");
        }
        // console.log(newVal, oldVal);
      },
      deep: true,
      immediate: true,
    },
  },

  async mounted() {},
  updated() {
    this.scrollToBottom();
  },
  methods: {
    async fetchTemplate() {
      console.log(this.template_id);

      const response = await fetch(`/api/ai/template/${this.template_id}`, {
        method: "GET",

        headers: { "Content-Type": "application/json" },
      });
      this.textarea = await response.json();
    },
    scrollToBottom() {
      this.$nextTick(() => {
        let box = this.$el.querySelector(".talk-content");
        box.scrollTop = box.scrollHeight;
      });
    },

    clear() {
      if (this.sessionId) {
        localStorage.removeItem(this.sessionId);
        localStorage.removeItem("session_id");
      }
      this.contentDiv = [];
      this.sessionId = "";
    },

    /**
     * 用户点击提问
     */
    async submit() {
      let prompt = this.textarea;
      if (prompt.trim().length == 0) {
        return;
      }
      this.textarea = "";
      // let inputbox = this.$el.querySelector("#textinput");
      let showAvartar = false;
      if (this.contentDiv.length == 0) {
        showAvartar = true;
      }
      let c = {
        name: "你",
        url: "",
        showAvartar: showAvartar,
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
        showAvartar: showAvartar,
        content: data,
        right: false,
        time: new Date().toLocaleTimeString(),
      };

      this.contentDiv.push(d);
      this.save();
    },
    save() {
      if (this.sessionId) {
        localStorage.setItem(this.sessionId, JSON.stringify(this.contentDiv));
      }
    },

    async ask(q: string): Promise<string> {
      //对数据进行缓存
      const response = await fetch(`/api/ai/ask`, {
        method: "POST",
        body: JSON.stringify({
          prompt: q,
          session_id: this.sessionId,
        }),
        headers: { "Content-Type": "application/json" },
      });

      let data = await response.json();
      // data = data.replace(/^\s*\n/, "");
      if (data.session_id && (!this.sessionId || !this.sessionId.length)) {
        this.sessionId = data.session_id;
        this.saveSession(this.sessionId);
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
