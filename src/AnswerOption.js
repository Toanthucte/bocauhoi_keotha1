
import React from 'react';

// Hàm phát âm thanh
function playSound(src) {
  const audio = new window.Audio(src);
  audio.volume = 0.7;
  audio.play();
}
import { Draggable } from '@hello-pangea/dnd';

// AnswerOption: đáp án có thể kéo thả, có hiệu ứng động khi chọn hoặc kéo
function AnswerOption({ text, index, isDropped, questionIndex }) {
  const pastelColors = ['#e3fcec', '#fff9db', '#ffe3e3', '#e3f0ff', '#f3e3ff'];
  const baseBg = pastelColors[index % pastelColors.length];
  return (
    <Draggable draggableId={`answer-${questionIndex}-${index}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            padding: '14px 22px',
            border: isDropped ? '3px solid #38a169' : '2px solid #b6c2d6',
            borderRadius: 12,
            background: isDropped
              ? 'linear-gradient(90deg, #e6fffa 60%, #c6f6d5 100%)'
              : snapshot.isDragging
                ? '#e3f2fd'
                : baseBg,
            fontWeight: isDropped ? 'bold' : 'normal',
            color: isDropped ? '#2b6cb0' : '#222',
            boxShadow: isDropped
              ? '0 0 16px #38a169'
              : snapshot.isDragging
                ? '0 0 12px #3182ce'
                : '0 1px 4px #b6c2d6',
            cursor: isDropped ? 'not-allowed' : 'grab',
            fontSize: 20,
            minWidth: 120,
            textAlign: 'center',
            transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
            transform: isDropped
              ? 'scale(1.12)'
              : snapshot.isDragging
                ? 'scale(1.08)'
                : 'scale(1)',
            marginBottom: 4,
            opacity: isDropped ? 0.5 : 1,
            ...provided.draggableProps.style
          }}
          aria-label={`Đáp án ${text}`}
          onMouseDown={() => playSound('/sounds/drag.mp3')}
        >
          {text}
        </div>
      )}
    </Draggable>
  );
}

export default AnswerOption;
