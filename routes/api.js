const router = require('express').Router();
const db = require('../db');
const socket = require('../socket');

async function listSessions(req, res, next) {
  const sessions = await db.session.list();
  res.send({ sessions });
}

async function createSession(req, res, next) {
  const session = await db.session.new(req.body.description);
  socket.session.created(session);
  res.status(201).send(session);
}

async function getSession(req, res, next) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return next({ code: 400, message: "URL parameter 'id' must be an integer" });
  }
  const session = await db.session.get(id);
  if (!session) {
    return next({ code: 404, message: `Session ${id} not found`});
  }
  res.send(session);
}

async function updateSession(req, res, next) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return next({ code: 400, message: "URL parameter 'id' must be an integer" });
  }
  const newDescription = req.body.description;
  const newNotes = req.body.notes;
  if (newDescription === undefined && newNotes === undefined) {
    return next({ code: 400, message: "One or both of 'description' and 'notes' must be supplied" });
  }
  const updated = await db.session.update(id, newDescription, newNotes);
  if (!updated) {
    return next({ code: 404, message: `Session ${id} not found`});
  }
  socket.session.updated({ id });
  res.status(204).send();
}

async function listFrames(req, res, next) {
  const sessionId = parseInt(req.params.id);
  if (isNaN(sessionId)) {
    return next({ code: 400, message: "URL parameter 'id' must be an integer" });
  }
  const frames = await db.frame.list(sessionId);
  res.send({ frames });
}

async function createFrame(req, res, next) {
  const sessionId = parseInt(req.params.id);
  if (isNaN(sessionId)) {
    return next({ code: 400, message: "URL parameter 'id' must be an integer" });
  }
  const number = parseInt(req.body.number);
  if (isNaN(number)) {
    return next({ code: 400, message: "An integer 'number' must be supplied to indicate the frame's position within the profiling sequence" });
  }
  const description = req.body.description || null;
  const stats = {
    frame_time: req.body.frame_time || 0.0,
    game_thread_time: req.body.game_thread_time || 0.0,
    render_thread_time: req.body.render_thread_time || 0.0,
    gpu_frame_time: req.body.gpu_frame_time || 0.0,
    gpu_memory: req.body.gpu_memory || 0.0,
    num_triangles_drawn: req.body.num_triangles_drawn || 0.0,
    num_draw_calls: req.body.num_draw_calls || 0.0,
    num_mesh_draw_calls: req.body.num_mesh_draw_calls || 0.0,
  };
  const result = await db.frame.new(sessionId, number, description, stats);
  if (!result.success) {
    return next({ code: 400, message: result.error });
  }
  socket.frame.created({ sessionId, id: result.id });
  socket.session.updated({ id: sessionId });
  res.status(201).send({ id: result.id });
}

async function deleteSession(req, res, next) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return next({ code: 400, message: "URL parameter 'id' must be an integer" });
  }
  const deleted = await db.session.delete(id);
  if (!deleted) {
    return next({ code: 404, message: `Session ${id} not found` });
  }
  socket.session.deleted({ id });
  res.status(204).send();
}

router.get('/session', listSessions);
router.post('/session', createSession);
router.get('/session/:id', getSession);
router.post('/session/:id', updateSession);
router.get('/session/:id/frame', listFrames);
router.post('/session/:id/frame', createFrame);
router.delete('/session/:id', deleteSession);

module.exports = router;
