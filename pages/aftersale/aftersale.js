//index.js
//获取应用实例
var app = getApp()
// 语言
var util = require('../../utils/util.js')
import event from '../../utils/event'

Page({
  data: {
    //语言 - begin
    language: '',
    orderId: '',
    products: [],
    symbol:'',
    //语言 - end
    delBtnWidth: 120,
  },
  onLoad: function (e) {
    var that = this;
    var orderId = e.orderid;
    that.setData({
      orderId: orderId
    });
    // 语言
    // 设置当前页面的language变量 - 每个页面都要有
    this.setLanguage();
    event.on("languageChanged", this, this.changeLanguage); // (2)
    // 设置当前页面的language Index - 每个页面都要有
    wx.T.setLocaleByIndex(wx.T.langIndex);
    // 语言 - 结束
    that.getAftersaleProductList();
  },
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-detail/goods-detail?id=" + e.currentTarget.dataset.id
    })
  },
  home: function () {
    wx.switchTab({
      url: "/pages/index/index"
    })
  },
  // 语言 
  // 设置language变量（翻译Object）
  setLanguage() {
    var lang = wx.T.getLanguage()
    this.setData({
      language: lang,
      selectSize: lang.select_attribute
    });
  },
  changeLanguage() {
    var lang = wx.T.getLanguage()
    this.setData({
      language: lang,
      selectSize: lang.select_attribute
    });
    this.getAftersaleProductList()
  },
  
  afterSaleReturn: function(e) {
    var itemId = e.currentTarget.dataset.itemid;
    var orderId = e.currentTarget.dataset.orderid;
    wx.navigateTo({
      url: "/pages/aftersale-return/aftersale-return?item_id=" + itemId + "&order_id=" + orderId
    })
  },
  getAftersaleProductList: function () {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    wx.request({
      url: app.globalData.urls + '/customer/order/aftersale',
      data: {
        order_id: that.data.orderId
      },
      header: app.getRequestHeader(),
      success: function (res) {
        if (res.data.code == 200) {
          
          that.setData({
            products: res.data.data.order_info.products,
            symbol: res.data.data.order_info.currency_symbol
          });

          var favList = [];
          var products = res.data.data.order_info.products
          var ii = 0;
          for (var x in products) {
            var product = products[x]
            favList.push({
              goodsName: product.name,
              goodsId: product.product_id,
              itemId: product.item_id,
              pic: product.imgUrl,
              price: product.price,
              qty: product.qty,
              custom_option_info_str: product.custom_option_info_str,
              isReviewed: product.is_reviewed
            })
            ii++
          }
          if (ii == 0) {
            that.setData({
              favList: null,
              loadingMoreHidden: false
            });
            return
          }

          that.setData({
            favList: favList,
            loadingMoreHidden: true
          });
        } else {
          that.setData({
            favList: null,
            loadingMoreHidden: false
          });
        }
      }
    })
  }



})