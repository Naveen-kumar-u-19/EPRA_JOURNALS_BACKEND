const cache = require('../cache');

class commonService {
  static async clearCache() {
        cache.flushAll();
    }
}

module.exports = commonService;
