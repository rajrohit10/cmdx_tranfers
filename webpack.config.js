const path = require('path');

module.exports = {
  // ... other webpack configuration options ...

  resolve: {
    fallback: { "crypto": false }
  },

  // ... other webpack configuration options ...

  // Add any other necessary webpack configurations here...
};
