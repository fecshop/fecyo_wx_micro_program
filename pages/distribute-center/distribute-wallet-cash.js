var wxpay = require('../../utils/pay.js')
var app = getApp()
// 语言
var util = require('../../utils/util.js')
import event from '../../utils/event'

Page({
  data: {
    walletAmount:0,
    walletCashAmount:0,
    language: '',
    //语言 - end
    bodyHeight: null
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
  onLoad: function (e) {
    var that = this;
    if (e.share) {
      that.setData({ share: e.share });
    }
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    // 语言
    // 设置当前页面的language变量 - 每个页面都要有
    this.setLanguage();
    event.on("languageChanged", this, this.changeLanguage); // (2)
    // 设置当前页面的language Index - 每个页面都要有
    wx.T.setLocaleByIndex(wx.T.langIndex);
    this.initWalletCash()
    // 语言 - 结束
  },
  initWalletCash: function (e) {
    var that = this
    // 生成充值订单
    wx.request({
      url: app.globalData.urls + "/distribute/wallet/getcashinfo",  // "/user/wxapp/login",
      header: app.getPostRequestHeader(),
      method: 'GET',
      data: {},
      success: function (res) {
        wx.hideLoading();
        app.saveReponseHeader(res);
        if (res.data.code == '200') { // 登陆成功，进行跳转
          var walletAmount = res.data.data.wallet_amount;
          var walletCashAmount = res.data.data.wallet_cash_max_amount;
          that.setData({
            walletAmount: walletAmount,
            walletCashAmount: walletCashAmount
          });
        }
      }
    });


  },
  bindCash: function (e) {
    var that = this;
    var name = e.detail.value.name;
    var phone = e.detail.value.phone;
    var payment_method = e.detail.value.payment_method;
    var payment_no = e.detail.value.payment_no;
    var amount = e.detail.value.amount;

    // 生成充值订单
    wx.request({
      url: app.globalData.urls + "/distribute/wallet/cashrequest",  // "/user/wxapp/login",
      header: app.getPostRequestHeader(),
      method: 'POST',
      data: {
        name: name,
        phone: phone,
        payment_method: payment_method,
        payment_no: payment_no,
        amount: amount,

      },
      success: function (res) {
        wx.hideLoading();
        app.saveReponseHeader(res);
        if (res.data.code == '200') { // 登陆成功，进行跳转
          console.log('cashrequest success')
          wx.navigateTo({
            url: '/pages/distribute-center/distribute-wallet-cash-history',
          })
        } else {
          var errorMsg = res.data.data.errors
          wx.showModal({
            title: "提示",
            content: errorMsg,
            showCancel: false
          });
        }
      }
    });








  },

  onReady: function () {
    // 生命周期函数--监听页面初次渲染完成
  },
  onHide: function () {
    // 生命周期函数--监听页面隐藏

  },
  onUnload: function () {
    // 生命周期函数--监听页面卸载

  },
  onPullDownRefresh: function () {
    // 页面相关事件处理函数--监听用户下拉动作

  },
  onReachBottom: function () {
    // 页面上拉触底事件的处理函数

  }
})