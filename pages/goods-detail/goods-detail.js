//index.js
//获取应用实例
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');
// 语言
var util = require('../../utils/util.js')
import event from '../../utils/event'

Page({
  data: {
    autoplay: true,
    interval: 10000,
    duration: 500,
    goodsDetail: {},
    coupons:[],
    swiperCurrent: 0,
    hasMoreSelect: false,
    selectSize: "",
    selectSizePrice: 0,
    shopNum: 0,
    //语言 - begin
    language: '',
    //语言 - end
    hideShopPopup: true,
    hideShopPopupCoupon: true,
    buyNumber: 0,
    buyNumMin: 1,
    buyNumMax: 50,
    favicon: 0,
    selectptPrice: 0,
    propertyChildIds: "",
    propertyChildNames: "",
    canSubmit: false, //  选中规格尺寸时候是否允许加入购物车
    shopCarInfo: {},
    shopType: "addShopCar",//购物类型，加入购物车或立即购买，默认为加入购物车
    tabArr: {
      curHdIndex: 0,
      curBdIndex: 0
    },
    wxlogin: true,
    sharecode: true,
    sharebox: true,
		title:"商品详情",
    barBg: 'red',
		color: '#ffffff',
    microshare: {}
  },

  //事件处理函数
  swiperchange: function (e) {
    //console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
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
    //this.getProductDetails()
  },
  changeLanguage() {
    var lang = wx.T.getLanguage()
    this.setData({
      language: lang,
      selectSize: lang.select_attribute
    });
    this.getProductDetails()
  },
  onLoad: function (e) {
    var that = this;
    // 语言
    // 设置当前页面的language变量 - 每个页面都要有
    this.setLanguage();
    event.on("languageChanged", this, this.changeLanguage); // (2)
    // 设置当前页面的language Index - 每个页面都要有
    wx.T.setLocaleByIndex(wx.T.langIndex);
    // 语言 - 结束
    
    if (!e.id) { //扫码进入
      var scene = decodeURIComponent(e.scene);
      if (scene.length > 0 && scene != undefined) {
        var scarr = scene.split(',');
        var dilist = [];
        for (var i = 0; i < scarr.length; i++) {
          dilist.push(scarr[i].split('='))
        }
        if (dilist.length > 0) {
          var dict = {};
          for (var j = 0; j < dilist.length; j++) {
            dict[dilist[j][0]] = dilist[j][1]
          }
          var id = dict.i;
          var vid = dict.u;
          var sid = dict.s;
          that.setData({
            id: id
          })
          if (vid) {
            wx.setStorage({
              key: 'inviter_id_' + id,
              data: vid
            })
          }
          if (sid) { that.setData({ share: sid }); }
        }
      }
    }
    if (!e.scene) { //链接进入
      if (e.inviter_id) {
        wx.setStorage({
          key: 'inviter_id_' + e.id,
          data: e.inviter_id
        })
      }
      if (e.share) { that.setData({ share: e.share }); }
      that.setData({
        id: e.id
      })
    }
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    this.getProductDetails()
    this.getfav();
    // 获取购物车数据
    wx.getStorage({
      key: 'shopCarInfo',
      success: function (res) {
        //console.log("shopCarInfo>>>")
        //console.log(res.data)
        that.setData({
          shopCarInfo: res.data,
          shopNum: res.data.shopNum
        });
      }
    })
  },
  distributeAddHomeProduct: function(e) {
    var that = this;
    var sku_type = e.currentTarget.dataset.type;
    var productId = that.data.id;

    wx.request({
      url: app.globalData.urls + '/distribute/mainpage/product',  // '/shop/goods/detail',
      header: app.getPostRequestHeader(),
      data: {
        product_id: productId,
        sku_type: sku_type
      },
      method: 'POST',
      success: function (res) {
        if (res.data.code == 200) {
          var goodsDetail = that.data.goodsDetail
          if (sku_type == 'add') {
            goodsDetail.isDistributeHomeProduct = true
          } else {
            goodsDetail.isDistributeHomeProduct = false
          }
          that.setData({
            goodsDetail: goodsDetail
          })
        }
        app.saveReponseHeader(res);
      }
    });


    // 





  },
  getProductDetails: function() {
    var that = this
    wx.request({
      url: app.globalData.urls + '/catalog/product/index',  // '/shop/goods/detail',
      header: app.getRequestHeader(),
      data: {
        product_id: that.data.id
      },
      success: function (res) {
        // console.log(res)
        var selectSizeTemp = "";
        var goodsDetail = res.data.data.product;
        if (!goodsDetail) {
          wx.showModal({
            title: that.data.language.error,
            content: "产品不存在或已下架",
            showCancel: false,
            success(res){
              // 返回上一层
              wx.navigateBack()
            }
          })
          return
        }
        var is_custom_option_empty = true;
        // 判断是否为空
        if (goodsDetail.custom_option) {
          for (var x in goodsDetail.custom_option) {
            is_custom_option_empty = false;
          }
        }
        
        if (!is_custom_option_empty || goodsDetail.options.length != 0) {
          for (var i = 0; i < goodsDetail.options.length; i++) {
            selectSizeTemp = selectSizeTemp + " " + goodsDetail.options[i].label;
          }
          that.setData({
            hasMoreSelect: true,
            selectSize: that.data.selectSize + selectSizeTemp,
            // selectSizePrice: res.data.data.product.price_info.special_price, // 该设定与下6行重复
            selectptPrice: res.data.data.product.price_info.price
          });
        }
        
        that.setData({
          goodsDetail: res.data.data.product,
          microshare: res.data.data.microshare,
          //coupons: res.data.data.coupons,
          selectSizePrice: res.data.data.product.price_info.special_price ? res.data.data.product.price_info.special_price:0,
          buyNumber: 1,  //(res.data.data.basicInfo.stores > 0) ? 1 : 0,
        });
        // 秒杀倒计时
        var goodsDetail = res.data.data.product
        if (goodsDetail.price_info.seckill && goodsDetail.price_info.seckill.is_seckilling) {
          // that.loveTime(goodsDetail)
          setInterval(function () {
            var end_time = goodsDetail.price_info.seckill.end_time * 1000;
            var date = end_time - Date.parse(new Date());
            date = date > 0 ? date : 0;
            var hours = Math.floor(date / 1000 / 60 / 60);
            var hoursmod = date - (hours * 1000 * 60 * 60);
            var minutes = Math.floor(hoursmod / 1000 / 60);
            var minutesmod = date - (hours * 1000 * 60 * 60) - (minutes * 1000 * 60);
            var seconds = Math.floor(minutesmod / 1000); // 到这里结束，是将总毫秒转化成对应天数+小时数+分钟数+秒数的转换方法
            // 小时数最高99
            if (hours > 99) {
              hours = 99;
            }
            hours = hours >= 10 ? hours : '0' + hours;
            minutes = minutes >= 10 ? minutes : '0' + minutes;
            seconds = seconds >= 10 ? seconds : '0' + seconds;

            goodsDetail.price_info.seckill.end_hours = hours
            goodsDetail.price_info.seckill.end_mins = minutes
            goodsDetail.price_info.seckill.end_seconds = seconds

            that.setData({
              goodsDetail: goodsDetail
            })

          }, 1000);
          //that.setCountDown();
        }
        WxParse.wxParse('article', 'html', res.data.data.product.description, that, 5);
        app.saveReponseHeader(res);
      }
    });
  },
  
  goShopCar: function () {
    wx.reLaunch({
      url: "/pages/cart/cart"
    });
  },
  toAddShopCar: function () {
    this.setData({
      shopType: "addShopCar"
    })
    this.bindGuiGeTap();
  },
  tobuy: function () {
    this.setData({
      shopType: "tobuy"
    });
    this.bindGuiGeTap();
  },
  
  /**
   * 规格选择弹出框
   */
  bindGuiGeTap: function () {
    this.setData({
      hideShopPopup: false
    })
  },
  fetchCoupon: function (e) {
    var self = this;
    var fetched = e.currentTarget.dataset.fetched;
    var coupon_index = e.currentTarget.dataset.id;
    console.log(fetched)
    if (fetched == 'true' || fetched == true) {
      console.log(fetched)
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
            url: "/pages/login/login"
          })
          return
        } else if (res.data.code == 2000003) {
          wx.showModal({
            title: '错误',
            content: '优惠券领取失败',
            showCancel: false
          })
          return;
        } else if (res.data.code == 200) {
          app.saveReponseHeader(res)
          self.bindGuiGeTapCoupon()
          wx.showToast({
            title: '优惠券领取成功',
            icon: 'success',
            duration: 2000
          })
        }


      }
    })
  },
  /**
   * 规格选择弹出框
   */
  bindGuiGeTapCoupon: function () {
    //var product_id = e.currentTarget.dataset.product_id;
    var self = this
    wx.showLoading({
      title: 'loading...',
    })
    wx.request({
      url: app.globalData.urls + '/catalog/product/coupons',  // '/shop/goods/detail',
      header: app.getRequestHeader(),
      data: {
        product_id: self.data.id
      },
      success: function (res) {
        self.setData({
          hideShopPopupCoupon: false,
          coupons: res.data.data.coupons
        })
      }
    });
    wx.hideLoading();
  },
  /**
   * 规格选择弹出框隐藏
   */
  closePopupTap: function () {
    this.setData({
      hideShopPopup: true
    })
  },
  closePopupTapCoupon: function () {
    this.setData({
      hideShopPopupCoupon: true
    })
  },
  numJianTap: function () {
    if (this.data.buyNumber > this.data.buyNumMin) {
      var currentNum = this.data.buyNumber;
      currentNum--;
      this.setData({
        buyNumber: currentNum
      })
    }
  },
  numJiaTap: function () {
    if (this.data.buyNumber < this.data.buyNumMax) {
      var currentNum = this.data.buyNumber;
      currentNum++;
      this.setData({
        buyNumber: currentNum
      })
    }
  },
  // options 跳转
  labelOptionsItemTap: function (event) {
    var optionid = event.currentTarget.dataset.optionid
    this.setData({
      id: optionid,
      selectSize: this.data.language.select_attribute
    })
    this.getProductDetails()
    //wx.navigateTo({
    //  url: '/pages/goods-detail/goods-detail?id=' + optionid
    //})

  },

  
  /**
  * 加入购物车
  */
  addShopCar: function () {
    var that = this
    if (that.data.buyNumber < 1) {
      wx.showModal({
        title: that.data.language.tips,
        content: that.data.language.buy_amount_min + "1" + that.data.language.item,
        showCancel: false
      })
      return;
    }
    
    wx.showLoading({
      title: 'loading...',
    })
    var requestHeader= app.getRequestHeader();
    requestHeader['Content-Type'] = 'application/x-www-form-urlencoded';
    wx.request({
      url: app.globalData.urls + '/checkout/cart/add',
      method: 'POST',
      header: requestHeader,
      data: {
        qty: that.data.buyNumber,
        product_id: that.data.goodsDetail._id
      },
      success: function (res) {
        if (res.data.code == 200) {
          var qty = res.data.data.items_count;
          var shopCarInfo = {}
          shopCarInfo.shopNum = qty
          that.setData({
            shopNum: qty,
          })
          wx.setStorage({
            key: "shopCarInfo",
            data: shopCarInfo
          })
          console.log(shopCarInfo)
          app.getShopCartNum()
          //that.bindGuiGeTap();
          wx.showToast({
            title: that.data.language.add_to_cart_success ,
            icon: 'success',
            duration: 2000
          });
          that.closePopupTap();
        } else if (res.data.code == 1100003) {
          wx.navigateTo({
            url: "/pages/login/login"
          })
        } else {
          wx.showModal({
            title: that.data.language.error,
            content: that.data.language.add_to_cart_fail,
            showCancel: false
          })
        }
      }
    })
  },
	/**
	  * 立即购买
	  */
  buyNow: function () {
    var that = this
    if (that.data.buyNumber < 1) {
      wx.showModal({
        title: that.data.language.tips,
        content: that.data.language.buy_amount_min + "1" + that.data.language.item,
        showCancel: false
      })
      return;
    }
    
    wx.showLoading({
      title: 'loading...',
    })
    var requestHeader = app.getRequestHeader();
    requestHeader['Content-Type'] = 'application/x-www-form-urlencoded';
    wx.request({
      url: app.globalData.urls + '/checkout/cart/add',
      method: 'POST',
      header: requestHeader,
      data: {
        qty: that.data.buyNumber,
        buy_now: 1,
        product_id: that.data.goodsDetail._id
      },
      success: function (res) {
        if (res.data.code == 200) {
          var qty = res.data.data.items_count;
          var shopCarInfo = {}
          shopCarInfo.shopNum = qty
          that.setData({
            shopNum: qty,
          })
          wx.setStorage({
            key: "shopCarInfo",
            data: shopCarInfo
          })
          console.log(shopCarInfo)
          app.getShopCartNum()
          //that.bindGuiGeTap();
          wx.showToast({
            title: that.data.language.add_to_cart_success,
            icon: 'success',
            duration: 2000
          });
          that.closePopupTap();
          wx.navigateTo({
            url: "/pages/pay-order/pay-order?orderType=buyPT"
          })
        } else if (res.data.code == 1100003) {
          wx.navigateTo({
            url: "/pages/login/login"
          })
        } else {
          wx.showModal({
            title: that.data.language.error,
            content: that.data.language.add_to_cart_fail,
            showCancel: false
          })
        }
      }
    }) 
  },
  /*
  onShareAppMessage: function () {
    var that = this;
    that.setData({ sharebox: true })
    //console.log(that.data.goodsDetail.main_image)
    return {
      title: that.data.goodsDetail.name,
      path: '/pages/goods-detail/goods-detail?id=' + this.data.goodsDetail._id + '&share=1',
      imageUrl: that.data.goodsDetail.main_image,  
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  */
  getfav: function () {
    //console.log(e)
    var that = this;
    var id = that.data.id
    wx.request({
      url: app.globalData.urls + '/catalog/product/getfav',
      data: {
        //nameLike: this.data.goodsDetail.name,
        //token: app.globalData.token
        product_id: id,
      },
      header: app.getRequestHeader(),
      success: function (res) {
        if (res.data.code == 200) {
          if (res.data.data.fav == 1) {
            that.setData({
              favicon: 1
            });
          }
        }
      }
    })
  },
  fav: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/catalog/product/favorite',
      data: {
        product_id: that.data.id,
        type: 'add',
        //token: app.globalData.token
      },
      header: app.getRequestHeader(),
      success: function (res) {
        if (res.data.code == '200') {
          /*
          wx.showToast({
            title: '收藏成功',
            icon: 'success',
            image: '../../images/active.png',
            duration: 2000
          })
          */
          wx.showToast({
            title: that.data.language.add_to_collection_success,
            duration: 2000
          })
          that.setData({
            favicon: 1
          });
        } else if (res.data.code == '1100003') {
          // 需要登陆
          wx.navigateTo({
            url: "/pages/login/login"
          })
        }
        app.saveReponseHeader(res);
      }
    })
  },
  del: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/catalog/product/favorite',
      data: {
        product_id: that.data.id,
        type: 'del',
        //token: app.globalData.token
      },
      header: app.getRequestHeader(),
      success: function (res) {
        if (res.data.code == 200) {
          /*
          wx.showToast({
            title: '取消收藏',
            icon: 'success',
            image: '../../images/error.png',
            duration: 2000
          })
          */
          wx.showToast({
            title: that.data.language.remove_for_collection_success,
            duration: 2000
          })

          that.setData({
            favicon: 0
          });
        } else if(res.data.code == '1100003') {
          // 需要登陆
          wx.navigateTo({
            url: "/pages/login/login"
          })
        }
        app.saveReponseHeader(res);
      }
    })
  },
  
  gohome: function () {
    wx.switchTab({
      url: "/pages/index/index"
    })
  },
  tabFun: function (e) {
    var _datasetId = e.target.dataset.id;
    var _obj = {};
    _obj.curHdIndex = _datasetId;
    _obj.curBdIndex = _datasetId;
    this.setData({
      tabArr: _obj
    });
  },
  onShow: function () {
    var that = this;
    setTimeout(function () {
      if (app.globalData.usinfo == 0) {
        that.setData({
          wxlogin: false
        })
      }
      //that.goPingtuan();
      //that.goPingList();
    }, 1000)
  },
  
  getShareBox:function(){
    this.setData({sharebox: false})
  },

  
  getcode: function () {
    var that = this;
    wx.showLoading({
      title: that.data.language.generating,
    })
    var product_id = that.data.goodsDetail._id
    var requestHeader = app.getRequestHeader();
    requestHeader['Content-Type'] = 'application/x-www-form-urlencoded';
    wx.request({
      url: app.globalData.urls + '/wx/helper/qrcodeproduct',
      header: requestHeader,
      method: 'POST',
      data: {
        product_id: product_id,
        page: "pages/goods-detail/goods-detail?id=" + product_id
      },
      success: function (res) {
        wx.hideLoading()
        if (res.data.code == 200) {
          app.saveReponseHeader(res)
          wx.downloadFile({
            url: res.data.data.qrcodeimg,
            success: function (res) {
              //console.log(res)
              that.setData({
                codeimg: res.tempFilePath,
                sharecode: false,
                sharebox: true
              });
            }
          })
        }
      }
    });
  },
  savecode: function () {
    var that = this;
    wx.saveImageToPhotosAlbum({
      filePath: that.data.codeimg,
      success(res) {
        wx.showToast({
          title: that.data.language.save_success,
          icon: 'success',
          duration: 2000
        })
      }
    })
    that.setData({
      sharecode: true,
    })
  },
  closeshare: function () {
    this.setData({
      sharebox: true,
      sharecode: true
    })
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
    var goodsId = that.data.goodsDetail._id
    var shareUrl = '/pages/goods-detail/goods-detail?id=' + goodsId
    if (isDistribute && distributeCode && bidCookieName) {
      shareUrl += '&' + bidCookieName + '=' + distributeCode
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
  loveTime: function () {
    var goodsDetail = this.goodsDetail
    var end_time = goodsDetail.price_info.seckill.end_time * 1000 ;
    var date = end_time - Date.parse(new Date());
    date = date > 0 ? date : 0;
    var hours = Math.floor(date / 1000 / 60 / 60) ;
    var hoursmod = date - (hours * 1000 * 60 * 60) ;
    var minutes = Math.floor(hoursmod / 1000 / 60);
    var minutesmod = date - (hours * 1000 * 60 * 60) - (minutes * 1000 * 60);
    var seconds = Math.floor(minutesmod / 1000); // 到这里结束，是将总毫秒转化成对应天数+小时数+分钟数+秒数的转换方法
    hours = hours >= 10 ? hours : '0' + hours;
    minutes = minutes >= 10 ? minutes : '0' + minutes;
    seconds = seconds >= 10 ? seconds : '0' + seconds;

    goodsDetail.price_info.seckill.end_hours = hours
    goodsDetail.price_info.seckill.end_mins = minutes
    goodsDetail.price_info.seckill.end_seconds = seconds

    this.setData({
      goodsDetail: goodsDetail
    })
    
  }

  // 

})
