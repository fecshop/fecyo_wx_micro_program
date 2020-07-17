var wxpay = require('../../utils/pay.js')
var app = getApp()
// 语言
var util = require('../../utils/util.js')
import event from '../../utils/event'

Page({
  data: {
    walletAmount: 0.00,
    statusType: [], //["全部订单","待付款", "待发货", "待收货",  "已完成"], //["待付款", "待发货", "待收货", "待评价", "已完成"],
    currentType: 0,
    walletList: [],
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
      walletList: []
    });
    this.getWalletList();
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
        that.data.language.all_detail,
        that.data.language.all_income,
        that.data.language.all_expenses,
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
  getWalletList: function () {
    console.log("getWalletList");
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
    } else if (requestStatus == 1) {
      wxRequestOrderStatus = 'recharge'
    } else if (requestStatus == 2) {
      wxRequestOrderStatus = 'cash'
    }

    //this.getOrderStatistics();
    wx.request({
      url: app.globalData.urls + '/distribute/wallet/index',
      data: {
        type: wxRequestOrderStatus,
        p: that.data.page
      },
      header: app.getRequestHeader(),
      success: (res) => {
        console.log(res)
        wx.hideLoading();
        if (res.data.code == 200) {
          var walletList = res.data.data.wallet_historys;
          var wallet_amount = res.data.data.wallet_amount;
          var walletListThis = that.data.walletList;
          if (walletList) {
            for (var x in walletList) {
              walletListThis.push(walletList[x])
            }
          }
          that.setData({
            walletList: walletListThis,
            walletAmount: wallet_amount,
          });
        } else {
          that.setData({
            walletList: null,
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