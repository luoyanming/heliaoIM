var that;

var MAIN = {
    // 配置参数
    config: {
        account: '',
        uid: '',
        pwd: '',
        appkey: '',
        url:''
    },

    // userInfoArray
    userInfo: [],

    // 获取所需基础参数
    getConfig: function() {
        // 测试连接 ?account=93171&uid=95098&token=64762ff7f1fa7517613cbe388b1734e7&appkey=63acade8b6fc4c9de775de58cd0ff9b4
        this.config.account = configAccount;  //聊天对象 account
        this.config.uid = configUid;  //当前用户 uid
        this.config.token = configToken; //当前用户密码md5加密
        this.config.appkey = configAppkey; //云信key
        this.config.url = configUrl; //云信接口地址

        this.init();
    },

    // 初始化
    init: function() {
        that = this;
        this.SDKInit();
    },

    // 初始化界面 UI
    uiInit: function() {
        this.$chatContent = $('#chatContent');
        this.$chatEditor = $('#chatEditor');
        this.$messageText = $('#messageText');
        this.$sendBtn = $('#sendBtn');

        this.$chatContent.html(util.loadItem);
        this.$messageText.unbind('keydown');
        this.$messageText.on('keydown', that.messageTextBind);
        this.$sendBtn.unbind('click');
        this.$sendBtn.on('click', that.sendTextMessage);

    },

    // SDK连接
    SDKInit: function() {
        window.nim = new SDK.NIM({
            //控制台日志，上线时应该关掉
            debug: false,
            appKey: that.config.appkey,
            account: that.config.uid,
            token: that.config.token,
            //连接
            onconnect: onConnect,
            ondisconnect: onDisconnect,
            onerror: onError,
            onwillreconnect: onWillReconnect,
            //消息
            onmsg: onMsg,
            // onroamingmsgs: saveMsgs,
            // onofflinemsgs: saveMsgs,
            //会话
            //同步完成
            onsyncdone: onSyncDone,
        });

        function onConnect() {
            console.log('连接成功');
        };
        function onDisconnect(error) {
            console.log('连接断开');
            if (error) {
              switch (error.code) {
                case 302:
                    alert(error.message);
                    break;
                case 'kicked':
                    alert("你的帐号在其他设备登录!");
                    break;
                default:
                    break;
              }
            }
        };
        function onError(error) {
            console.log('错误信息: ' + error);
        };
        function onWillReconnect(obj) {
            alert('连接已断开，正在重新建立连接...');
        };
        function onMsg(msg) {
            console.log('收到消息------------tip');
            that.doReceivedMsg(msg);
        };
        function onSyncDone() {
            console.log('消息同步完成了');
            that.uiInit();
            that.getUserInfo();
            that.getHistoryMsgs();
        };
    },

    // 获取用户信息
    getUserInfo: function() {
        nim.getUsers({
            accounts: [that.config.account, that.config.uid],
            done: function (error, users) {
                that.userInfo = users;
            }
        });
    },

    // 获取历史消息
    getHistoryMsgs: function(msgid, time) {
        $('#chatContent .chat-more').detach();
        $('#chatContent .chat-loading').detach();
        that.$chatContent.prepend(util.loadItem);

        nim.getHistoryMsgs({
          scene: 'p2p',
          to: that.config.account,
          lastMsgId: msgid,
          endTime: time,
          limit: 5,
          asc: false,
          done: function(err, data) {
            that.appUI.createHistoryChatUI(data.msgs);
          }
        });
    },

    // 处理收到的消息
    doReceivedMsg: function(msg) {
        if(msg.flow == 'in' && msg.from == that.config.account) {
            this.appUI.createReceivedChatUI(msg);
        }
    },

    // UI
    appUI: {
        // 创建历史漫游消息
        createHistoryChatUI: function(msgs) {
            $('#chatContent .chat-loading').detach();

            if(msgs.length == 0) {
                return false;
            }

            for(var i = 0; i < msgs.length; i++) {
                that.$chatContent.prepend(that.appUI.chatContentItemUI('before', msgs[i]));
            }

            that.$chatContent.prepend(util.moreItem);

            $('.chat-more').unbind('click');
            $('.chat-more').on('click', function() {
                that.getHistoryMsgs($("#chatContent .chat-item").first().attr('data-id'), parseInt($("#chatContent .chat-item").first().attr('data-time')));
            });
        },
        // 创建接收到的消息
        createReceivedChatUI: function(msg) {
            $('#chatContent .chat-loading').detach();
            
            that.$chatContent.append(that.appUI.chatContentItemUI('after', msg));
            that.$chatContent.scrollTop(99999);
        },
        // 创建单条消息
        chatContentItemUI: function(position, msg) {
            console.log(msg)
            // 发送已读回执
            nim.sendMsgReceipt({
                msg: msg,
                done: function(error, data) {
                    // console.log('发送消息已读回执' + (!error?'成功':'失败'), error, data);
                }
            });

            var lastItem,
                msgHtml = "";

            if(position == 'before') {
                lastItem = $("#chatContent .chat-item").first();
            } else {
                lastItem = $("#chatContent .chat-item").last();
            }

            if (lastItem.length == 0) {
                msgHtml += this.chatTimeDom(util.dateFormat(msg.time));
            } else {
                if(position == 'before') {
                    if (parseInt(lastItem.attr('data-time')) - msg.time > 5 * 60 * 1000) {
                        msgHtml += this.chatTimeDom(util.dateFormat(msg.time));
                    }
                } else {
                    if (msg.time - parseInt(lastItem.attr('data-time')) > 5 * 60 * 1000) {
                        msgHtml += this.chatTimeDom(util.dateFormat(msg.time));
                    }
                }
            }
            msgHtml += this.chatContentItemDom(position, msg);
            return msgHtml;
        },
        // 单条消息 UI
        chatContentItemDom: function(position, msg) {
            if(util.buildSender(msg) == 'his') {
                var msgHtml = [
                    '<article data-id="'+ msg.idServer +'" data-time="'+ msg.time +'" class="chat-item chat-item-'+ util.buildSender(msg) +'">',
                    '<a href="http://m.renhe.cn/index.shtml" class="avatar"><img src="' + that.getAvatar(msg.from) + '"></a>',
                    '<a href="http://m.renhe.cn/index.shtml" class="nickname">' + msg.fromNick + '</a>',
                    '<div class="flex-h">',
                        '<div>',
                            util.getMessage(position, msg),
                        '</div>',
                    '</div>',
                    '</article>',
                ].join('');
            } else if(util.buildSender(msg) == 'mine') {
                var msgHtml = [
                    '<article data-id="'+ msg.idServer +'" data-time="'+ msg.time +'" class="chat-item chat-item-'+ util.buildSender(msg) +'">',
                    '<a href="http://m.renhe.cn/index.shtml" class="avatar"><img src="' + that.getAvatar(msg.from) + '"></a>',
                    '<a href="http://m.renhe.cn/index.shtml" class="nickname">' + msg.fromNick + '</a>',
                    '<div class="flex-h">',
                        '<div class="flex-a-i">',
                            // msg.status === "fail" ? '<span class="error j-resend" data-session="' + msg.sessionId + '" data-id="' + msg.idClient + '"><i class="icon icon-error"></i>发送失败,点击重发</span>' : '',
                            // '<span class="readMsg">已读</span>',
                        '</div>',
                        '<div>',
                        util.getMessage(position, msg),
                        '</div>',
                    '</div>',
                    '</article>',
                ].join('');
            }
            
            return msgHtml;
        },
        // 时间 UI
        chatTimeDom: function(time) {
            return '<article class="chat-time">'+ time +'</article>';
        }
    },

    // 根据用户账号获取头像链接
    getAvatar(account) {
        for(var i = 0; i < that.userInfo.length; i++) {
            if(that.userInfo[i].account == account) {
                return that.userInfo[i].avatar;
            }
        }

        // var re = /^((http|https|ftp):\/\/)?(\w(\:\w)?@)?([0-9a-z_-]+\.)*?([a-z0-9-]+\.[a-z]{2,6}(\.[a-z]{2})?(\:[0-9]{2,6})?)((\/[^?#<>\/\\*":]*)+(\?[^#]*)?(#.*)?)?$/i;
        // if (re.test(url)) {
        //     return url + "?imageView&thumbnail=80x80&quality=100";
        // } else {
        //     return "images/default-icon.png"
        // }
    },

    // 输入框事件
    messageTextBind: function(e) {
        var ev = e || window.event
        if ($.trim(that.$messageText.val()).length > 0) {
            if (ev.keyCode === 13 && ev.ctrlKey) {
                that.$messageText.val(that.$messageText.val() + '\r\n')
            } else if (ev.keyCode === 13 && !ev.ctrlKey) {
                that.sendTextMessage()
            }
        }
    },

    // 发送文本消息
    sendTextMessage: function() {
        var text = that.$messageText.val().trim();

        if (text.length > 500) {
            alert('消息长度最大为500字符')
        } else if (text.length === 0) {
            return false;
        } else {
            nim.sendText({
                scene: 'p2p',
                to: that.config.account,
                text: text,
                done: function(err, msg) {
                    that.$messageText.val('');
                    that.appUI.createReceivedChatUI(msg);
                }
            });
        }
    },
};

MAIN.getConfig();
