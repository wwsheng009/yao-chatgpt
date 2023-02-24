// Ping 远程函数
function Ping(...args) {
  return Process("scripts.jsproxy.RemoteProcess", "scripts.ping.Ping", ...args);
}
