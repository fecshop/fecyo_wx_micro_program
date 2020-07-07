var app = getApp();
// 语言
var util = require('../../utils/util.js')
import event from '../../utils/event'
var wxpay = require('../../utils/pay.js');
Page({
  data: {
    //语言 - begin
    language: '',
    //语言 - end
    walletActive: false,
    customerBaseWallet: 0,
    walletIsShow: false,
    customerCurrWallet: 0
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
  onShow: function () {
    this.initPayment();
  },
  onLoad: function (e) {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    if (e) {
      that.setData({
        money: e.money,
        symbol: e.symbol,
        order: e.order, 
        id: e.id
      });
    }
    // 语言
    // 设置当前页面的language变量 - 每个页面都要有
    this.setLanguage();
    event.on("languageChanged", this, this.changeLanguage); // (2)
    // 设置当前页面的language Index - 每个页面都要有
    wx.T.setLocaleByIndex(wx.T.langIndex);
    // 语言 - 结束
    
  },
  initPayment: function (e) {
    var that = this
    var orderIncrementId = this.data.order
    wx.request({
      url: app.globalData.urls + '/checkout/wx/paymentinfo',
      header: app.getRequestHeader(),
      data: {
        orderIncrementId: orderIncrementId
      },
      success: function (res) {
        wx.hideLoading();
        app.saveReponseHeader(res);
        // 如果已经登陆，则跳转page/my/my
        if (res.data.code == '200') {
          var walletActive = res.data.data.walletActive
          var customerBaseWallet = res.data.data.customerBaseWallet
          var customerCurrWallet = res.data.data.customerCurrWallet
          var walletIsShow = res.data.data.walletIsShow
          console.log(walletActive)
          console.log(customerBaseWallet)
          console.log(customerCurrWallet)
          that.setData({
            walletActive: walletActive,
            customerBaseWallet: customerBaseWallet,
            customerCurrWallet: customerCurrWallet,
            walletIsShow: walletIsShow
          });
        }
      }
    });

  },
  toPayTap: function (e) {
    var that = this;
    var paytype = e.currentTarget.dataset.paytype;
    var orderId = e.currentTarget.dataset.id;
    var money = e.currentTarget.dataset.money;
    if ( paytype == "wxpay" ) {
      wxpay.wxpay(app, money, orderId, "/pages/order-list/order-list?currentType=1&share=1");
    } else if (paytype == "wallet") {
      wx.request({
        url: app.globalData.urls + '/payment/wallet/start',
        header: app.getPostRequestHeader(),
        method: 'POST',
        data: {
          order_increment_id: orderId
        },
        success: function (res) {
          wx.hideLoading();
          app.saveReponseHeader(res);
          // 如果已经登陆，则跳转page/my/my
          if (res.data.code == '200') {
            var redirectUrl = "/pages/order-list/order-list"
            wx.showToast({ title: '支付成功' })
            wx.redirectTo({
              url: redirectUrl
            });
          } else {

          }
        }
      });
    }
    
    
  },
  /*
  closeOreder: function () {
    wx.showModal({
      title: '',
      content: '优惠不等人，商品一旦错过就不存在了哦～',
      cancelText: '忍痛放弃',
      cancelColor: '#999999',
      confirmText: '我在想想',
      confirmColor: '#b5272d',
      success: function (res) {
        if (res.cancel) {
          wx.redirectTo({
            url: "/pages/order-list/order-list?currentType=0&share=1"
          });
        }
      }
    })
  }
  */

})