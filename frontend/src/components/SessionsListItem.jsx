import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { FramesProvider } from '../contexts/FramesContext.jsx';
import FramesList from './FramesList.jsx';

function SessionsListItem(props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { id, createdAt, description, notes, frameTime, gameThreadTime, renderThreadTime, gpuFrameTime } = props;
  function handleDeleteClick(event) {
    event.preventDefault();
    setIsDeleting(true);
    fetch(`/api/session/${id}`, { method: 'DELETE' });
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', flexGrow: 1, border: '1px solid black' }}>
        <div style={{ width: 30 }}>{id}</div>
        <div style={{ width: 85 }}><span style={{ fontSize: 10 }}>Frm:</span>{frameTime.toFixed(2)}</div>
        <div style={{ width: 85 }}><span style={{ fontSize: 10 }}>Gam:</span>{gameThreadTime.toFixed(2)}</div>
        <div style={{ width: 85 }}><span style={{ fontSize: 10 }}>Rnd:</span>{renderThreadTime.toFixed(2)}ms</div>
        <div style={{ width: 85 }}><span style={{ fontSize: 10 }}>GPU:</span>{gpuFrameTime.toFixed(2)}ms</div>
        <div style={{ flexGrow: 1, paddingLeft: 20 }}>{createdAt}{description && description.length > 0 ? (' / ' + description) : ''}{notes && notes.length > 0 ? (' / ' + notes) : ''}</div>
        <div><button disabled={isDeleting} onClick={handleDeleteClick}>Delete</button></div>
      </div>
      <FramesProvider sessionId={id}>
        <FramesList sessionId={id} />
      </FramesProvider>
    </div>
  );
}
SessionsListItem.propTypes = {
  id: PropTypes.number.isRequired,
  createdAt: PropTypes.string.isRequired,
  description: PropTypes.string,
  notes: PropTypes.string,
  frameTime: PropTypes.number.isRequired,
  gameThreadTime: PropTypes.number.isRequired,
  renderThreadTime: PropTypes.number.isRequired,
  gpuFrameTime: PropTypes.number.isRequired,
};

export default SessionsListItem;
