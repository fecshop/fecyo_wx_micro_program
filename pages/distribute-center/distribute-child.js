var wxpay = require('../../utils/pay.js')
var app = getApp()
// 语言
var util = require('../../utils/util.js')
import event from '../../utils/event'

Page({
  data: {
    pointAmount: 0.00,
    statusType: [], //["全部订单","待付款", "待发货", "待收货",  "已完成"], //["待付款", "待发货", "待收货", "待评价", "已完成"],
    currentType: 0,
    childColl: [],
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
    this.getChildList();
  },
  onReady: function () {
    // 生命周期函数--监听页面初次渲染完成
  },
  getChildList: function () {
    console.log("getPgetChildListointList");
    // 获取订单列表
    wx.showLoading();
    var that = this;
    that.setData({
      page: that.data.page + 1
    });
    
    //this.getOrderStatistics();
    wx.request({
      url: app.globalData.urls + '/distribute/child/index',
      data: {
        p: that.data.page
      },
      header: app.getRequestHeader(),
      success: (res) => {
        console.log(res)
        wx.hideLoading();
        if (res.data.code == 200) {
          var childColl = res.data.data.childColl;
          var childCollThis = that.data.childColl;
          console.log(childColl)
          if (childColl) {
            for (var x in childColl) {
              childCollThis.push(childColl[x])
            }
          }
          console.log(childCollThis)
          that.setData({
            childColl: childCollThis
          });
        } else {
          that.setData({
            childColl: null,
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