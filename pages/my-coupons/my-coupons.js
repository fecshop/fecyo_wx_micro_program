//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    coupons:[],
    coupon_code: ''
  },
  onLoad: function () {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
  },
  onShow : function () {
    this.getMyCoupons();
  },

  listenerCouponsInput: function (e) {
    this.data.coupon_code = e.detail.value;
  },
  listenerDuiHuan: function () {
    var self = this
    var requestHeader = app.getRequestHeader();
    requestHeader['Content-Type'] = 'application/x-www-form-urlencoded';
    wx.request({
      url: app.globalData.urls + '/coupon/fetch/customerexchange',
      data: {
        coupon_code: this.data.coupon_code,
      },
      method: 'POST',
      header: requestHeader,
      success: function (res) {
        console.log(res)
        if (res.data.code == 200) {
          app.saveReponseHeader(res);
          self.getMyCoupons()
          wx.showToast({
            title: '优惠券领取成功',
            icon: 'success',
            duration: 2000
          })
          return
        } else if (res.data.code == '1100003') {
          wx.navigateTo({
            url: "/pages/login/login"
          })
        } else {
          wx.showModal({
            title: '兑换失败',
            content: '优惠券码兑换失败',
            showCancel: false
          })
          return;
        }
      }
    })
  },
  getMyCoupons: function () {
    var that = this
    var page = 1
    var type = ''
    var requestHeader = app.getRequestHeader();
    requestHeader['Content-Type'] = 'application/x-www-form-urlencoded';
    wx.request({
      url: app.globalData.urls + '/customer/coupon',
      data: {
        p: page,
        type: type
      },
      header: requestHeader,
      success: function (res) {
        if (res.data.code == 200) {
          var coupons = res.data.data.coupons;
          if (coupons.length > 0) {
            that.setData({
              coupons: coupons,
              loadingMoreHidden: true
            });
          }
        }else{
          that.setData({
            loadingMoreHidden: false
          });
        }
      }
    })
  },
  goBuy:function(){
    wx.navigateTo({
      url: '/pages/coupons/coupons'
    })
  },
  gohome: function () {
    wx.switchTab({
      url: "/pages/index/index"
    })
  }

})
