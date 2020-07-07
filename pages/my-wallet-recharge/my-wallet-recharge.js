var wxpay = require('../../utils/pay.js')
var app = getApp()
// 语言
var util = require('../../utils/util.js')
import event from '../../utils/event'

Page({
  data: {
    
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
    // 语言 - 结束
  },
  bindRecharge: function (e) {
    var that = this;
    var rechargeAmount = e.detail.value.rechargeAmount;
    // 生成充值订单
    wx.request({
      url: app.globalData.urls + "/customer/wallet/recharge",  // "/user/wxapp/login",
      header: app.getPostRequestHeader(),
      method: 'POST',
      data: {
        rechargeAmount: rechargeAmount
      },
      success: function (res) {
        wx.hideLoading();
        app.saveReponseHeader(res);
        if (res.data.code == '200') { // 登陆成功，进行跳转
          var money = res.data.data.money
          var order_increment_id = res.data.data.increment_id
          wxpay.wxpay(app, money, order_increment_id, "/pages/my-wallet/my-wallet");
          
          //wx.navigateBack({
          //  delta: 1
          //});
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