const sqlite = require('sqlite-async');

let db = null;

module.exports = {
  init: async () => {
    db = await sqlite.open('perfgraph.db');
    await db.run(`
      PRAGMA foreign_keys = ON
    `);
    await db.run(`
      CREATE TABLE IF NOT EXISTS session (
        id INTEGER PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        description TEXT,
        notes TEXT,
        mean_frame_time REAL DEFAULT 0.0,
        mean_game_thread_time REAL DEFAULT 0.0,
        mean_render_thread_time REAL DEFAULT 0.0,
        mean_gpu_frame_time REAL DEFAULT 0.0
      )
    `);
    await db.run(`
      CREATE TABLE IF NOT EXISTS frame (
        id INTEGER PRIMARY KEY,
        session_id INTEGER NOT NULL,
        number INTEGER NOT NULL,
        description TEXT,
        frame_time REAL,
        game_thread_time REAL,
        render_thread_time REAL,
        gpu_frame_time REAL,
        gpu_memory REAL,
        num_triangles_drawn REAL,
        num_draw_calls REAL,
        num_mesh_draw_calls REAL,
        FOREIGN KEY(session_id) REFERENCES session(id) ON DELETE CASCADE,
        UNIQUE(session_id, number)
      )
    `);
    await db.run(`
      CREATE TRIGGER IF NOT EXISTS recompute_session_mean_stats
        AFTER INSERT ON frame
      BEGIN
        UPDATE session SET (
          mean_frame_time,
          mean_game_thread_time,
          mean_render_thread_time,
          mean_gpu_frame_time
        ) = (
          SELECT
            AVG(frame_time) as mean_frame_time,
            AVG(game_thread_time) as mean_game_thread_time,
            AVG(render_thread_time) as mean_render_thread_time,
            AVG(gpu_frame_time) as mean_gpu_frame_time
          FROM frame
          WHERE session_id = NEW.session_id
        )
        WHERE id = NEW.session_id;
      END;
    `);
  },
  session: {
    new: async (description) => {
      const res = await db.run('INSERT INTO session (description) VALUES (?)', description)
      return { id: res.lastID };
    },
    get: async (id) => {
      return await db.get('SELECT * FROM session WHERE id = ?', id);
    },
    list: async () => {
      return await db.all('SELECT * FROM session ORDER BY created_at DESC');
    },
    update: async (id, description, notes) => {
      let params = [];
      let values = [];
      if (description !== undefined) {
        params.push('description = ?');
        values.push(description);
      }
      if (notes !== undefined) {
        params.push('notes = ?');
        values.push(notes);
      }
      values.push(id);
      const res = await db.run(`UPDATE session SET ${params.join(', ')} WHERE id = ?`, values);
      return res.changes > 0;
    },
    delete: async (id) => {
      const res = await db.run('DELETE FROM session WHERE id = ?', id);
      return res.changes > 0;
    },
  },
  frame: {
    new: async (sessionId, number, description, stats) => {
      let params = ['session_id', 'number', 'description'];
      let values = [sessionId, number, description];
      for (const key in stats) {
        params.push(key);
        values.push(stats[key]);
      }
      const names = params.join(', ');
      const placeholders = Array(params.length).fill('?').join(',');
      try {
        const res = await db.run(`INSERT INTO frame (${names}) VALUES (${placeholders})`, values);
        return { success: true, id: res.lastID };
      } catch (err) {
        const message = err.toString();
        if (message.includes('FOREIGN KEY constraint failed')) {
          return { error: `Session ${sessionId} not found` };
        }
        if (message.includes('UNIQUE constraint failed')) {
          return { error: `Session ${sessionId} already has profiling data for frame number ${number}`};
        }
        return { error: message };
      }
    },
    get: async (id) => {
      return await db.get('SELECT * FROM frame WHERE id = ?', id);
    },
    list: async (sessionId) => {
      return await db.all('SELECT * FROM frame WHERE session_id=? ORDER BY number', sessionId);
    },
  },
};
