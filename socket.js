let sockets = [];

function emit(event, params) {
  const data = JSON.stringify({ event, params });
  for (const socket of sockets) {
    socket.send(data);
  }
}

module.exports = {
	add: (ws) => {
    sockets.push(ws);
	},
  remove: (ws) => {
    sockets.splice(sockets.indexOf(ws), 1);
  },
	session: {
		created: (params) => {
			emit('session_created', params);
		},
		updated: (params) => {
			emit('session_updated', params);
		},
    deleted: (params) => {
      emit('session_deleted', params);
    },
	},
	frame: {
		created: (params) => {
			emit('frame_created', params);
		},
	},
};
