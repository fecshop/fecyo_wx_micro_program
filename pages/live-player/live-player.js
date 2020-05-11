//index.js
//获取应用实例
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');
// 语言
var util = require('../../utils/util.js')
import event from '../../utils/event'

Page({
  data: {
    //语言 - begin
    language: '',
    //语言 - end
  },

  // 语言 
  // 设置language变量（翻译Object）
  setLanguage() {
    var lang = wx.T.getLanguage()
    this.setData({
      language: lang,
      selectSize: lang.select_attribute
    });
    //this.getProductDetails()
  },
  changeLanguage() {
    var lang = wx.T.getLanguage()
    this.setData({
      language: lang,
      roomList: {}
    });
    this.getProductDetails()
  },
  onLoad: function (e) {
    var that = this;
    // 语言
    // 设置当前页面的language变量 - 每个页面都要有
    this.setLanguage();
    event.on("languageChanged", this, this.changeLanguage); // (2)
    // 设置当前页面的language Index - 每个页面都要有
    wx.T.setLocaleByIndex(wx.T.langIndex);
    // 语言 - 结束

    var that = this
    wx.request({
      url: app.globalData.urls + '/wx/helper/liveroomlist',  // '/shop/goods/detail',
      header: app.getRequestHeader(),
      data: {
      },
      success: function (res) {
        if (res.data.code == 200) {
          var roomList = res.data.data.roomList
          if (roomList) {
            that.setData({ roomList: roomList })
          }
        }
        
        app.saveReponseHeader(res);
      }
    });
  },
  openLivePlayerTap: function (e) {
    let roomId = e.currentTarget.dataset.roomid;
    //let roomId = [直播房间id] // 填写具体的房间号，可通过下面【获取直播房间列表】 API 获取
    let customParams = encodeURIComponent(JSON.stringify({ path: 'pages/live-player/live-player', pid: 1 })) // 开发者在直播间页面路径上携带自定义参数（如示例中的path和pid参数），后续可以在分享卡片链接和跳转至商详页时获取，详见【获取自定义参数】、【直播间到商详页面携带参数】章节（上限600个字符，超过部分会被截断）
    wx.navigateTo({
      url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomId}&custom_params=${customParams}`
    })
  },
})
