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
    // 身份证正面图片url
    id_card_img_front: '',
    // 身份证反面图片url
    id_card_img_back: '',
    // 身份证反面图片 value
    id_card_front: '',
    // 身份证反面图片 value
    id_card_back: '',
    name: '',
    //telephone: '',
    qq: '',
    id_number: '',
    distribute_parent_code: '',
  },
  bindCancel: function () {
    wx.navigateBack({})
  },
  bindSave: function (e) {
    var that = this;
    var name = e.detail.value.name;
    //var telephone = e.detail.value.telephone;
    var qq = e.detail.value.qq;
    var id_number = e.detail.value.id_number;
    var distribute_parent_code = e.detail.value.distribute_parent_code;
    var id_card_front = that.data.id_card_front;
    var id_card_back = that.data.id_card_back;

    if (name == "") {
      wx.showModal({
        title: '提示',
        content: '请填写姓名',
        showCancel: false
      })
      return
    }
    /*
    if (telephone == "") {
      wx.showModal({
        title: '提示',
        content: '请填写手机号码',
        showCancel: false
      })
      return
    }
    */
    if (qq == "") {
      wx.showModal({
        title: '提示',
        content: '请填写QQ号码',
        showCancel: false
      })
      return
    }
    if (id_number == "") {
      wx.showModal({
        title: '提示',
        content: '请填写身份证号码',
        showCancel: false
      })
      return
    }
    if (id_card_front == "") {
      wx.showModal({
        title: '提示',
        content: '请填写上传身份证正面图片',
        showCancel: false
      })
      return
    }
    if (id_card_back == "") {
      wx.showModal({
        title: '提示',
        content: '请填写上传身份证反面图片',
        showCancel: false
      })
      return
    }

    wx.request({
      url: app.globalData.urls + '/distribute/account/register',
      header: app.getPostRequestHeader(),
      method: 'POST',
      data: {
        name: name,
        //telephone: telephone,
        qq: qq,
        id_number: id_number,
        distribute_parent_code: distribute_parent_code,
        id_card_positive: id_card_front,
        id_card_reverse: id_card_back
      },
      success: function (res) {
        if (res.data.code != 200) {
          // 登录错误 
          var errors = '分销商申请提交失败';
          if (res.data.data.errors) {
            errors = res.data.data.errors;
          }
          wx.hideLoading();
          wx.showModal({
            title: '失败',
            content: errors,
            showCancel: false
          })
          return;
        }
        app.saveReponseHeader(res);
        wx.showModal({
          title: '成功',
          content: '分销商申请提交成功,请等待管理员审核',
          showCancel: false
        })
        // 跳转到结算页面
        // wx.navigateBack({})
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
    this.initDistributeApply();
  },
  onShow() {
    // this.initDistributeApply()
  },
  initDistributeApply: function () {
    var that = this;
    wx.showLoading({
      title: that.data.language.load_user_information,
    })
    wx.request({
      url: app.globalData.urls + '/distribute/account/initregister',
      header: app.getRequestHeader(),
      data: {},
      success: function (res) {
        wx.hideLoading();
        app.saveReponseHeader(res);
        //var walletyo = res.data.data.hasOwnProperty("walletyo") ? res.data.data.walletyo : false;
        //that.setData({ isWalletyo: walletyo });
        // 未登陆
        if (res.data.code == '1100003') {
          that.setData({
            logged: false
          })
          wx.navigateTo({
            url: "/pages/login/login"
          })
          // 非分销商
        } else if (res.data.code == '200') {
          // 
          that.setData({
            name: res.data.data.name,
            //telephone: res.data.data.telephone,
            qq: res.data.data.qq,
            id_number: res.data.data.id_number,
            distribute_parent_code: res.data.data.distribute_parent_code
          })
          if (res.data.data.apply) {
            wx.showModal({
              title: '提示',
              content: '您的分销商申请已经提交,请等待管理员审核',
              showCancel: false
            })
          }
        } else if (res.data.code == '3000005') {
          // 如果已经是分销商，直接跳转到分销商主页
          wx.navigateTo({
            url: "/pages/distribute-account/distribute-account"
          })
        }
      }
    });
  },
  /**
 * 上传身份证正面图片
 */
  uploadFrontImg: function () {
    var that = this;
    wx.chooseImage({  //从本地相册选择图片或使用相机拍照
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        //console.log(res)
        //前台显示
        that.setData({
          id_card_img_front: res.tempFilePaths
        })
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          url: app.globalData.urls + '/distribute/account/registeruploadimg',
          filePath: tempFilePaths[0],
          header: app.getPostRequestHeader(),
          name: 'file',
          success: function (uploadRes) {
            var resData = JSON.parse(uploadRes.data)
            if (resData.code != 200) {
              wx.showModal({
                title: '提示',
                content: '图片上传失败',
                showCancel: false
              })
            }
            var relativePath = resData.data.relativePath
            if (!relativePath) {
              wx.showModal({
                title: '提示',
                content: '图片上传失败',
                showCancel: false
              })
            }
            console.log(relativePath)
            that.setData({
              id_card_front: relativePath
            })
          }
        })
      }
    })
  },
  // 上传身份证反面图片
  uploadBackImg: function () {
    var that = this;
    wx.chooseImage({  //从本地相册选择图片或使用相机拍照
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        //console.log(res)
        //前台显示
        that.setData({
          id_card_img_back: res.tempFilePaths
        })
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          url: app.globalData.urls + '/distribute/account/registeruploadimg',
          filePath: tempFilePaths[0],
          header: app.getPostRequestHeader(),
          name: 'file',
          success: function (uploadRes) {
            var resData = JSON.parse(uploadRes.data)
            if (resData.code != 200) {
              wx.showModal({
                title: '提示',
                content: '图片上传失败',
                showCancel: false
              })
            }
            var relativePath = resData.data.relativePath
            if (!relativePath) {
              wx.showModal({
                title: '提示',
                content: '图片上传失败',
                showCancel: false
              })
            }
            console.log(relativePath)
            that.setData({
              id_card_back: relativePath
            })
          }
        })
      }
    })
  },

})