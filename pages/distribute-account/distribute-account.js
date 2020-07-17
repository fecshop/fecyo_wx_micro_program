const app = getApp()
// 语言
var util = require('../../utils/util.js')
import event from '../../utils/event'

Page({
  data: {
    balance: 0,
    freeze: 0,
    score: 0,
    score_sign_continuous: 0,
    //语言 - begin
    language: '',
    //语言 - end
    tabClass: ["", "", "", "", ""],
    logged: true,
    isWalletyo: false,
    distribute_code: '',
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
  toShareDistribute: function() {
    wx.navigateTo({
      url: '/pages/distribute-register/market-register?distribute_code=' + this.data.distribute_code,
    })
  },
  initDistribute: function () {
    var that = this;
    wx.showLoading({
      title: that.data.language.load_user_information,
    })
    wx.request({
      url: app.globalData.urls + '/distribute/account/index',
      header: app.getRequestHeader(),
      data: {},
      success: function (res) {
        wx.hideLoading();
        app.saveReponseHeader(res);

        var walletyo = res.data.data.hasOwnProperty("walletyo") ? res.data.data.walletyo : false;
        that.setData({ isWalletyo: walletyo });
        // 未登陆
        if (res.data.code == '1100003') {
          that.setData({
            logged: false
          })
          wx.navigateTo({
            url: "/pages/login/login"
          })
        // 非分销商
        } else if (res.data.code == '3000004') {
          wx.navigateTo({
            url: "/pages/distribute-register/distribute-register"
          })
        } else if (res.data.code == '200') {
          var distribute_code = res.data.data.distribute_code
          that.setData({
            logged: true,
            distribute_code: distribute_code
          })
        }
      }
    });
  },
  goToCustomerAccount: function (param) {
    wx.switchTab({
      url: '/pages/my/my',
    })
  },
  onReady() {
    // 发起登录验证
    //this.initDistribute(true)
  },
  onShow() {
    this.initDistribute()
  }
})