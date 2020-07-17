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
    categoryId: '',
    page: 0,
    goods: [],
    microshare: {},
    isLoadProduct: false
    //语言 - end
  },

  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-detail/goods-detail?id=" + e.currentTarget.dataset.id
    })
  },
  setLanguage() {
    this.setData({
      language: wx.T.getLanguage()
    });
    //this.fetchCategory();
  },
  changeLanguage() {
    this.setData({
      language: wx.T.getLanguage()
    });
    this.fetchCategory();
  },
  onLoad: function (e) {
    wx.showLoading();
    console.log(e.id)

    var that = this;
    that.setData({
      categoryId: e.id
    });
    // 语言
    // 设置当前页面的language变量 - 每个页面都要有
    this.setLanguage();
    event.on("languageChanged", this, this.changeLanguage); // (2)
    // 设置当前页面的language Index - 每个页面都要有
    wx.T.setLocaleByIndex(wx.T.langIndex);
    // 语言 - 结束
    
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    that.fetchCategory();
  },
  fetchCategory: function () {
    var that = this;
    that.setData({
      page: that.data.page + 1
    });
    wx.request({
      url: app.globalData.urls + '/catalog/category/wxindex',
      header: app.getRequestHeader(),
      data: {
        categoryId: that.data.categoryId,
        p: that.data.page
      },
      success: function (res) {
        wx.hideLoading();
        that.setData({
          //goods: [],
          loadingMoreHidden: true
        });
        
        if (res.data.code != 200 || res.data.data.products.length == 0) {
          that.setData({
            loadingMoreHidden: false,
          });
          return;
        }
        var goods = that.data.goods;
        for (var i = 0; i < res.data.data.products.length; i++) {
          goods.push(res.data.data.products[i]);
        }
        that.setData({
          goods: goods,
          microshare: res.data.data.microshare,
        });
        that.setData({
          isLoadProduct: false,
        });
        app.saveReponseHeader(res);
      }
    })
  },
  loadProduct: function(){
    console.log("eeeeee")
    //this.fetchCategory()

    var that = this
    if (that.data.isLoadProduct == false) {
      that.setData({
        isLoadProduct: true,
      });
      that.fetchCategory()
    }
    
  },
  onShareAppMessage: function () {
    var that = this;
    var isDistribute = that.data.microshare.isDistribute;
    var pageTitle = that.data.microshare.pageTitle;
    var pageImgUrl = that.data.microshare.pageImgUrl;
    var distributeCode = that.data.microshare.distributeCode;
    var bidCookieName = that.data.bidCookieName;
    console.log(that.data.microshare)
    console.log(isDistribute)
    console.log("distributeCode:" + distributeCode)
    console.log("bidCookieName:" + bidCookieName)
    // 得到分享url
    var shareUrl = '/pages/cate-list/cate-list'
    if (isDistribute && distributeCode && bidCookieName) {
      shareUrl += '?' + bidCookieName + '=' + distributeCode
    }
    console.log("pageTitle:" + pageTitle)
    console.log("shareUrl:" + shareUrl)
    console.log("pageImgUrl:" + pageImgUrl)
    return {
      title: pageTitle,
      path: shareUrl,
      imageUrl: pageImgUrl
    }
  },

})
