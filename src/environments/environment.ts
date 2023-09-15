const urlApi = "http://62.72.19.95/api";
const authUrl = "/auth"
const userUrl = "/user"
const transactionUrl = "/wallet"
const tokenVerifyUrl = ""

export const environment = {
  production: false,
  backend_api_url: urlApi,
  auth_url: authUrl,
  user_url: userUrl,
  url_transaction: transactionUrl,
  token_verify_url: tokenVerifyUrl,
  readonlyKeys: {
    consumer_key: '',
    consumer_secret: ''
  },
  writableKeys: {
    consumer_key: '',
    consumer_secret: ''
  },
  recaptchaSiteKey: '6LeQh7InAAAAAHTJs6MPQfoEZsTwQOiKotCDmGUQ',
  recaptchaSecretKey: '6LeQh7InAAAAADZjFe80ilOhWRdEVQ_cVKrZcx5e'
};