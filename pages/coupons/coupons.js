//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    coupons: '',
    coupon_code: '',
    busid: 0
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
          self.getCoupons()
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
  onLoad: function () {
    this.getCoupons()
  },
  
  getCoupons: function () {
    var self = this
    wx.request({
      url: app.globalData.urls + '/coupon/fetch/lists',
      data: {},
      header: app.getRequestHeader(),
      success: function (res) {
        if (res.data.code == '200') {
          self.setData({
            coupons: res.data.data.coupons,
          });
        } else if (res.data.code == '1100003') {
          wx.navigateTo({
            url: "/pages/login/login"
          })
        }
      }
    })
  },
  fetchCoupon: function (e) {
    var self = this;
    var fetched = e.currentTarget.dataset.fetched;
    var coupon_index = e.currentTarget.dataset.index;
    if (fetched == 'true') {
      return;
    }
    wx.showLoading({
      title: 'loading...',
    })
    var requestHeader = app.getRequestHeader();
    requestHeader['Content-Type'] = 'application/x-www-form-urlencoded';
    wx.request({
      url: app.globalData.urls + '/coupon/fetch/customer',
      header: requestHeader,
      data: {
        coupon_id: e.currentTarget.dataset.id
      },
      method: 'POST',
      success: function (res) {
        wx.hideLoading();
        if (res.data.code == 1100003) {
          wx.navigateTo({
            url: "/pages/my/my"
          })
        } else if (res.data.code == 2000003) {
          wx.showModal({
            title: '错误',
            content: '优惠券领取失败',
            showCancel: false
          })
          return;
        } else if (res.data.code == 200) {
          app.saveReponseHeader(res);
          self.getCoupons()
          wx.showToast({
            title: '优惠券领取成功',
            icon: 'success',
            duration: 2000
          })
        }
        
        
      }
    })
  }
})
