/* empty css             */import{_ as w,r as d,w as D,v as I,o as n,c as l,a as t,b as c,d as m,F as x,e as T,f as S,g as _,t as u,h as p,i as b}from"./index-640c8f3b.js";const C={components:{},data(){return{isDarkTheme:!1,contentDiv:[],textarea:"",right:!0,show:!1,flag:!0,closeChat:this.close,sessionId:"",template:[],template_id:""}},async created(){let s=localStorage.getItem("dark_theme");this.isDarkTheme=s=="dark";let e=localStorage.getItem("session_id");if(e){this.sessionId=e;let r=localStorage.getItem(this.sessionId);r&&(this.contentDiv=JSON.parse(r))}this.scrollToBottom();const i=await fetch("/api/ai/templates",{method:"GET",headers:{"Content-Type":"application/json"}});this.template=await i.json(),this.template_id=this.template[0].value},watch:{isDarkTheme:{handler(s,e){e!=null&&(localStorage.setItem("dark_theme",this.isDarkTheme?"dark":"light"),this.isDarkTheme?(document.body.classList.remove("light-theme"),document.body.classList.add("dark-theme")):(document.body.classList.remove("dark-theme"),document.body.classList.add("light-theme")))},deep:!0,immediate:!0}},async mounted(){},updated(){this.scrollToBottom()},methods:{async fetchTemplate(){console.log(this.template_id);const s=await fetch(`/api/ai/template/${this.template_id}`,{method:"GET",headers:{"Content-Type":"application/json"}});this.textarea=await s.json()},scrollToBottom(){this.$nextTick(()=>{let s=this.$el.querySelector(".talk-content");s.scrollTop=s.scrollHeight})},clear(){this.sessionId&&(localStorage.removeItem(this.sessionId),localStorage.removeItem("session_id")),this.contentDiv=[],this.sessionId=""},async submit(){let s=this.textarea;if(s.trim().length==0)return;this.textarea="";let e=!1;this.contentDiv.length==0&&(e=!0);let i={name:"你",url:"",showAvartar:e,content:s,right:!0,time:new Date().toLocaleTimeString()};this.contentDiv.push(i),this.save();let r=await this.ask(s),a={name:"AI",url:"",showAvartar:e,content:r,right:!1,time:new Date().toLocaleTimeString()};this.contentDiv.push(a),this.save()},save(){this.sessionId&&localStorage.setItem(this.sessionId,JSON.stringify(this.contentDiv))},async ask(s){let i=await(await fetch("/api/ai/ask",{method:"POST",body:JSON.stringify({prompt:s,session_id:this.sessionId}),headers:{"Content-Type":"application/json"}})).json();return i.session_id&&(!this.sessionId||!this.sessionId.length)&&(this.sessionId=i.session_id,this.saveSession(this.sessionId)),i.message},saveSession(s){localStorage.setItem("session_id",s)},exit(){this.$emit("close",this.flag)}}},A={class:"talk"},B={class:"talk-header"},N=t("div",{class:"talk-message-title"},"智能AI对话",-1),j=t("div",{class:"talk-role-title"},"选择AI角色:",-1),L={class:"talk-message-clear"},E={class:"talk-content"},F={key:0},z={key:0,style:{display:"flex","justify-content":"flex-end","align-items":"center"}},V={class:"name_right"},O={style:{"font-size":"0.5rem",color:"#9b9b9b"}},J={class:"url_right"},U={class:"content_right"},G={class:"content"},K={key:1},q={key:0,style:{display:"flex","align-items":"center"}},H={class:"url_left"},M={class:"name_left"},P={style:{"font-size":"0.5rem",color:"#9b9b9b"}},Q={class:"content_left"},R={class:"content"},W={class:"talk-message"},X={class:"talk-message-content"},Y={class:"talk-message-send"};function Z(s,e,i,r,a,h){const f=d("a-select"),k=d("a-switch"),v=d("a-button"),g=d("a-avatar"),y=d("a-textarea");return D((n(),l("div",A,[t("div",B,[N,j,c(f,{class:"talk-role",dropdownClassName:"talk-role",value:a.template_id,"onUpdate:value":e[0]||(e[0]=o=>a.template_id=o),options:a.template,onChange:h.fetchTemplate},null,8,["value","options","onChange"]),t("div",L,[c(k,{"checked-children":"暗","un-checked-children":"亮",checked:a.isDarkTheme,"onUpdate:checked":e[1]||(e[1]=o=>a.isDarkTheme=o)},null,8,["checked"]),c(v,{type:"text",onClick:h.clear},{default:m(()=>[_("新会话")]),_:1},8,["onClick"])])]),t("div",E,[(n(!0),l(x,null,T(a.contentDiv,o=>(n(),l("div",null,[o.right?(n(),l("div",F,[o.showAvartar?(n(),l("div",z,[t("div",V,[t("p",O,u(o.time),1)]),t("div",J,[c(g,{shape:"circle",size:30},{default:m(()=>[_("你")]),_:1})])])):p("",!0),t("div",U,[t("pre",G,u(o.content),1)])])):p("",!0),o.right?p("",!0):(n(),l("div",K,[o.showAvartar?(n(),l("div",q,[t("div",H,[c(g,{shape:"circle",size:30,style:{backgroundColor:"#f56a00",verticalAlign:"middle"}},{default:m(()=>[_("AI")]),_:1})]),t("div",M,[t("p",P,u(o.time),1)])])):p("",!0),t("div",Q,[t("pre",R,u(o.content),1)])]))]))),256))]),t("div",W,[t("div",X,[c(y,{class:"input-area",ref:"textarea",id:"textinput",value:a.textarea,"onUpdate:value":e[2]||(e[2]=o=>a.textarea=o),autoSize:"",rows:1,onKeydown:e[3]||(e[3]=S(b(o=>h.submit(),["exact","prevent"]),["enter"]))},null,8,["value"])]),t("div",Y,[c(v,{type:"text",onClick:h.submit},{default:m(()=>[_("发送")]),_:1},8,["onClick"])])])],512)),[[I,a.flag]])}const te=w(C,[["render",Z]]);export{te as default};
