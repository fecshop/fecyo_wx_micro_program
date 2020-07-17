var wxpay = require('../../utils/pay.js')
var app = getApp()
// 语言
var util = require('../../utils/util.js')
import event from '../../utils/event'

Page({
  data: {
    statusType: [], //["全部订单","待付款", "待发货", "待收货",  "已完成"], //["待付款", "待发货", "待收货", "待评价", "已完成"],
    currentType: 0,
    allDistributeProfitInfo: {},
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
  
  onLoad: function (e) {
    var that = this
    var order_item_id = e.order_item_id
    console.log("order_item_id:" + order_item_id)
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    // 语言
    // 设置当前页面的language变量 - 每个页面都要有
    this.setLanguage();
    event.on("languageChanged", this, this.changeLanguage); // (2)
    // 设置当前页面的language Index - 每个页面都要有
    wx.T.setLocaleByIndex(wx.T.langIndex);
    // 语言 - 结束
    this.getOrderDetail(order_item_id);
  },
  onReady: function () {
    // 生命周期函数--监听页面初次渲染完成

  },
  getOrderDetail: function (order_item_id) {
    console.log("getOrderDetail");
    console.log("order_item_id:" + order_item_id)
    // 获取订单列表
    wx.showLoading();
    var that = this;
    
    wx.request({
      url: app.globalData.urls + '/distribute/profit/view',
      data: {
        order_item_id: order_item_id
      },
      header: app.getRequestHeader(),
      success: (res) => {
        console.log(res)
        wx.hideLoading();
        if (res.data.code == 200) {
          var allDistributeProfitInfo = res.data.data.allDistributeProfitInfo
          that.setData({
            allDistributeProfitInfo: allDistributeProfitInfo
          });
        }
        app.saveReponseHeader(res);
      }
    })
    
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