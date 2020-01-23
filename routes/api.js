const router = require('express').Router();

async function create_session(req, res, next) {
  res.status(204).send();
}

async function update_session(req, res, next) {
  res.status(204).send();
}

async function create_frame(req, res, next) {
  res.status(204).send();
}

async function delete_session(req, res, next) {
  res.status(204).send();
}

router.post('/session', create_session);
router.post('/session/:id', update_session);
router.post('/session/:id/frame', create_frame);
router.delete('/session', delete_session);

module.exports = router;
