const urlApi = "";
const authUrl = ""
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
  }
};