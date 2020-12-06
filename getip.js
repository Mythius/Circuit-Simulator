var os = require('os');
var ifaces = os.networkInterfaces();
Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;
  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      return;
    }
    if (alias >= 1) {
      exports.ip = iface.address;
    } else {
      exports.ip = iface.address;
    }
    ++alias;
  });
});