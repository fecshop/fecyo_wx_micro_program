var commonCityData = require('../../utils/city.js')
//获取应用实例
var app = getApp()
// 语言
var util = require('../../utils/util.js')
import event from '../../utils/event'

Page({
  data: {
    //语言 - begin
    language: '',
    //语言 - end
    provinces: [],
    citys: [],
    stateArr: [],
    districts: [],
    selProvince: '请选择',
    selCity: '请选择',
    selDistrict: '请选择',
    selProvinceIndex: 0,
    selCityIndex: 0,
    selDistrictIndex: 0
  },
  bindSave: function (e) {
    var that = this;
    var name = e.detail.value.name;
    var email = e.detail.value.email;
    var mobile = e.detail.value.mobile;
    var contact_content = e.detail.value.contact_content;

    if (name == "") {
      wx.showModal({
        title: '提示',
        content: '请填写联系人姓名',
        showCancel: false
      })
      return
    }
    if (email == "") {
      wx.showModal({
        title: '提示',
        content: '请填写邮箱地址',
        showCancel: false
      })
      return
    }
    if (mobile == "") {
      wx.showModal({
        title: '提示',
        content: '请填写手机号码',
        showCancel: false
      })
      return
    }
    if (contact_content == "") {
      wx.showModal({
        title: '提示',
        content: '请填写留言内容',
        showCancel: false
      })
      return
    }
    wx.request({
      url: app.globalData.urls + '/customer/contacts/index',
      header: app.getPostRequestHeader(),
      method: 'POST',
      data: {
        name: name,
        email: email,
        telephone: mobile,
        contact_content: contact_content
      },
      success: function (res) {
        if (res.data.code != 200) {
          // 登录错误 
          wx.hideLoading();
          wx.showModal({
            title: '失败',
            content: '客户留言提交失败',
            showCancel: false
          })
          return;
        } else {
          wx.showModal({
            title: '成功',
            content: '客户留言提交成功',
            showCancel: false
          })
        }
        app.saveReponseHeader(res);
        // 
        //wx.navigateBack({})
      }
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
    //this.initShippingAddress()
  },

  onLoad: function (e) {
    var that = this;
    if (app.globalData.iphone == true) { that.setData({ iphone: 'iphone' }) }

    // 语言
    // 设置当前页面的language变量 - 每个页面都要有
    this.setLanguage();
    event.on("languageChanged", this, this.setLanguage); // (2)
    // 设置当前页面的language Index - 每个页面都要有
    wx.T.setLocaleByIndex(wx.T.langIndex);
    // 语言 - 结束
  }
})