// QuizItem.js: Hiển thị một câu hỏi quiz và vùng kéo thả đáp án
import React, { useState } from 'react';

// Hàm phát âm thanh
function playSound(src) {
  try {
    const audio = new window.Audio(src);
    audio.volume = 0.7;
    audio.play().catch((err) => {
      console.error('Không thể phát âm thanh:', src, err);
    });
  } catch (err) {
    console.error('Lỗi khi tạo audio:', src, err);
  }
}
import AnswerOption from './AnswerOption'; // Import component đáp án

// question: dữ liệu câu hỏi
// userAnswer: đáp án người dùng chọn cho câu hỏi này
// onDropAnswer: hàm xử lý khi thả đáp án
// showResult: trạng thái hiển thị kết quả
// Thêm prop questionIndex để nhận chỉ số câu hỏi từ component cha
function QuizItem({ question, userAnswer, onDropAnswer, showResult, questionIndex, totalQuestions }) {
  // TTS: Chọn giọng tiếng Việt (đảm bảo voice đã sẵn sàng)
  // Chọn voice nữ (ưu tiên lang vi, name chứa 'female' hoặc 'nữ')
  const getVietnameseFemaleVoice = () => {
    const voices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('vi'));
    return voices.find(v => v.gender === 'female')
      || voices.find(v => v.name.toLowerCase().includes('female'))
      || voices.find(v => v.name.toLowerCase().includes('nữ'))
      || voices[0];
  };
  // Chọn voice nam (ưu tiên lang vi, name chứa 'male' hoặc 'nam')
  const getVietnameseMaleVoice = () => {
    const voices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('vi'));
    return voices.find(v => v.gender === 'male')
      || voices.find(v => v.name.toLowerCase().includes('male'))
      || voices.find(v => v.name.toLowerCase().includes('nam'))
      || voices[0];
  };
  // Nếu chỉ có 1 voice, trả về voices[0]
  const getDefaultVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    return voices[0];
  };

  // Hàm phát TTS với lựa chọn voice
  const speakText = (text, type = 'question') => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const speak = () => {
      const utter = new window.SpeechSynthesisUtterance(text);
      let voice;
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 1) {
        voice = voices[0];
      } else if (type === 'question') {
        voice = getVietnameseFemaleVoice() || getDefaultVoice();
      } else {
        voice = getVietnameseMaleVoice() || getDefaultVoice();
      }
      utter.voice = voice;
      utter.lang = voice?.lang || 'vi-VN';
      utter.rate = 1;
      utter.pitch = 1;
      window.speechSynthesis.speak(utter);
    };
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        speak();
        window.speechSynthesis.onvoiceschanged = null;
      };
      window.speechSynthesis.getVoices();
    } else {
      speak();
    }
  };

  // Đọc câu hỏi khi vào quiz hoặc chuyển câu hỏi
  React.useEffect(() => {
    if (question && question.questionText) {
      console.log('Phát TTS:', question.questionText);
      speakText(question.questionText, 'question'); // Giọng nữ cho câu hỏi
    }
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [question?.id, question.questionText]);

  // Đọc đáp án khi chọn đáp án mới
  React.useEffect(() => {
    if (userAnswer !== undefined && question.options[userAnswer]) {
      speakText(question.options[userAnswer], 'answer'); // Giọng nam cho đáp án
    }
    // Nếu bỏ chọn đáp án thì dừng đọc
    if (userAnswer === undefined) {
      window.speechSynthesis.cancel();
    }
  }, [userAnswer, question.options]);

  // Đọc giải thích khi showResult
  React.useEffect(() => {
    let timer;
    if (showResult && question.explanation) {
      timer = setTimeout(() => {
        speakText(question.explanation, 'explanation'); // Giọng nam cho giải thích
      }, 5000);
    }
    if (!showResult) {
      window.speechSynthesis.cancel();
    }
    return () => {
      clearTimeout(timer);
      window.speechSynthesis.cancel();
    };
  }, [showResult, question.explanation]);
  // Phát âm thanh đúng/sai chỉ một lần khi showResult chuyển từ false sang true
  // Đảm bảo âm thanh chỉ phát một lần mỗi lần showResult chuyển sang true
  const hasPlayedRef = React.useRef(false);
  React.useEffect(() => {
    if (showResult && !hasPlayedRef.current) {
      if (userAnswer === question.correctAnswerIndex) {
        playSound('/sounds/correct.mp3');
      } else {
        playSound('/sounds/wrong.mp3');
      }
      hasPlayedRef.current = true;
    }
    if (!showResult) {
      hasPlayedRef.current = false;
    }
  }, [showResult, userAnswer, question.correctAnswerIndex]);
  // Hiệu ứng border-radius động khi hover vào ảnh minh họa
  const [isImgHover, setIsImgHover] = useState(false);

  // Hiệu ứng khi đáp án được kéo vào vùng thả
  const [isDragOver, setIsDragOver] = useState(false);

  // Phát âm thanh khi thả đáp án vào vùng thả
  const handleDrop = () => {
    setIsDragOver(false);
    playSound('/sounds/drop.mp3');
  };

  return (
  <div className="quiz-item-responsive" style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, marginBottom: 16, background: '#f7fafd' }}>
      {/* Hiển thị ảnh minh họa nếu có */}
      {question.image && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 60%, #e0e7ef 100%)',
            padding: 10,
            borderRadius: 12,
            border: '1px solid #e0e7ef',
            boxShadow: '0 2px 8px #e0e7ef',
            display: 'inline-block'
          }}>
            <img
              src={question.image}
              alt="minh họa"
              style={{
                maxWidth: 180,
                maxHeight: 120,
                borderRadius: isImgHover ? 32 : 8,
                transition: 'border-radius 0.3s',
                border: '2px solid #b6c2d6',
                background: '#fff',
                boxShadow: '0 1px 4px #b6c2d6',
                display: 'block',
                margin: '0 auto'
              }}
              onMouseEnter={() => setIsImgHover(true)}
              onMouseLeave={() => setIsImgHover(false)}
            />
          </div>
          {/* Thanh tiến độ */}
          <div style={{ width: 220, marginTop: 12, marginBottom: 4, position: 'relative' }}>
            <div style={{
              height: 16,
              background: '#e2e8f0',
              borderRadius: 8,
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                width: `${((questionIndex + 1) / (totalQuestions || 1)) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #3182ce 60%, #63b3ed 100%)',
                borderRadius: 8,
                boxShadow: '0 2px 12px 0 rgba(49,130,206,0.15)',
                transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1), box-shadow 0.4s',
              }}></div>
              <span style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                fontWeight: 'bold',
                color: '#2b6cb0',
                fontSize: 15
              }}>{questionIndex + 1}/{totalQuestions || 1}</span>
            </div>
          </div>
        </div>
      )}
      {/* Hiển thị nội dung câu hỏi */}
      <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{question.questionText}</div>
      {/* Hiển thị các đáp án có thể kéo thả, ẩn đáp án đã chọn */}
  <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 12 }}>
        {question.options.map((opt, idx) => (
          userAnswer === idx ? null : (
            <AnswerOption
              key={idx}
              text={opt}
              index={idx}
              isDropped={false}
              questionIndex={questionIndex}
            />
          )
        ))}
      </div>
      {/* Vùng kéo thả đáp án */}
      <div
        style={{
          marginTop: 20,
          minHeight: 64,
          border: isDragOver ? '3px solid #3182ce' : '2px dashed #90cdf4',
          borderRadius: 16,
          background: isDragOver ? '#e3f2fd' : '#f0f4fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s',
          boxShadow: isDragOver ? '0 0 16px #3182ce' : '0 2px 8px #b6c2d6',
          fontSize: 22,
          fontWeight: 'bold',
          color: isDragOver ? '#2b6cb0' : '#3182ce',
          cursor: 'pointer',
          width: '100%',
          maxWidth: 400
        }}
        onDragEnter={() => setIsDragOver(true)}
        onDragLeave={() => setIsDragOver(false)}
  onDrop={handleDrop}
        aria-label="Vùng kéo thả đáp án"
      >
        {userAnswer !== undefined ? (
          <span>Bạn chọn: <b>{question.options[userAnswer]}</b></span>
        ) : (
          <span>Kéo đáp án vào đây!</span>
        )}
      </div>
      {/* Hiển thị kết quả đúng/sai và giải thích nếu đã kiểm tra */}
      {showResult && (
        <>
          <div
            style={{
              marginTop: 12,
              color: userAnswer === question.correctAnswerIndex ? '#1a8917' : '#d90429',
              background: userAnswer === question.correctAnswerIndex ? '#e6ffed' : '#ffeaea',
              border: userAnswer === question.correctAnswerIndex ? '2px solid #1a8917' : '2px solid #d90429',
              borderRadius: 10,
              fontWeight: 'bold',
              fontSize: 22,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 18px',
              boxShadow: userAnswer === question.correctAnswerIndex ? '0 2px 12px #1a891733' : '0 2px 12px #d9042933',
              transition: 'all 0.3s'
            }}
          >
               <span style={{ fontSize: 28 }}>
                 {userAnswer === question.correctAnswerIndex ? (
                   <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <circle cx="14" cy="14" r="14" fill="#1a8917"/>
                     <path d="M8 14l4 4 8-8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                   </svg>
                 ) : (
                   <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <circle cx="14" cy="14" r="14" fill="#d90429"/>
                     <path d="M9 9l10 10M19 9L9 19" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                   </svg>
                 )}
               </span>
            <span>
              {userAnswer === question.correctAnswerIndex ? 'Đúng!' : 'Sai!'}
            </span>
          </div>
          <div style={{ marginTop: 8, fontStyle: 'italic', fontSize: 18, color: '#222' }}>
            {question.explanation}
          </div>
        </>
      )}
    </div>
  );
}

// Xuất component QuizItem để sử dụng ở file khác
export default QuizItem;
