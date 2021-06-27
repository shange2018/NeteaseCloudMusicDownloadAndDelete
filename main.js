"ui";
var myapp = {}
myapp.执行数量 = "99"
myapp.存储标识 = "wyyyy"
myapp.xialasy = "0"
myapp.sdk = ""
var mainThread = 0
var 悬浮创建 = 0
var 执行数量 = 0
ui.layout(
    <ScrollView >
        <vertical>
            <appbar>
                <toolbar id="toolbar" title="网易云音乐下载删除" />
            </appbar>

            <card w="*" h="auto" margin="10 5" cardCornerRadius="2dp" cardElevation="1dp" gravity="center_vertical">
                <vertical padding="18 8" h="auto">
                    <linear>
                        <Switch id="autoService" text="无障碍权限" checked="{{auto.service != null}}" w="auto" textStyle="bold" />
                        <Switch id="overlayService" text="悬浮窗权限" checked="{{auto.service != null}}" w="auto" textStyle="bold" />
                    </linear>
                </vertical>
                <View bg="#E51400" h="*" w="5" />
            </card>

            <card w="*" h="auto" margin="10 5" cardCornerRadius="2dp" cardElevation="1dp" gravity="center_vertical">
                <vertical padding="18 8" h="auto">
                    <linear>
                        <text text="注册码：" textcolor="black" w="auto" />
                        <input id="sdk" hint="输入注册码激活脚本" inputType="text" text="" w="*" />
                    </linear>
                </vertical>
                <View bg="#E51400" h="*" w="5" />
            </card>

            <card w="*" h="auto" margin="10 5" cardCornerRadius="2dp" cardElevation="1dp" gravity="center_vertical">
                <vertical padding="18 8" h="auto">
                    <linear>
                        <text text="操作次数" textcolor="black" w="auto" />
                        <input id="执行数量" inputType="text" text="" w="120" />
                        <text text="次" textcolor="black" w="auto" />
                    </linear>
                </vertical>
                <View bg="#ff5722" h="*" w="5" />
            </card>

            <button style="Widget.AppCompat.Button.Colored" margin="5" id="start">保存脚本设置</button>
        </vertical>
    </ScrollView>
);
读取界面配置(true)
ui.autoService.on("check", function (checked) {
    // 用户勾选无障碍服务的选项时，跳转到页面让用户去开启
    if (checked && auto.service == null) {
        app.startActivity({
            action: "android.settings.ACCESSIBILITY_SETTINGS"
        });
    }
    if (!checked && auto.service != null) {
        auto.service.disableSelf();
    }
});
ui.emitter.on("resume", function () {
    // 此时根据无障碍服务的开启情况，同步开关的状态

    ui.autoService.checked = auto.service != null;
});
ui.overlayService.on("check", function (checked) {
    // 用户勾选无障碍服务的选项时，跳转到页面让用户去开启
    if (checked) {
        try {
            int = app.startActivity({
                packageName: "com.android.settings",
                className: "com.android.settings.Settings$AppDrawOverlaySettingsActivity",
                data: "package:" + context.getPackageName().toString()
            });
        } catch (err) {
            app.openAppSetting(getPackageName("网易云音乐下载删除"));
        }
        toast("请打开悬浮窗开关");
    }

    if (!checked && auto.service != null) {
        //auto.service.disableSelf();
        toast("已关闭悬浮窗权限");
    }
});

ui.start.on("click", () => {   //按钮单击事件 哪个按钮 start 需要修改这个ID
    保存界面配置()          //先读取配置
    读取界面配置(false)
    if (auto.service == null) {
        toastLog("请先开启无障碍服务！");
        return
    };
    if (悬浮创建 == 0) {
        let pjysdk = new PJYSDK("", "");
        pjysdk._protocol = "https"
        pjysdk.debug = true;
        pjysdk.SetCard(myapp.sdk);
        let login_ret = pjysdk.CardLogin();  //正常登录
        //   let login_ret = pjysdk.TrialLogin()    //试用登录
        if (login_ret.code == 0) {
            // 登录成功，后面写你的业务代码
            toast('到期时间 ' + pjysdk.login_result.expires)
            pjysdk.event.on("heartbeat_failed", function (hret) {
                addlog("心跳失败，尝试重登")
                let login_ret = pjysdk.CardLogin();
                if (login_ret.code == 0) {
                    addlog("重登成功");
                } else {
                    alert(login_ret.message);  // 重登失败
                    exit();  // 退出脚本
                }
            });
            events.on("exit", function () {
                pjysdk.CardLogout(); // 调用退出登录
                //  log(pjysdk.TrialLogout())  //试用退出登录
                toast('脚本进程已结束');
            });
        } else {
            // 登录失败提示
            alert(login_ret.message);
            return
        }
        threads.start(function () {
            floatyLogInit(5, 0, 10, true)
        })
        // 屏蔽音量键调节声音
        events.setKeyInterceptionEnabled("volume_up", true);
        events.setKeyInterceptionEnabled("volume_down", true);
        events.observeKey();
        //监听音量键按下
        events.onKeyDown("volume_up", () => {
            exit()
        });
        events.onKeyDown("volume_down", () => {
            if (mainThread == 0) {
                mainThread = threads.start(APP_main);
            } else {
                addlog('脚本停止运行')
                mainThread.interrupt();
                mainThread = 0
            }
        });
        悬浮创建 = 1
    }
    home()
    toast('脚本转入后台')
});

function APP_main() {
    addlog('脚本开始运行')
    var 删除成功 = false
    var 下载成功 = false
    var 下载计次 = 0
    while (true) {
        if (id('com.netease.cloudmusic:id/downloadBlock').findOnce()) {
            if (!下载成功) {
                if (下载计次 >= 2) {
                    下载计次 = 0
                    下载成功 = true
                } else {
                    addlog('点击下载')
                    Click(id('com.netease.cloudmusic:id/downloadBlock').findOnce())
                    下载计次++
                }
            } else if (!删除成功) {
                addlog('点击更多')
                Click(desc('更多').findOnce())
            } else {
                下载成功 = false
                删除成功 = false
                下载计次 = 0
                执行数量++
                if (执行数量 >= parseInt(myapp.执行数量)) {
                    addlog('当前下载删除任务完成 脚本停止')
                    return
                } else {
                    addlogEX('操作次数：' + 执行数量 + '/' + myapp.执行数量)
                }
            }
        } else if (text('删除').findOnce()) {
            addlog('点击删除')
            Click(text('删除').findOnce())
            删除成功 = true
        } else if (text('清空下载文件').findOnce()) {
            addlog('清空下载文件')
            Click(text('清空下载文件').findOnce())
        } else if (textContains('下载音质').findOnce()) {
            addlog('选择下载音质标准')
            Click(textContains('标准').findOnce())
        } else if (text('下载').findOnce()) {
            addlog('点击确认下载')
            Click(text('下载').findOnce())
            下载成功 = true
        }
        sleep(1000)
    }
}
function Click(node) {
    try {
        if (node) {
            if (node.click()) {
                return true
            } else if (node.parent().click()) {
                return true
            } else if (node.parent().parent().click()) {
                return true
            } else if (node.parent().parent().parent().click()) {
                return true
            } else if (node.parent().parent().parent().parent().click()) {
                return true
            } else if (node.parent().parent().parent().parent().parent().click()) {
                return true
            } else if (node.parent().parent().parent().parent().parent().parent().click()) {
                return true
            }
        }
    } catch (e) { }
    return false
}
function floatyLogInit(linesCount, x, y, islog) {
    let _linesCount = linesCount || 6;
    if (typeof _linesCount != 'number') _linesCount = 6;
    if (typeof x != 'number') x = 0;
    if (typeof y != 'number') y = 10;
    if (typeof islog != 'boolean') islog = true;
    let initX = x
    let initY = y
    floatyLogW = floaty.rawWindow(
        <card w="*" h="auto" marginLeft="3" cardBackgroundColor='#66242424' cardCornerRadius="8dp" cardElevation="1dp" gravity="center_vertical">
            <vertical paddingLeft="5" paddingRight="5" w='*'>
                <Chronometer id='chronometer' textSize="13dp" textColor="#DC143C" w="*" style="Widget/AppCompat.Button.Borderless" textStyle='bold' />
                <button id='logEX' textSize="13dp" textColor="#20B2AA" style="Widget/AppCompat.Button.Borderless" textStyle='bold'
                    layout_weight='5' layout_width="wrap_content" layout_height="wrap_content" />

                <button id='log' textSize="13dp" textColor="#FFD700" style="Widget/AppCompat.Button.Borderless" textStyle='bold'
                    layout_gravity="right" layout_weight='5' layout_width="wrap_content" layout_height="wrap_content" />
            </vertical>
        </card>
    );
    let nowlogArr = [];
    addlog = function () {
        let s = '[' + dateFormat(new Date(), "HH:mm:ss") + '] '
        for (let param of arguments) s += param + ' ';
        nowlogArr.push(s);
        if (nowlogArr.length > _linesCount) nowlogArr.shift();
        let printContent = nowlogArr.join('\n');
        ui.run(() => { floatyLogW.log.text(printContent) })
        if (islog) log(s);
    }

    addlogEX = function (printContent) {
        ui.run(() => { floatyLogW.logEX.text(printContent) })
    }

    floatyLogShow = function (x, y) {
        let _x = x || initX
        let _y = y || initY
        ui.run(() => { floatyLogW.setPosition(_x, _y) })
    }

    floatyLogHide = function () {
        ui.run(() => { floatyLogW.setPosition(3000, 3000) })
    }

    function dateFormat(date, fmt_str) {
        return java.text.SimpleDateFormat(fmt_str).format(new Date(date || new Date()));
    }

    ui.run(() => {
        addlog('音量-键 【启动】【停止】脚本')
        addlog('音量+键 【结束】脚本进程')
        addlogEX('操作次数：' + 执行数量 + '/' + myapp.执行数量)
        floatyLogW.chronometer.setFormat('[运行时间] %s')
        floatyLogW.chronometer.start()
        floatyLogW.setTouchable(false);
        floatyLogW.setPosition(x, y);
    })
}
function 保存界面配置() {
    保存本地数据(myapp.存储标识, "执行数量", ui.执行数量.text())
    保存本地数据(myapp.存储标识, "sdk", ui.sdk.text())
};
function 读取界面配置(是否设置组件值) {   //逻辑值 是否设置组件值
    if (读取本地数据(myapp.存储标识, "执行数量") != undefined) {
        myapp.执行数量 = 读取本地数据(myapp.存储标识, "执行数量")
    };
    是否设置组件值 && ui.执行数量.setText(myapp.执行数量);

    if (读取本地数据(myapp.存储标识, "sdk") != undefined) {
        myapp.sdk = 读取本地数据(myapp.存储标识, "sdk")
    };
    是否设置组件值 && ui.sdk.setText(myapp.sdk);

};
function 保存本地数据(存储标识, ID, 界面组件值) {
    const storage = storages.create(存储标识);  //创建storage对象
    storage.put(ID, 界面组件值);
};
function 读取本地数据(存储标识, ID) {
    const storage = storages.create(存储标识);  //创建storage对象
    if (storage.contains(ID)) {
        return storage.get(ID, "");
    };
    //默认返回undefined
};
const PJYSDK = (function () {
    function PJYSDK(app_key, app_secret) {
        http.__okhttp__.setMaxRetries(0);
        http.__okhttp__.setTimeout(10 * 1000);
        this.event = events.emitter();
        this.debug = true;
        this._lib_version = "v1.08";
        this._protocol = "https";
        this._host = "api.paojiaoyun.com";
        this._device_id = this.getDeviceID();
        this._retry_count = 9;

        this._app_key = app_key;
        this._app_secret = app_secret;

        this._card = null;
        this._username = null;
        this._password = null;
        this._token = null;

        this.is_trial = false;  // 是否是试用用户
        this.login_result = {
            "card_type": "",
            "expires": "",
            "expires_ts": 0,
            "config": "",
        };

        this._auto_heartbeat = true;  // 是否自动开启心跳任务
        this._heartbeat_gap = 60 * 1000; // 默认60秒
        this._heartbeat_task = null;
        this._heartbeat_ret = { "code": -9, "message": "还未开始验证" };

        this._prev_nonce = null;
    }
    PJYSDK.prototype.SetCard = function (card) {
        this._card = card.trim();
    }
    PJYSDK.prototype.SetUser = function (username, password) {
        this._username = username.trim();
        this._password = password;
    }
    PJYSDK.prototype.getDeviceID = function () {
        let id = device.serial;
        if (id == null || id == "" || id == "unknown") {
            id = device.getAndroidId();
        }
        if (id == null || id == "" || id == "unknown") {
            id = device.getIMEI();
        }
        return id;
    }
    PJYSDK.prototype.MD5 = function (str) {
        try {
            let digest = java.security.MessageDigest.getInstance("md5");
            let result = digest.digest(new java.lang.String(str).getBytes("UTF-8"));
            let buffer = new java.lang.StringBuffer();
            for (let index = 0; index < result.length; index++) {
                let b = result[index];
                let number = b & 0xff;
                let str = java.lang.Integer.toHexString(number);
                if (str.length == 1) {
                    buffer.append("0");
                }
                buffer.append(str);
            }
            return buffer.toString();
        } catch (error) {
            alert(error);
            return "";
        }
    }
    PJYSDK.prototype.getTimestamp = function () {
        try {
            let res = http.get("http://api.m.taobao.com/rest/api3.do?api=mtop.common.getTimestamp");
            let data = res.body.json();
            return Math.floor(data["data"]["t"] / 1000);
        } catch (error) {
            return Math.floor(new Date().getTime() / 1000);
        }
    }
    PJYSDK.prototype.genNonce = function () {
        const ascii_str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let tmp = '';
        for (let i = 0; i < 20; i++) {
            tmp += ascii_str.charAt(Math.round(Math.random() * ascii_str.length));
        }
        return this.MD5(this.getDeviceID() + tmp);
    }
    PJYSDK.prototype.joinParams = function (params) {
        let ps = [];
        for (let k in params) {
            ps.push(k + "=" + params[k])
        }
        ps.sort()
        return ps.join("&")
    }
    PJYSDK.prototype.CheckRespSign = function (resp) {
        if (resp.code != 0 && resp.nonce === "" && resp.sign === "") {
            return resp
        }

        let ps = "";
        if (resp["result"]) {
            ps = this.joinParams(resp["result"]);
        }

        let s = resp["code"] + resp["message"] + ps + resp["nonce"] + this._app_secret;
        let sign = this.MD5(s);
        if (sign === resp["sign"]) {
            if (this._prev_nonce === null) {
                this._prev_nonce = resp["nonce"];
                return { "code": 0, "message": "OK" };
            } else {
                if (resp["nonce"] > this._prev_nonce) {
                    this._prev_nonce = resp["nonce"];
                    return { "code": 0, "message": "OK" };
                } else {
                    return { "code": -98, "message": "轻点，疼~" };
                }
            }
        }
        return { "code": -99, "message": "轻点，疼~" };
    }
    PJYSDK.prototype.retry_fib = function (num) {
        if (num > 9) {
            return 34
        }
        let a = 0;
        let b = 1;
        for (i = 0; i < num; i++) {
            let tmp = a + b;
            a = b
            b = tmp
        }
        return a
    }
    PJYSDK.prototype._debug = function (path, params, result) {
        if (this.debug) {
            //  log("\n" + path, "\nparams:", params, "\nresult:", result);
        }
    }
    PJYSDK.prototype.Request = function (method, path, params) {
        // 构建公共参数
        params["app_key"] = this._app_key;

        method = method.toUpperCase();
        let url = this._protocol + "://" + this._host + path
        let max_retries = this._retry_count;
        let retries_count = 0;

        let data = { "code": -1, "message": "连接服务器失败" };
        do {
            retries_count++;
            let sec = this.retry_fib(retries_count);

            delete params["sign"]
            params["nonce"] = this.genNonce();
            params["timestamp"] = this.getTimestamp();
            let ps = this.joinParams(params);
            let s = method + this._host + path + ps + this._app_secret;
            let sign = this.MD5(s);
            params["sign"] = sign;

            let resp, body;
            try {
                if (method === "GET") {
                    resp = http.get(url + "?" + ps + "&sign=" + sign);
                } else {  // POST
                    resp = http.post(url, params);
                }
                body = resp.body.string();
                data = JSON.parse(body);
                this._debug(method + '-' + path + ':', params, data);

                let crs = this.CheckRespSign(data);
                if (crs.code !== 0) {
                    return crs;
                } else {
                    return data;
                }
            } catch (error) {
                log("[*] request error: ", error, sec + "s后重试");
                this._debug(method + '-' + path + ':', params, body)
                sleep(sec * 1000);
            }
        } while (retries_count < max_retries);

        return data;
    }
    /* 通用 */
    PJYSDK.prototype.GetHeartbeatResult = function () {
        return this._heartbeat_ret;
    }
    PJYSDK.prototype.GetTimeRemaining = function () {
        let g = this.login_result.expires_ts - this.getTimestamp();
        if (g < 0) {
            return 0;
        }
        return g;
    }
    /* 卡密相关 */
    PJYSDK.prototype.CardLogin = function () {  // 卡密登录
        if (!this._card) {
            return { "code": -4, "message": "请先设置卡密" };
        }
        let method = "POST";
        let path = "/v1/card/login";
        let data = { "card": this._card, "device_id": this._device_id };
        let ret = this.Request(method, path, data);
        if (ret.code == 0) {
            this._token = ret.result.token;
            this.login_result = ret.result;
            if (this._auto_heartbeat) {
                this._startCardHeartheat();
            }
        }
        return ret;
    }
    PJYSDK.prototype.CardHeartbeat = function () {  // 卡密心跳，默认会自动调用
        if (!this._token) {
            return { "code": -2, "message": "请在卡密登录成功后调用" };
        }
        let method = "POST";
        let path = "/v1/card/heartbeat";
        let data = { "card": this._card, "token": this._token };
        let ret = this.Request(method, path, data);
        if (ret.code == 0) {
            this.login_result.expires = ret.result.expires;
            this.login_result.expires_ts = ret.result.expires_ts;
        }
        return ret;
    }
    PJYSDK.prototype._startCardHeartheat = function () {  // 开启卡密心跳任务
        if (this._heartbeat_task) {
            this._heartbeat_task.interrupt();
            this._heartbeat_task = null;
        }
        this._heartbeat_task = threads.start(function () {
            setInterval(function () { }, 10000);
        });
        this._heartbeat_ret = this.CardHeartbeat();

        this._heartbeat_task.setInterval((self) => {
            self._heartbeat_ret = self.CardHeartbeat();
            if (self._heartbeat_ret.code != 0) {
                self.event.emit("heartbeat_failed", self._heartbeat_ret);
            }
        }, this._heartbeat_gap, this);

        this._heartbeat_task.setInterval((self) => {
            if (self.GetTimeRemaining() == 0) {
                self.event.emit("heartbeat_failed", { "code": 10210, "message": "卡密已过期！" });
            }
        }, 1000, this);
    }
    PJYSDK.prototype.CardLogout = function () {  // 卡密退出登录
        this._heartbeat_ret = { "code": -9, "message": "还未开始验证" };
        if (this._heartbeat_task) { // 结束心跳任务
            this._heartbeat_task.interrupt();
            this._heartbeat_task = null;
        }
        if (!this._token) {
            return { "code": 0, "message": "OK" };
        }
        let method = "POST";
        let path = "/v1/card/logout";
        let data = { "card": this._card, "token": this._token };
        let ret = this.Request(method, path, data);
        // 清理
        this._token = null;
        this.login_result = {
            "card_type": "",
            "expires": "",
            "expires_ts": 0,
            "config": "",
        };
        return ret;
    }
    PJYSDK.prototype.CardUnbindDevice = function () { // 卡密解绑设备，需开发者后台配置
        if (!this._token) {
            return { "code": -2, "message": "请在卡密登录成功后调用" };
        }
        let method = "POST";
        let path = "/v1/card/unbind_device";
        let data = { "card": this._card, "device_id": this._device_id, "token": this._token };
        return this.Request(method, path, data);
    }
    PJYSDK.prototype.SetCardUnbindPassword = function (password) { // 自定义设置解绑密码
        if (!this._token) {
            return { "code": -2, "message": "请在卡密登录成功后调用" };
        }
        let method = "POST";
        let path = "/v1/card/unbind_password";
        let data = { "card": this._card, "password": password, "token": this._token };
        return this.Request(method, path, data);
    }
    PJYSDK.prototype.CardUnbindDeviceByPassword = function (password) { // 用户通过解绑密码解绑设备
        let method = "POST";
        let path = "/v1/card/unbind_device/by_password";
        let data = { "card": this._card, "password": password };
        return this.Request(method, path, data);
    }
    PJYSDK.prototype.CardRecharge = function (card, use_card) { // 以卡充卡
        let method = "POST";
        let path = "/v1/card/recharge";
        let data = { "card": card, "use_card": use_card };
        return this.Request(method, path, data);
    }
    /* 用户相关 */
    PJYSDK.prototype.UserRegister = function (username, password, card) {  // 用户注册（通过卡密）
        let method = "POST";
        let path = "/v1/user/register";
        let data = { "username": username, "password": password, "card": card, "device_id": this._device_id };
        return this.Request(method, path, data);
    }
    PJYSDK.prototype.UserLogin = function () {  // 用户账号登录
        if (!this._username || !this._password) {
            return { "code": -4, "message": "请先设置用户账号密码" };
        }
        let method = "POST";
        let path = "/v1/user/login";
        let data = { "username": this._username, "password": this._password, "device_id": this._device_id };
        let ret = this.Request(method, path, data);
        if (ret.code == 0) {
            this._token = ret.result.token;
            this.login_result = ret.result;
            if (this._auto_heartbeat) {
                this._startUserHeartheat();
            }
        }
        return ret;
    }
    PJYSDK.prototype.UserHeartbeat = function () {  // 用户心跳，默认会自动开启
        if (!this._token) {
            return { "code": -2, "message": "请在用户登录成功后调用" };
        }
        let method = "POST";
        let path = "/v1/user/heartbeat";
        let data = { "username": this._username, "token": this._token };
        let ret = this.Request(method, path, data);
        if (ret.code == 0) {
            this.login_result.expires = ret.result.expires;
            this.login_result.expires_ts = ret.result.expires_ts;
        }
        return ret;
    }
    PJYSDK.prototype._startUserHeartheat = function () {  // 开启用户心跳任务
        if (this._heartbeat_task) {
            this._heartbeat_task.interrupt();
            this._heartbeat_task = null;
        }
        this._heartbeat_task = threads.start(function () {
            setInterval(function () { }, 10000);
        });
        this._heartbeat_ret = this.UserHeartbeat();

        this._heartbeat_task.setInterval((self) => {
            self._heartbeat_ret = self.UserHeartbeat();
            if (self._heartbeat_ret.code != 0) {
                self.event.emit("heartbeat_failed", self._heartbeat_ret);
            }
        }, this._heartbeat_gap, this);

        this._heartbeat_task.setInterval((self) => {
            if (self.GetTimeRemaining() == 0) {
                self.event.emit("heartbeat_failed", { "code": 10250, "message": "用户已到期！" });
            }
        }, 1000, this);
    }
    PJYSDK.prototype.UserLogout = function () {  // 用户退出登录
        this._heartbeat_ret = { "code": -9, "message": "还未开始验证" };
        if (this._heartbeat_task) { // 结束心跳任务
            this._heartbeat_task.interrupt();
            this._heartbeat_task = null;
        }
        if (!this._token) {
            return { "code": 0, "message": "OK" };
        }
        let method = "POST";
        let path = "/v1/user/logout";
        let data = { "username": this._username, "token": this._token };
        let ret = this.Request(method, path, data);
        // 清理
        this._token = null;
        this.login_result = {
            "card_type": "",
            "expires": "",
            "expires_ts": 0,
            "config": "",
        };
        return ret;
    }
    PJYSDK.prototype.UserChangePassword = function (username, password, new_password) {  // 用户修改密码
        let method = "POST";
        let path = "/v1/user/password";
        let data = { "username": username, "password": password, "new_password": new_password };
        return this.Request(method, path, data);
    }
    PJYSDK.prototype.UserRecharge = function (username, card) { // 用户通过卡密充值
        let method = "POST";
        let path = "/v1/user/recharge";
        let data = { "username": username, "card": card };
        return this.Request(method, path, data);
    }
    PJYSDK.prototype.UserUnbindDevice = function () { // 用户解绑设备，需开发者后台配置
        if (!this._token) {
            return { "code": -2, "message": "请在用户登录成功后调用" };
        }
        let method = "POST";
        let path = "/v1/user/unbind_device";
        let data = { "username": this._username, "device_id": this._device_id, "token": this._token };
        return this.Request(method, path, data);
    }
    /* 配置相关 */
    PJYSDK.prototype.GetCardConfig = function () { // 获取卡密配置
        let method = "GET";
        let path = "/v1/card/config";
        let data = { "card": this._card };
        return this.Request(method, path, data);
    }
    PJYSDK.prototype.UpdateCardConfig = function (config) { // 更新卡密配置
        let method = "POST";
        let path = "/v1/card/config";
        let data = { "card": this._card, "config": config };
        return this.Request(method, path, data);
    }
    PJYSDK.prototype.GetUserConfig = function () { // 获取用户配置
        let method = "GET";
        let path = "/v1/user/config";
        let data = { "user": this._username };
        return this.Request(method, path, data);
    }
    PJYSDK.prototype.UpdateUserConfig = function (config) { // 更新用户配置
        let method = "POST";
        let path = "/v1/user/config";
        let data = { "username": this._username, "config": config };
        return this.Request(method, path, data);
    }
    /* 软件相关 */
    PJYSDK.prototype.GetSoftwareConfig = function () { // 获取软件配置
        let method = "GET";
        let path = "/v1/software/config";
        return this.Request(method, path, {});
    }
    PJYSDK.prototype.GetSoftwareNotice = function () { // 获取软件通知
        let method = "GET";
        let path = "/v1/software/notice";
        return this.Request(method, path, {});
    }
    PJYSDK.prototype.GetSoftwareLatestVersion = function (current_ver) { // 获取软件最新版本
        let method = "GET";
        let path = "/v1/software/latest_ver";
        let data = { "version": current_ver };
        return this.Request(method, path, data);
    }
    /* 试用功能 */
    PJYSDK.prototype.TrialLogin = function () {  // 试用登录
        let method = "POST";
        let path = "/v1/trial/login";
        let data = { "device_id": this._device_id };
        let ret = this.Request(method, path, data);
        if (ret.code == 0) {
            this.is_trial = true;
            this.login_result = ret.result;
            if (this._auto_heartbeat) {
                this._startTrialHeartheat();
            }
        }
        return ret;
    }
    PJYSDK.prototype.TrialHeartbeat = function () {  // 试用心跳，默认会自动调用
        let method = "POST";
        let path = "/v1/trial/heartbeat";
        let data = { "device_id": this._device_id };
        let ret = this.Request(method, path, data);
        if (ret.code == 0) {
            this.login_result.expires = ret.result.expires;
            this.login_result.expires_ts = ret.result.expires_ts;
        }
        return ret;
    }
    PJYSDK.prototype._startTrialHeartheat = function () {  // 开启试用心跳任务
        if (this._heartbeat_task) {
            this._heartbeat_task.interrupt();
            this._heartbeat_task = null;
        }
        this._heartbeat_task = threads.start(function () {
            setInterval(function () { }, 10000);
        });
        this._heartbeat_ret = this.TrialHeartbeat();

        this._heartbeat_task.setInterval((self) => {
            self._heartbeat_ret = self.TrialHeartbeat();
            if (self._heartbeat_ret.code != 0) {
                self.event.emit("heartbeat_failed", self._heartbeat_ret);
            }
        }, this._heartbeat_gap, this);

        this._heartbeat_task.setInterval((self) => {
            if (self.GetTimeRemaining() == 0) {
                self.event.emit("heartbeat_failed", { "code": 10407, "message": "试用已到期！" });
            }
        }, 1000, this);
    }
    PJYSDK.prototype.TrialLogout = function () {  // 试用退出登录，没有http请求，只是清理本地记录
        this.is_trial = false;
        this._heartbeat_ret = { "code": -9, "message": "还未开始验证" };
        if (this._heartbeat_task) { // 结束心跳任务
            this._heartbeat_task.interrupt();
            this._heartbeat_task = null;
        }
        // 清理
        this._token = null;
        this.login_result = {
            "card_type": "",
            "expires": "",
            "expires_ts": 0,
            "config": "",
        };
        return { "code": 0, "message": "OK" };;
    }
    /* 高级功能 */
    PJYSDK.prototype.GetRemoteVar = function (key) { // 获取远程变量
        let method = "GET";
        let path = "/v1/af/remote_var";
        let data = { "key": key };
        return this.Request(method, path, data);
    }
    PJYSDK.prototype.GetRemoteData = function (key) { // 获取远程数据
        let method = "GET";
        let path = "/v1/af/remote_data";
        let data = { "key": key };
        return this.Request(method, path, data);
    }
    PJYSDK.prototype.CreateRemoteData = function (key, value) { // 创建远程数据
        let method = "POST";
        let path = "/v1/af/remote_data";
        let data = { "action": "create", "key": key, "value": value };
        return this.Request(method, path, data);
    }
    PJYSDK.prototype.UpdateRemoteData = function (key, value) { // 修改远程数据
        let method = "POST";
        let path = "/v1/af/remote_data";
        let data = { "action": "update", "key": key, "value": value };
        return this.Request(method, path, data);
    }
    PJYSDK.prototype.DeleteRemoteData = function (key, value) { // 删除远程数据
        let method = "POST";
        let path = "/v1/af/remote_data";
        let data = { "action": "delete", "key": key };
        return this.Request(method, path, data);
    }
    PJYSDK.prototype.CallRemoteFunc = function (func_name, params) { // 执行远程函数
        let method = "POST";
        let path = "/v1/af/call_remote_func";
        let ps = JSON.stringify(params);
        let data = { "func_name": func_name, "params": ps };
        let ret = this.Request(method, path, data);
        if (ret.code == 0 && ret.result.return) {
            ret.result = JSON.parse(ret.result.return);
        }
        return ret;
    }
    return PJYSDK;
})();
