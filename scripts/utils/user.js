/**
 * 重置管理员密码
 * @param {string} mobile 手机号码
 * @param {string} email 邮件地址
 * @param {string} password 密码
 * @returns newuser 新用户
 */
function ResetAdmin(mobile, email, password) {
  var qb = new Query("xiang");
  rc = qb.Get({
    sql: {
      stmt: "delete from xiang_user",
    },
  });

  Process("models.xiang.user.create", {
    name: "Admin",
    type: "admin",
    mobile: mobile,
    email: email,
    password: password,
    status: "enabled",
  });

  const newuser = Process("models.xiang.user.get", {});
  //   console.log(newuser);
  return newuser;
}
