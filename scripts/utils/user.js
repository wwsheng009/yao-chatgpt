/**
 * 重置管理员密码
 * yao run scripts.utils.user.ResetAdmin 18012341234 xxx@qq.com Abcd1234+
 * @param {string} mobile 手机号码
 * @param {string} email 邮件地址
 * @param {string} password 密码
 * @returns newuser 新用户
 */
function ResetAdmin(mobile, email, password) {
  var qb = new Query();
  rc = qb.Get({
    sql: {
      stmt: "delete from xiang_user",
    },
  });

  Process("models.admin.user.create", {
    name: "Admin",
    type: "admin",
    mobile: mobile,
    email: email,
    password: password,
    status: "enabled",
  });

  const newuser = Process("models.admin.user.get", {});
  //   console.log(newuser);
  return newuser;
}
