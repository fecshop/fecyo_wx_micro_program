//const WXAPI = require('apifm-wxapi')
var wxpay = require('../../utils/pay.js')
var app = getApp()
// 语言
var util = require('../../utils/util.js')
import event from '../../utils/event'


Page({
  data: {
    order_increment_id: "",
    shipping_company:"",
    tracking_number:"",
    traces:[]
  },
  onLoad: function (e) {
    var order_increment_id = e.order_increment_id;
    // this.data.order_increment_id = order_increment_id;
    // console.log(order_increment_id)
    this.setData({
      order_increment_id: order_increment_id
    });
  },
  onShow: function () {
    wx.showLoading();
    var that = this;
    
    wx.request({
      url: app.globalData.urls + '/customer/order/shipping',
      data: {
        order_increment_id: that.data.order_increment_id
      },
      header: app.getRequestHeader(),
      success: (res) => {
        //console.log(res)
        wx.hideLoading();
        if (res.data.code == 200) {
          
          that.setData({
            shipping_company: res.data.data.shipping_company,
            tracking_number: res.data.data.tracking_number,
            traces: res.data.data.traces
          });
        }
        app.saveReponseHeader(res);
      }
    })


  }
})
