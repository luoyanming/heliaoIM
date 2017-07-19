var _$encode = function (_map, _content) {
    _content = '' + _content;
    if (!_map || !_content) {
        return _content || '';
    }
    return _content.replace(_map.r, function ($1) {
        var _result = _map[!_map.i ? $1.toLowerCase() : $1];
        return _result != null ? _result : $1;
    });
};
var _$escape = (function () {
    var _reg = /<br\/?>$/,
        _map = {
            r: /\<|\>|\&|\r|\n|\s|\'|\"/g,
            '<': '&lt;', '>': '&gt;', '&': '&amp;', ' ': '&nbsp;',
            '"': '&quot;', "'": '&#39;', '\n': '<br/>', '\r': ''
        };
    return function (_content) {
        _content = _$encode(_map, _content);
        return _content.replace(_reg, '<br/><br/>');
    };
})();

function loadImg(position) {
    if(position == 'after') {
        $('#chatContent').scrollTop(99999);
    }
}

window.util = {
    loadItem: function() {
        return '<article class="chat-loading">正在获取消息...</article>';
    },
    moreItem: function() {
        return '<article class="chat-more">查看更多消息</article>';
    },
    dateFormat: function(time) {
        var formatdate = new Date(time),
            year = formatdate.getFullYear(),
            month = formatdate.getMonth(),
            day = formatdate.getDate(),
            hours = formatdate.getHours(),
            mimute = formatdate.getMinutes(),
            second = formatdate.getSeconds();

        month = (month + 1) < 10 ? ('0' + (month + 1)) : (month + 1);
        day = day < 10 ? ('0' + day) : day;
        hours = hours < 10 ? ('0' + hours) : hours;
        mimute = mimute < 10 ? ('0' + mimute) : mimute;
        second = second < 10 ? ('0' + second) : second;

        return year +'-'+ month +'-'+ day +' '+ hours +':'+ mimute +':'+ second;
    },
    buildSender: function(msg) {
        var sender = '';

        if (msg.flow === 'in') {
            sender = 'his'
        } else if (msg.flow === 'out') {
            sender = 'mine'
        }

        return sender;
    },
    getMessage(position, msg) {
        var str = '',
            url = msg.file ? _$escape(msg.file.url) : '',
            sentStr = (msg.flow === 'in') ? "收到" : "发送";

        switch (msg.type) {
            case 'text':
                var re = /(http:\/\/[\w.\/]+)(?![^<]+>)/gi; // 识别链接
                str = _$escape(msg.text);
                str = str.replace(re, "<a href='$1'>$1</a>");
                // str = buildEmoji(str);
                str = '<div class="content content-link"><p>' + str + '</p></div>'
                break;
            case 'image':
                if (msg.status === -1) {
                    str = '<p>[' + msg.message.message + ']</p>';
                } else {
                    msg.file.url = _$escape(msg.file.url);
                    // str = '<a href="' + msg.file.url + '?imageView" target="_blank"><img onload="loadImg()" data-src="' + msg.file.url + '" src="' + msg.file.url + '?imageView&thumbnail=200x0&quality=85"/></a>';
                    str = '<div class="content content-picture"><a href="' + msg.file.url + '?imageView" target="_blank"><img onload="loadImg('+ position +')" data-src="' + msg.file.url + '" src="' + msg.file.url + '?imageView&thumbnail=200x0&quality=85"/></a></div>';
                }
                break;
            case 'file':
                str = '<div class="content content-link"><p>' + sentStr + '一条[文件]消息,请到 <a href="http://m.renhe.cn/index.shtml">手机</a> 或 <a href="http://www.renhe.cn/">电脑客户端</a> 查看</p></div>';
                break;
            case 'tip':
                str = '<div class="content content-link"><p>' + sentStr + '一条[通知]消息,请到 <a href="http://m.renhe.cn/index.shtml">手机</a> 或 <a href="http://www.renhe.cn/">电脑客户端</a> 查看</p></div>';
                break;
            case 'video':
                str = '<div class="content content-link"><p>' + sentStr + '一条[视频]消息,请到 <a href="http://m.renhe.cn/index.shtml">手机</a> 或 <a href="http://www.renhe.cn/">电脑客户端</a> 查看</p></div>';

                break;
            case 'audio':
                str = '<div class="content content-link"><p>' + sentStr + '一条[语音]消息,请到 <a href="http://m.renhe.cn/index.shtml">手机</a> 或 <a href="http://www.renhe.cn/">电脑客户端</a> 查看</p></div>';
                break;
            case 'geo':
                str = '<div class="content content-link"><p>' + sentStr + '一条[地理位置]消息,请到 <a href="http://m.renhe.cn/index.shtml">手机</a> 或 <a href="http://www.renhe.cn/">电脑客户端</a> 查看</p></div>';
                break;
            case 'custom':
                var content = JSON.parse(msg.content);
                if (content.type === 1) {
                    str = '<div class="content content-link"><p>' + sentStr + '一条[猜拳]消息,请到 <a href="http://m.renhe.cn/index.shtml">手机</a> 或 <a href="http://www.renhe.cn/">电脑客户端</a> 查看</p></div>';
                } else if (content.type === 2) {
                    str = '<div class="content content-link"><p>' + sentStr + '一条[阅后即焚]消息,请到 <a href="http://m.renhe.cn/index.shtml">手机</a> 或 <a href="http://www.renhe.cn/">电脑客户端</a> 查看</p></div>';
                } else if (content.type === 3) {
                    var catalog = _$escape(content.data.catalog),
                        chartvar = _$escape(content.data.chartlet);
                    str = '<div class="content content-picture"><img class="chartlet" onload="loadImg('+ position +')" src="./images/' + catalog + '/' + chartvar + '.png"></div>';
                } else if (content.type == 4) {
                    str = '<div class="content content-link"><p>' + sentStr + '一条[白板]消息,请到 <a href="http://m.renhe.cn/index.shtml">手机</a> 或 <a href="http://www.renhe.cn/">电脑客户端</a> 查看</p></div>';
                } else {
                    console.log(content)
                    if(content.SELF) {
                        if(content.SELF.type == 'http') {
                            str = '<div class="content content-share"><a href="'+ content.SELF.link +'" class="link-share flex-h"><div class="thumb"><img src="'+ content.SELF.picUrl +'"></div><p class="flex-a-i">'+ content.SELF.text +'</p></a></div>';
                        } else {
                            str = '<div class="content content-link"><p>' + sentStr + '一条[自定义]消息,请到 <a href="http://m.renhe.cn/index.shtml">手机</a> 或 <a href="http://www.renhe.cn/">电脑客户端</a> 查看</p></div>';
                        }
                    } else {
                        str = '<div class="content content-link"><p>' + sentStr + '一条[自定义]消息,请到 <a href="http://m.renhe.cn/index.shtml">手机</a> 或 <a href="http://www.renhe.cn/">电脑客户端</a> 查看</p></div>';
                    }
                }
                break;
            case 'robot':
                str = '<div class="content content-link"><p>' + sentStr + '一条[机器人]消息,请到 <a href="http://m.renhe.cn/index.shtml">手机</a> 或 <a href="http://www.renhe.cn/">电脑客户端</a> 查看</p></div>';
                break
            default:
                str = '<div class="content content-link"><p>' + sentStr + '一条[未知消息类型]消息,请到 <a href="http://m.renhe.cn/index.shtml">手机</a> 或 <a href="http://www.renhe.cn/">电脑客户端</a> 查看</p></div>';

                break;
        }
        return str;
    },
    getQueryString(name){
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"),
            r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }
}