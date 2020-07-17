var wxpay = require('../../utils/pay.js')
var app = getApp()
// 语言
var util = require('../../utils/util.js')
import event from '../../utils/event'

Page({
  data: {
    statusType: [], //["全部订单","待付款", "待发货", "待收货",  "已完成"], //["待付款", "待发货", "待收货", "待评价", "已完成"],
    currentType: 0,
    orderList: [],
    tabClass: ["", "", "", "", ""],
    page: 0,
    //语言 - begin
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
  orderDetail: function (e) {
    var orderId = e.currentTarget.dataset.id;
    var order_item_id = e.currentTarget.dataset.order_item_id;
    console.log("order_item_id:" + order_item_id)
    wx.navigateTo({
      url: "/pages/distribute-center/distribute-profit-view?order_item_id=" + order_item_id 
    })
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
    this.getOrderList();
  },
  onReady: function () {
    // 生命周期函数--监听页面初次渲染完成

  },
  getOrderList: function () {
    console.log("getOrderList");
    // 获取订单列表
    wx.showLoading();
    var that = this;
    that.setData({
      page: that.data.page + 1
    });
    wx.request({
      url: app.globalData.urls + '/distribute/profit/index',
      data: {
        p: that.data.page
      },
      header: app.getRequestHeader(),
      success: (res) => {
        console.log(res)
        wx.hideLoading();
        if (res.data.code == 200) {
          var orderList = res.data.data.items;
          var orderListThis = that.data.orderList;
          if (orderList) {
            for (var x in orderList) {
              var order = orderList[x];

              orderListThis.push({
                id: order.order_id,
                distribute_level_label: order.distribute_level_label,
                distribute_profit: order.distribute_profit,
                order_created_at_str: order.order_created_at_str,
                status_str: order.status_str,
                order_status_str: order.order_status_str,
                orderNumber: order.increment_id,
                product_name: order.product_name,
                product_image: order.product_image,
                price: order.order_price_total_deduct_discount,
                symbolCode: order.symbolCode,
                //statusStr: order.order_status,
                remark: order.remark,
                amountReal: order.grand_total,
                product_items: order.item_products,
                order_item_id: order.order_item_id,
                currency_symbol: order.currency_symbol
              })
            }
          }

          that.setData({
            orderList: orderListThis
          });
        } else {
          this.setData({
            orderList: null,
            //logisticsMap: {},
            //goodsMap: {}
          });
        }
        app.saveReponseHeader(res);
      }
    })
    var winInfo = wx.getSystemInfo({
      success: function (res) {
        var windowHeight = res.windowHeight;
        var statusBarHeight = res.statusBarHeight;
        var titleBarHeight = 0
        if (res.model.indexOf('iPhone') !== -1) {
          titleBarHeight = 44
        } else {
          titleBarHeight = 48
        }
        var query = wx.createSelectorQuery();
        query.select('.status-box').boundingClientRect()
        query.exec((res) => {
          var listHeight = res[0].height; // 获取list高度
          that.setData({ bodyHeight: windowHeight - statusBarHeight - titleBarHeight - listHeight });
        })


      }
    });
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