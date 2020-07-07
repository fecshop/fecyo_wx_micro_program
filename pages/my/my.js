const app = getApp()
// 语言
var util = require('../../utils/util.js')
import event from '../../utils/event'

Page({
	data: {
    balance:0,
    freeze:0,
    score:0,
    score_sign_continuous:0,
    //语言 - begin
    language: '',
    //语言 - end
    tabClass: ["", "", "", "", ""],
    logged:true,
    isWalletyo:false,
  },
  // 语言 
  // 设置language变量（翻译Object）
  setLanguage() {
    var lang = wx.T.getLanguage()
    this.setData({
      language: lang,
      selectSize: lang.select_attribute
    });
    //this.initCartInfo()
  },
  changeLanguage() {
    var lang = wx.T.getLanguage()
    this.setData({
      language: lang,
      selectSize: lang.select_attribute
    });
    //this.initCartInfo()
  },

  onLoad: function () {
    var that = this;
    // 语言
    // 设置当前页面的language变量 - 每个页面都要有
    this.setLanguage();
    event.on("languageChanged", this, this.changeLanguage); // (2)
    // 设置当前页面的language Index - 每个页面都要有
    wx.T.setLocaleByIndex(wx.T.langIndex);
    // 语言 - 结束
  },
  loginAccount: function (jumpLogin) {
    var that = this;
    wx.showLoading({
      title: that.data.language.load_user_information,
    })
    wx.request({
      url: app.globalData.urls + '/customer/login/wxindex',
      header: app.getRequestHeader(),
      data: {},
      success: function (res) {
        wx.hideLoading();
        app.saveReponseHeader(res);
        
        var walletyo = res.data.data.hasOwnProperty("walletyo") ? res.data.data.walletyo : false;
        that.setData({ isWalletyo: walletyo});
        
        console.log(walletyo);
        // 如果已经登陆，则跳转page/my/my
        if (res.data.code != '1100006') {
          that.setData({
            logged: false
          })
          if (jumpLogin){
            wx.navigateTo({
              url: "/pages/login/login"
            })
          }
        }else{
          that.setData({
            logged: true
          })
        }
      }
    });
  },
  onReady(){
    // 发起登录验证
    this.loginAccount(true)
  },
  onShow() {
    this.loginAccount(false)
  }
})