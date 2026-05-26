interface Code2SessionResult {
  openid: string
  session_key: string
  unionid?: string
}

interface PhoneResult {
  phoneNumber: string
}

export async function code2Session(code: string): Promise<Code2SessionResult> {
  const config = useRuntimeConfig()
  const appId = config.wechatAppId
  const appSecret = config.wechatAppSecret

  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`

  const response = await $fetch<any>(url)
  if (response.errcode) {
    throw createError({
      statusCode: 400,
      statusMessage: response.errmsg || 'WeChat code2Session failed',
    })
  }

  return {
    openid: response.openid,
    session_key: response.session_key,
    unionid: response.unionid,
  }
}

export async function getPhoneNumber(phoneCode: string): Promise<PhoneResult> {
  const config = useRuntimeConfig()
  const appId = config.wechatAppId
  const appSecret = config.wechatAppSecret

  const tokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`
  const tokenResponse = await $fetch<any>(tokenUrl)
  if (!tokenResponse.access_token) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Failed to get WeChat access token',
    })
  }

  const phoneUrl = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${tokenResponse.access_token}`
  const phoneResponse = await $fetch<any>(phoneUrl, {
    method: 'POST',
    body: { code: phoneCode },
  })

  if (phoneResponse.errcode !== 0) {
    throw createError({
      statusCode: 400,
      statusMessage: phoneResponse.errmsg || 'Failed to get phone number',
    })
  }

  return {
    phoneNumber: phoneResponse.phone_info.phoneNumber,
  }
}
