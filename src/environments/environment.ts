const urlApi = "http://62.72.19.95:3000/api";
const authUrl = "/auth"
const tokenVerifyUrl = ""

export const environment = {
  production: false,
  backend_api_url: urlApi,
  auth_url: authUrl,
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