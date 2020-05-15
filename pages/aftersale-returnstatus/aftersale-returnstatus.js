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
    asId: '',
    as_info: {},
    shipping_companys: [],
    shipping_company: '',
    selectShippingCompany:'',
    symbol: '',
    //语言 - end
    delBtnWidth: 120,
  },
  bindPickerProvinceChange: function (e) {
    var index = e.detail.value;
    var shipping_companys = this.data.shipping_companys;
    this.setData({
      selectShippingCompany: shipping_companys[index].name,
      shipping_company: shipping_companys[index].id,
    })
  },
  onLoad: function (e) {
    var that = this;
    var asId = e.as_id;
    that.setData({
      asId: asId,
    });
    // 语言
    // 设置当前页面的language变量 - 每个页面都要有
    this.setLanguage();
    event.on("languageChanged", this, this.changeLanguage); // (2)
    // 设置当前页面的language Index - 每个页面都要有
    wx.T.setLocaleByIndex(wx.T.langIndex);
    // 语言 - 结束
    that.getAftersaleReturnStatus();
  },
  // 语言 
  // 设置language变量（翻译Object）
  setLanguage() {
    var lang = wx.T.getLanguage()
    this.setData({
      language: lang,
      selectSize: lang.select_attribute
    });
  },
  changeLanguage() {
    var lang = wx.T.getLanguage()
    this.setData({
      language: lang,
      selectSize: lang.select_attribute
    });
    this.getAftersaleReturn()
  },

  getAftersaleReturnStatus: function () {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/customer/order/returnstatus',
      data: {
        as_id: that.data.asId
      },
      header: app.getRequestHeader(),
      success: function (res) {
        if (res.data.code == 200) {
          var shipping_company = res.data.data.after_sale.tracking_company;
          var shipping_companys = res.data.data.shipping_companys;
          var tracking_company_str = res.data.data.after_sale.tracking_company_str;
          var selectShippingCompany = "请选择"
          if (tracking_company_str) {
            selectShippingCompany = tracking_company_str;
          }
          
          that.setData({
            as_info: res.data.data.after_sale,
            shipping_company: shipping_company,
            shipping_companys: shipping_companys,
            selectShippingCompany: selectShippingCompany
          });
          console.log(that.data.shipping_companys)
          console.log(that.data.shipping_company)
        }
      }
    })
  },
  bindSave: function (e) {
    var that = this;
    var tracking_number = e.detail.value.tracking_number;
    var tracking_company = that.data.shipping_company;

    if (tracking_number == "") {
      wx.showModal({
        title: '提示',
        content: '请填写物流追踪号',
        showCancel: false
      })
      return
    }
    if (tracking_company == "") {
      wx.showModal({
        title: '提示',
        content: '请填写物流公司',
        showCancel: false
      })
      return
    }
    wx.request({
      url: app.globalData.urls + '/customer/order/returndispatch',
      header: app.getPostRequestHeader(),
      method: 'POST',
      data: {
        tracking_company: tracking_company,
        tracking_number: tracking_number,
        as_id: that.data.asId
      },
      success: function (res) {
        if (res.data.code != 200) {
          // 登录错误 
          wx.hideLoading();
          wx.showModal({
            title: '失败',
            content: '退货发货失败',
            showCancel: false
          })
          return;
        }
        app.saveReponseHeader(res);
        // 跳转到提交成功页面 
        that.getAftersaleReturnStatus();
      }
    })
  }



})