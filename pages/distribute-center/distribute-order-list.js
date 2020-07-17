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
  statusTap: function (e) {
    var obj = e;
    var count = 0;
    for (var key in obj) {
      count++;
    }
    if (count == 0) {
      var curType = 0;
    } else {
      console.log('出现Cannot read property "dataset" of undefined;这样的错误是正常的，不用管！');
      var curType = e.currentTarget.dataset.index;
    }
    this.data.currentType = curType
    this.setData({
      currentType: curType
    });
    this.setData({
      page: 0,
      orderList: []
    });
    this.getOrderList();
  },
  orderDetail: function (e) {
    var orderId = e.currentTarget.dataset.id;
    var order_increment_id = e.currentTarget.dataset.increment_id;
    wx.navigateTo({
      url: "/pages/distribute-center/distribute-order-view?id=" + order_increment_id + '&share=1'
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
    //statusType: ["全部订单", "待付款", "待发货", "待收货", "已完成"]
    that.setData({
      statusType: [
        that.data.language.all_order,
        that.data.language.order_wait_pay,
        that.data.language.order_wait_deliver,
        that.data.language.pending_receipt,
        that.data.language.order_complete,
      ]
    })

    var currentType = e.currentType;
    this.data.currentType = currentType;
    if (currentType) {
      that.setData({
        currentType: currentType
      });
    }
    that.statusTap(e);
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
    var requestStatus = that.data.currentType;
    var wxRequestOrderStatus = '';
    if (requestStatus == 0) {
      wxRequestOrderStatus = 'all'
    } else {
      wxRequestOrderStatus = requestStatus - 1;
    }
    //this.getOrderStatistics();
    wx.request({
      url: app.globalData.urls + '/distribute/customerorder/index',
      data: {
        wxRequestOrderStatus: wxRequestOrderStatus,
        p: that.data.page,
        withItems: 1
      },
      header: app.getRequestHeader(),
      success: (res) => {
        console.log(res)
        wx.hideLoading();
        if (res.data.code == 200) {
          var orderList = res.data.data.orderList;
          var orderListThis = that.data.orderList;
          if (orderList) {
            for (var x in orderList) {
              var order = orderList[x];
              var order_status = order.order_status
              var statusStr = '';
              var status = 0;
              if (order_status == 'payment_pending' || order_status == 'payment_processing') {
                statusStr = that.data.language.order_wait_pay  //'待支付'
                status = 0
              } else if (order_status == 'payment_canceled') {
                statusStr = that.data.language.payment_canceled  //'已取消'
                status = -1
              } else if (order_status == 'canceled') {
                statusStr = that.data.language.canceled  //'已取消'
                status = -2
              } else if (order_status == 'payment_confirmed') {
                statusStr = that.data.language.order_payment_confirmed   //'已支付待审核'
                status = 1
              } else if (order_status == 'processing') {
                statusStr = that.data.language.order_wait_deliver  //'待发货'
                status = 2

              } else if (order_status == 'dispatched') {
                statusStr = that.data.language.pending_receipt  //'已发货待确认'
                status = 3
              } else if (order_status == 'received') {
                statusStr = that.data.language.order_received //'已收货'
                status = 4
              } else if (order_status == 'completed') {
                statusStr = that.data.language.order_complete //'已完成'
                status = 5
              }
              orderListThis.push({
                statusStr: statusStr,
                id: order.order_id,
                status: status,
                orderNumber: order.increment_id,
                is_reviewed: order.is_reviewed,
                dateAdd: order.created_at_str,
                //statusStr: order.order_status,
                remark: order.remark,
                amountReal: order.grand_total,
                product_items: order.item_products,
                currency_symbol: order.currency_symbol
              })
            }
          }

          that.setData({
            orderList: orderListThis,
            //logisticsMap: res.data.data.logisticsMap,
            //goodsMap: res.data.data.goodsMap
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