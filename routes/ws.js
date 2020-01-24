const router = require('express').Router();
const socket = require('../socket');

router.ws('/', (ws, res) => {
  socket.add(ws);
  ws.on('close', (event) => {
    socket.remove(ws);
  });
});

module.exports = router;
