import{_ as y,r as d,w as x,v as k,o as n,c as a,a as t,F as b,b as w,d as c,e as D,f as T,g as h,t as r,h as _,i as m}from"./index-763140a7.js";const S={components:{},data(){return{contentDiv:[],textarea:"",right:!0,show:!1,flag:!0,closeChat:this.close}},created(){},mounted(){this.scrollToBottom()},updated(){this.scrollToBottom()},methods:{scrollToBottom(){this.$nextTick(()=>{let o=this.$el.querySelector(".talk-content");o.scrollTop=o.scrollHeight})},sendInfo(){alert("aaa")},isShow(){},iptFocus(){},async submit(){let o=this.textarea;this.textarea="";let i=this.$el.querySelector("#textinput");i.style.height="";let u={name:"你",url:"",content:o,right:!0,time:new Date().toLocaleTimeString()};this.contentDiv.push(u);let e=await(await fetch("/api/ai/ask",{method:"POST",body:JSON.stringify({prompt:o}),headers:{"Content-Type":"application/json"}})).json();e=e.replace(/^\s*\n/,"");let l={name:"AI",url:"",content:e,right:!1,time:new Date().toLocaleTimeString()};this.contentDiv.push(l)},exit(){this.$emit("close",this.flag)}}},B={class:"talk"},C=t("div",{class:"talk-header"},[t("h2",null,"智能AI对话")],-1),F={class:"talk-content"},z={style:{"margin-top":"20px"}},A={key:0},N={style:{display:"flex","justify-content":"flex-end","align-items":"center"}},I={class:"name_right"},V={style:{"font-size":"0.5rem",color:"#9b9b9b"}},j={class:"url_right"},K={class:"content_right"},L={key:1},q={style:{display:"flex","align-items":"center"}},H={class:"url_left"},O={class:"name_left"},$={style:{"font-size":"0.5rem",color:"#9b9b9b"}},E={class:"content_left"},J={class:"talk-message"},M={class:"talk-message-content"},P={class:"talk-message-send"};function U(o,i,u,v,e,l){const p=d("a-avatar"),f=d("a-textarea"),g=d("a-button");return x((n(),a("div",B,[C,t("div",F,[(n(!0),a(b,null,w(e.contentDiv,s=>(n(),a("div",z,[s.right?(n(),a("div",A,[t("div",N,[t("div",I,[t("p",V,r(s.time),1)]),t("div",j,[c(p,{shape:"circle",size:30},{default:h(()=>[_("你")]),_:1})])]),t("div",K,[t("pre",null,r(s.content),1)])])):m("",!0),s.right?m("",!0):(n(),a("div",L,[t("div",q,[t("div",H,[c(p,{shape:"circle",size:30,style:{backgroundColor:"#f56a00",verticalAlign:"middle"}},{default:h(()=>[_("AI")]),_:1})]),t("div",O,[t("p",$,r(s.time),1)])]),t("div",E,[t("pre",null,r(s.content),1)])]))]))),256))]),t("div",J,[t("div",M,[c(f,{id:"textinput",style:{"overflow-y":"hidden"},value:e.textarea,"onUpdate:value":i[0]||(i[0]=s=>e.textarea=s),resize:"none",type:"textarea",rows:1,onKeypress:D(T(l.submit,["prevent"]),["enter"]),oninput:'this.style.height = "";this.style.height = this.scrollHeight + "px"'},null,8,["value","onKeypress"])]),t("div",P,[c(g,{type:"text",onClick:l.submit},{default:h(()=>[_("发送")]),_:1},8,["onClick"])])])],512)),[[k,e.flag]])}const Q=y(S,[["render",U]]);export{Q as default};
