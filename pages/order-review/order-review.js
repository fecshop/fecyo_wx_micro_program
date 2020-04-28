var app = getApp();
// 语言
var util = require('../../utils/util.js')
import event from '../../utils/event'

Page({
  data: {
    //语言 - begin
    language: '',
    //语言 - end
    orderId: 0,
    goodsList: [],
    orderStatus: 0,
    yunPrice: "0.00"
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
  languageChange() {
    var lang = wx.T.getLanguage()
    this.setData({
      language: lang,
      selectSize: lang.select_attribute
    });
    this.onShow()
  },
  onLoad: function (e) {
    var that = this;
    var orderId = e.id;
    if (!e.share) {
      that.setData({ share: true });
    }
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }
    // 语言
    // 设置当前页面的language变量 - 每个页面都要有
    this.setLanguage();
    event.on("languageChanged", this, this.languageChange); // (2)
    // 设置当前页面的language Index - 每个页面都要有
    wx.T.setLocaleByIndex(wx.T.langIndex);
    // 语言 - 结束

    that.data.orderId = orderId;
    that.setData({
      orderId: orderId
    });
  },
  onShow: function () {
    var that = this;
    wx.showLoading();
    setTimeout(function () {
      wx.request({
        url: app.globalData.urls + '/customer/order/wxview',
        header: app.getRequestHeader(),
        data: {
          token: app.globalData.token,
          increment_id: that.data.orderId
        },
        success: (res) => {
          wx.hideLoading();
          if (res.data.code != 200) {
            wx.showModal({
              title: that.data.language.error,  //'错误',
              content: that.data.language.order_get_info_fail,  //'订单信息获取错误',
              showCancel: false
            })
            return;
          }
          var order = res.data.data.order;
          var product_items = order.products
          var goods = [];
          if (order.products) {
            for (var x in product_items) {
              var product_item = product_items[x]
              goods.push({
                goodsName: product_item.name,
                product_id: product_item.product_id,
                item_id: product_item.item_id,
                is_reviewed: product_item.is_reviewed,
                amount: product_item.price,
                property: product_item.custom_option_info_str,
                number: product_item.qty,
                pic: product_item.imgUrl,
              })
            }
          }
          var statusStr = '';
          var status = 0;
          var order_status = order.order_status;
          if (order_status == 'payment_pending' || order_status == 'payment_processing') {
            statusStr = that.data.language.order_wait_pay //'待支付'
            status = 0
          } else if (order_status == 'payment_confirmed') {
            statusStr = that.data.language.order_wait_deliver  //'已支付待发货'
            status = 1
          } else if (order_status == 'payment_canceled') {
            statusStr = that.data.language.canceled //'已取消'
            status = -1
          } else if (order_status == 'dispatched') {
            statusStr = that.data.language.pending_receipt //'已发货待确认'
            status = 2
          } else if (order_status == 'completed') {
            statusStr = that.data.language.order_complete //'已完成'
            status = 3
          }
          
          var orderDetail = {
            statusStr: order.order_status,
            orderId: order.order_id,
            trackingNumber: order.tracking_number,
            trackingCompany: order.tracking_company,
            linkMan: order.customer_firstname + order.customer_lastname,
            mobile: order.customer_telephone,
            address: order.customer_address_street1,
            goods: goods,
            symbol: order.currency_symbol,
            product_amount: order.subtotal,
            shipping_cost: order.shipping_total,
            grand_total: order.grand_total,
            subtotal_with_discount: order.subtotal_with_discount,

          }

          that.setData({
            orderDetail: orderDetail,
            orderStatusStr: statusStr,
            orderStatus: status,
          });
          app.saveReponseHeader(res);
        }
      })
      wx.hideLoading();
      var yunPrice = parseFloat(that.data.yunPrice);
      var allprice = 0;
      var goodsList = that.data.goodsList;
      for (var i = 0; i < goodsList.length; i++) {
        allprice += parseFloat(goodsList[0].price) * goodsList[0].number;
      }
      that.setData({
        allGoodsPrice: allprice,
        yunPrice: yunPrice
      });
    }, 800)
  },
  wuliuDetailsTap: function (e) {
    var orderId = e.currentTarget.dataset.id;
    var numberId = e.currentTarget.dataset.number;
    wx.navigateTo({
      url: "/pages/logistics/logistics?id=" + orderId + '&number=' + numberId
    })
  },
  submitReputation: function (e) {
    let that = this;
    let postJsonString = {};
    postJsonString.orderId = this.data.orderDetail.orderId;
    let reputations = [];
    let i = 0;
    let formData = e.detail.value
    while (formData["orderGoodsId" + i]) {
      let orderGoodsId = formData["orderGoodsId" + i];
      let orderItemId = formData["orderItemId" + i];
      
      let goodReputation = formData["goodReputation" + i];
      let goodReputationRemark = formData["goodReputationRemark" + i];

      let reputations_json = {};
      reputations_json.product_id = orderGoodsId;
      reputations_json.item_id = orderItemId;
      reputations_json.star = goodReputation;
      reputations_json.review = goodReputationRemark;
      console.log(reputations_json)
      reputations.push(reputations_json);
      i++;
    }
    
    postJsonString.reviews = reputations;
    wx.showLoading();
    var requestHeader = app.getRequestHeader();
    requestHeader['Content-Type'] = 'application/x-www-form-urlencoded';
    wx.request({
      url: app.globalData.urls + '/customer/order/review',
      data: {
        orderReview: JSON.stringify(postJsonString)
      },
      method: 'POST',
      header: requestHeader,
      success: (res) => {
        if (res.data.code == 200) {
          that.onShow();
          wx.showModal({
            title: '成功',
            content: '添加评论成功',
            showCancel: false
          })
        } else {
          wx.showModal({
            title: '错误',
            content: '添加评论失败',
            showCancel: false
          })
        }
        app.saveReponseHeader(res);
        wx.hideLoading();
      }
    })
    
  },
  confirmBtnTap: function (e) {
    let that = this;
    let orderId = this.data.orderId;
    let formId = e.detail.formId;
    wx.showModal({
      title: that.data.language.confirm_receive_product,  //'确认您已收到商品？',
      content: '',
      success: function (res) {
        if (res.confirm) {
          wx.showLoading();
          wx.request({
            url: app.globalData.urls + '/customer/order/delivery',
            data: {
              orderId: orderId
            },
            header: app.getRequestHeader(),
            success: (res) => {
              if (res.data.code == 200) {
                that.onShow();
                // 模板消息，提醒用户进行评价
                let postJsonString = {};
                postJsonString.keyword1 = { value: that.data.orderDetail.orderInfo.orderNumber, color: '#173177' }
                let keywords2 = that.data.language.confirm_and_next_come;  //'您已确认收货，期待您的再次光临！';
                //if (app.globalData.order_reputation_score) {
                //  keywords2 += '立即好评，系统赠送您' + app.globalData.order_reputation_score +'积分奖励。';
                //}
                postJsonString.keyword2 = { value: keywords2, color: '#173177' }
                app.sendTempleMsgImmediately(app.siteInfo.assessorderkey, formId,
                  '/pages/order-detail/order-detail?id=' + orderId, JSON.stringify(postJsonString));
              }
              app.saveReponseHeader(res);
              wx.hideLoading();
            }
          })
        }
      }
    })
  },
})