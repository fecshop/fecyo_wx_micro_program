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
    itemId: '',
    products:[],
    order_info: {},
    symbol: '',
    //语言 - end
    delBtnWidth: 120,
  },
  onLoad: function (e) {
    var that = this;
    var orderId = e.order_id;
    var itemId = e.item_id;
    that.setData({
      orderId: orderId,
      itemId: itemId
    });
    // 语言
    // 设置当前页面的language变量 - 每个页面都要有
    this.setLanguage();
    event.on("languageChanged", this, this.changeLanguage); // (2)
    // 设置当前页面的language Index - 每个页面都要有
    wx.T.setLocaleByIndex(wx.T.langIndex);
    // 语言 - 结束
    that.getAftersaleReturn();
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
    this.getAftersaleReturn()
  },

  afterSaleReturn: function (e) {
    var itemId = e.currentTarget.dataset.itemid;
    var orderId = e.currentTarget.dataset.orderid;
    wx.navigateTo({
      url: "/pages/aftersale-return/aftersale-return?item_id=" + itemId + "&order_id=" + orderId
    })
  },
  getAftersaleReturn: function () {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    wx.request({
      url: app.globalData.urls + '/customer/order/returnview',
      data: {
        order_id: that.data.orderId,
        item_id: that.data.itemId,
      },
      header: app.getRequestHeader(),
      success: function (res) {
        if (res.data.code == 200) {

          that.setData({
            products: res.data.data.order_info.products,
            order_info: res.data.data.order_info
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

        } else if (res.data.code == 2000010){
          var as_id = res.data.data.as_id;
          wx.navigateTo({
            url: "/pages/aftersale-returnstatus/aftersale-returnstatus?as_id=" + as_id
          })
        } else {
          that.setData({
            favList: null,
            loadingMoreHidden: false
          });
        }
      }
    })
  },
  bindSave: function (e) {
    var that = this;
    var return_qty = e.detail.value.return_qty;

    if (return_qty == "") {
      wx.showModal({
        title: '提示',
        content: '请填写退货个数',
        showCancel: false
      })
      return
    }
    wx.request({
      url: app.globalData.urls + '/customer/order/returnsubmit',
      header: app.getPostRequestHeader(),
      method: 'POST',
      data: {
        return_qty: return_qty,
        order_id: that.data.orderId,
        item_id: that.data.itemId
      },
      success: function (res) {
        if (res.data.code != 200) {
          // 登录错误 
          wx.hideLoading();
          wx.showModal({
            title: '失败',
            content: '提交退货失败',
            showCancel: false
          })
          return;
        }
        app.saveReponseHeader(res);
        // 跳转到提交成功页面

        var as_id = res.data.data.as_id;
        wx.navigateTo({
          url: "/pages/aftersale-returnstatus/aftersale-returnstatus?as_id=" + as_id
        })
      }
    })
  }



})