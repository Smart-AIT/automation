curl -i -X POST \
  https://graph.facebook.com/v22.0/997945336741403/messages \
  -H 'Authorization: Bearer EAA8dd6jUlPoBQ9p9DueV2TQEEU9TXyHZB8fLunPF0wC6Qb1w0v8okmzUNcUt6ZCcreCXiZCdljNcKSnU7SsGoJiO0LokOSvhH9yv4lFujrnGQ5xselOpswLnZC0R7Nz2DY4r8RKZBB0IadyCPLLTBin6uM0j4R2lwaLZCyTwA14yw2ejDl1CxtgZA63QiN3uvxpjoAZCNhqhZBDSZCmhLpaIpEblZAtlGTYC8lzncbaO1gr6Y1bseu18CD1r2toHdOFzn9BV1DID5RpbNz5xhhSZCZBVCjLcY' \
  -H 'Content-Type: application/json' \
  -d '{ "messaging_product": "whatsapp", "to": "917983957734", "type": "template", "template": { "name": "hello_world", "language": { "code": "en_US" } } }'