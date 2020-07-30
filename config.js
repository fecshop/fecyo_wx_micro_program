var config = {
	// Fecmall Appserver 的域名地址，需要https才能线上使用
  'url': 'https://fecyoserver.fecshop.com',
  'subDomain': '',

  // 默认语言
  'lang_code': 'zh',
  // 默认货币
  'currency_code': 'CNY',
  // 分销商bid参数,下面是默认值，如果您在fecmall中更改了bid参数名称配置，哪里这里需要做改动，保持一致。
  'distributeName': 'distributebid',
	//版本标识，这里不需要修改
	'version': '1.0.0',
	//订单自动关闭时间，默认60分钟，以分为单位，填0则不自动关闭订单
	'closeorder': '60', 
	//关闭订单模版ID，这里填写你自己的模版消息ID
	'closeorderkey': '',
	
	//发货提醒模版ID，这里填写你自己的模版消息ID
	'deliveryorderkey': '',
	
	//评价模版提醒ID，这里填写你自己的模版消息ID
	'assessorderkey': '',
	
	//已评价模版提醒ID，这里填写你自己的模版消息ID
	'successorderkey': ''
}
module.exports = config