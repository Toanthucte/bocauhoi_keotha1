// App.js: Component chính quản lý trạng thái tổng thể của ứng dụng
import React, { useState } from 'react';
import QuizList from './QuizList'; // Import component hiển thị danh sách câu hỏi
import './quiz-responsive.css';
// Danh sách các bộ câu hỏi
const quizSets = [
  { file: 'quiz_data.json', label: 'Nghi Lễ của Niệm Phật' },
  { file: 'quiz_data_1.json', label: 'Bài Mở Đầu' },
  { file: 'quiz_data_2.json', label: 'Lòng Yêu Thương Của Phật Giáo' },
  { file: 'quiz_data_3.json', label: 'Quán Thân Vô Thường' },
  { file: 'quiz_data_4.json', label: 'Lòng Yêu Thương Của Phật Giáo (Bài mở rộng)' },
];

function importQuizData(file) {
  // Fetch dữ liệu JSON từ thư mục public
  return fetch(`${process.env.PUBLIC_URL || ''}/${file}`)
    .then(res => res.json())
    .catch(() => []);
}
import { DragDropContext } from '@hello-pangea/dnd';

function App() {
  // TTS: Chọn giọng tiếng Việt
  const getVietnameseVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    return voices.find(v => v.lang.startsWith('vi')) || voices.find(v => v.lang === 'vi-VN') || voices[0];
  };
  // Hàm phát TTS
  const speakText = (text) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.voice = getVietnameseVoice();
    utter.rate = 1;
    utter.pitch = 1;
    window.speechSynthesis.speak(utter);
  };

  // State chọn bộ câu hỏi
  const [selectedQuizSet, setSelectedQuizSet] = useState(null);
  const [quizData, setQuizData] = useState([]);
  const [quizTitle, setQuizTitle] = useState('');

  // Khi chọn bộ câu hỏi, load dữ liệu
  React.useEffect(() => {
    if (selectedQuizSet) {
      importQuizData(selectedQuizSet).then(data => {
        setQuizData(data);
        setQuizTitle(data[0]?.title || '');
        setUserAnswers({});
        setShowResult(false);
        setCurrentQuestionIndex(0);
      });
    }
  }, [selectedQuizSet]);
  // State cho popup cài đặt và nhạc nền
  const [showSettings, setShowSettings] = useState(false);
  const [bgMusicOn, setBgMusicOn] = useState(false);
  const [bgMusicVolume, setBgMusicVolume] = useState(0.7);
  const [bgMusicFile, setBgMusicFile] = useState('background.mp3');
  const bgMusicRef = React.useRef(null);

  // Xử lý bật/tắt nhạc nền
  React.useEffect(() => {
    if (bgMusicOn) {
      if (!bgMusicRef.current) {
        bgMusicRef.current = new window.Audio(`/sounds/${bgMusicFile}`);
        bgMusicRef.current.loop = true;
      } else {
        // Nếu đã có audio, đổi src nếu file khác
        if (bgMusicRef.current.src !== window.location.origin + `/sounds/${bgMusicFile}`) {
          bgMusicRef.current.pause();
          bgMusicRef.current = new window.Audio(`/sounds/${bgMusicFile}`);
          bgMusicRef.current.loop = true;
        }
      }
      bgMusicRef.current.volume = bgMusicVolume;
      bgMusicRef.current.play();
    } else {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
      }
    }
    // Cleanup khi tắt nhạc nền hoặc unmount
    return () => {
      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
      }
    };
  }, [bgMusicOn, bgMusicVolume, bgMusicFile]);
  // Hàm phát âm thanh
  function playSound(src) {
    const audio = new window.Audio(src);
    audio.volume = 0.7;
    audio.play();
  }

  // State lưu đáp án, trạng thái, chỉ số câu hỏi
  const [userAnswers, setUserAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Phát âm thanh kết thúc chỉ một lần khi hoàn thành quiz
  const hasPlayedFinishRef = React.useRef(false);
  // Lấy câu hỏi hiện tại
  const currentQuestion = quizData[currentQuestionIndex];

  const isAnswered = currentQuestion ? userAnswers[currentQuestion.id] !== undefined : false;
  const isLastQuestion = currentQuestionIndex === quizData.length - 1;
  React.useEffect(() => {
    if (showResult && isLastQuestion && !hasPlayedFinishRef.current) {
      playSound('/sounds/finish.mp3');
      hasPlayedFinishRef.current = true;
    }
    if (!showResult || !isLastQuestion) {
      hasPlayedFinishRef.current = false;
    }
  }, [showResult, isLastQuestion]);

  // State lưu ngày giờ hiện tại
  const [dateTime, setDateTime] = React.useState(() => {
    const now = new Date();
    return now;
  });

  React.useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function getFormattedDateTime(dt) {
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[dt.getDay()];
    const pad = n => n.toString().padStart(2, '0');
    const localTime = `${dayName}, ${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())} - ${pad(dt.getDate())}/${pad(dt.getMonth()+1)}/${dt.getFullYear()}`;
    const utcTime = `Giờ UTC: ${pad(dt.getUTCHours())}:${pad(dt.getUTCMinutes())}:${pad(dt.getUTCSeconds())} - ${pad(dt.getUTCDate())}/${pad(dt.getUTCMonth()+1)}/${dt.getUTCFullYear()}`;
    return { localTime, utcTime };
  }
  const { localTime, utcTime } = getFormattedDateTime(dateTime);

  // Xử lý khi người dùng thả đáp án vào câu hỏi hiện tại
  const handleDropAnswer = (questionId, answerIndex) => {
    setUserAnswers({ ...userAnswers, [questionId]: answerIndex });
    setShowResult(false); // Mỗi lần chọn đáp án mới thì ẩn kết quả cũ
  };

  // Khi nhấn nút kiểm tra, hiển thị kết quả cho câu hiện tại
  const handleCheckResult = () => {
    setShowResult(true);
  };

  // Khi nhấn nút làm lại, reset trạng thái
  const handleReset = () => {
    setUserAnswers({});
    setShowResult(false);
    setCurrentQuestionIndex(0);
  };

  // Khi nhấn nút tiếp theo, chuyển sang câu hỏi tiếp theo
  const handleNextQuestion = () => {
    setShowResult(false);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  // Xử lý sự kiện kéo thả từ DragDropContext
  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    const parts = draggableId.split('-');
    const answerIndex = parseInt(parts[2], 10);
    const questionId = destination.droppableId;
    setUserAnswers({ ...userAnswers, [questionId]: answerIndex });
    setShowResult(false);
  };

  // ...existing code...

  // Nếu chưa chọn bộ thì hiển thị trang chọn bộ
  if (!selectedQuizSet) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f7fafc' }}>
        <h1 style={{ color: '#3182ce', fontWeight: 'bold', fontSize: 32, marginBottom: 24 }}>Chọn Bộ Câu Hỏi</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
          {quizSets.map(set => (
            <button
              key={set.file}
              onClick={() => setSelectedQuizSet(set.file)}
              style={{
                minWidth: 220,
                minHeight: 80,
                background: '#fff',
                border: '2px solid #3182ce',
                borderRadius: 16,
                fontSize: 20,
                fontWeight: 'bold',
                color: '#3182ce',
                boxShadow: '0 4px 16px #b6c2d6',
                cursor: 'pointer',
                marginBottom: 12,
                transition: 'all 0.2s',
              }}
            >{set.label}</button>
          ))}
        </div>
      </div>
    );
  }

  // Trang quiz như cũ, chỉ thay quizData và quizTitle động
  return (
    <div className="quiz-responsive-container" style={{ position: 'relative', overflow: 'visible' }}>
  {/* ...existing code... */}
      {/* Nút cài đặt ở góc trên bên phải */}
      <button
        onClick={() => setShowSettings(true)}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 20,
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: '50%',
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          boxShadow: '0 4px 16px #b6c2d6',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        title="Cài đặt"
      >
        {/* SVG icon bánh răng */}
        <svg width="24px" height="24px" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000">
          <path d="M7 22L17 22" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          <path d="M2 17V4C2 2.89543 2.89543 2 4 2H20C21.1046 2 22 2.89543 22 4V17C22 18.1046 21.1046 19 20 19H4C2.89543 19 2 18.1046 2 17Z" stroke="#000000" strokeWidth="1.5"></path>
          <path d="M9 10.5L11 12.5L15 8.5" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
      </button>

      {/* Popup/modal cài đặt */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.25)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 4px 24px #0002',
            width: 350,
            maxWidth: '90vw',
            padding: 24,
            position: 'relative',
          }}>
            <h2 style={{ textAlign: 'center', marginBottom: 18, color: '#3182ce' }}>Cài đặt</h2>
            <div style={{ marginBottom: 18 }}>
              <strong>Hướng dẫn chơi:</strong>
              <div style={{ fontSize: 15, marginTop: 6, color: '#444', background: '#f7fafd', borderRadius: 8, padding: 10 }}>
                Kéo đáp án đúng vào vùng thả. Nhấn "Kiểm tra" để xem kết quả. Hoàn thành tất cả câu hỏi để nhận tổng kết.
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <strong>Nhạc nền:</strong>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <input type="checkbox" checked={bgMusicOn} onChange={e => setBgMusicOn(e.target.checked)} />
                <span>Bật nhạc nền</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                <span style={{ fontSize: 18 }}>🔊</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={bgMusicVolume}
                  onChange={e => setBgMusicVolume(Number(e.target.value))}
                  style={{ flex: 1 }}
                  disabled={!bgMusicOn}
                />
                <span style={{ width: 32, textAlign: 'right', fontSize: 13 }}>{Math.round(bgMusicVolume * 100)}%</span>
              </div>
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15 }}>Chọn nhạc nền:</span>
                <select value={bgMusicFile} onChange={e => setBgMusicFile(e.target.value)} disabled={!bgMusicOn} style={{ padding: '2px 8px', fontSize: 15 }}>
                  <option value="background.mp3">Nhạc nền 1</option>
                  <option value="background2.mp3">Nhạc nền 2</option>
                  <option value="background3.mp3">Nhạc nền 3</option>
                </select>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: 18 }}>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  padding: '8px 32px',
                  fontSize: 16,
                  borderRadius: 8,
                  background: '#3182ce',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px #b6c2d6',
                }}
              >Đóng</button>
            </div>
          </div>
        </div>
      )}
      <div style={{ textAlign: 'center', color: '#2b6cb0', fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>
        <div>{localTime}</div>
        <div>{utcTime}</div>
      </div>
  <h1 style={{ color: '#3182ce', fontWeight: 'bold', fontSize: 28, marginBottom: 8 }}>{quizTitle || 'Quiz Kéo Thả'}</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        {/* Hiển thị chỉ câu hỏi hiện tại */}
        {currentQuestion && (
          <QuizList
            quizData={[currentQuestion]}
            userAnswers={userAnswers}
            onDropAnswer={handleDropAnswer}
            showResult={showResult}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={quizData.length}
          />
        )}
                </DragDropContext>
                <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* Nút kiểm tra và tiếp theo to, rõ, căn giữa */}
                  {!showResult && isAnswered && (
                    <button
                      onClick={handleCheckResult}
                      style={{
                        padding: '16px 40px',
                        fontSize: 20,
                        borderRadius: 12,
                        background: '#3182ce',
                        color: '#fff',
                        border: 'none',
                        boxShadow: '0 2px 8px #b6c2d6',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        marginBottom: 16
                      }}
                    >Kiểm tra</button>
                  )}
                  {showResult && !isLastQuestion && (
                    <button
                      onClick={handleNextQuestion}
                      style={{
                        padding: '18px 48px',
                        fontSize: 24,
                        borderRadius: 16,
                        background: 'linear-gradient(90deg, #38a169 60%, #68d391 100%)',
                        color: '#fff',
                        border: 'none',
                        boxShadow: '0 4px 16px #38a16955',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        marginBottom: 18,
                        letterSpacing: 1.2,
                        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)'
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.background = 'linear-gradient(90deg, #2f855a 60%, #38a169 100%)';
                        e.currentTarget.style.boxShadow = '0 6px 24px #38a16999';
                        e.currentTarget.style.transform = 'scale(1.06)';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.background = 'linear-gradient(90deg, #38a169 60%, #68d391 100%)';
                        e.currentTarget.style.boxShadow = '0 4px 16px #38a16955';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{verticalAlign: 'middle'}}>
                        <circle cx="14" cy="14" r="14" fill="#38a169"/>
                        <path d="M10 14h8M16 12l2 2-2 2" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Tiếp theo
                    </button>
                  )}
                  {/* Hiển thị kết quả cuối cùng nếu đã làm hết câu hỏi và nút làm lại */}
                  {showResult && isLastQuestion && (
                    <React.Fragment>
                      <div style={{ marginTop: 16, fontWeight: 'bold', color: '#2b6cb0', textAlign: 'center' }}>
                        <div style={{ fontSize: 18, marginBottom: 8 }}>
                          <div>{localTime}</div>
                          <div>{utcTime}</div>
                        </div>
                        <div style={{ fontSize: 22, marginBottom: 12 }}>Bạn đã hoàn thành tất cả câu hỏi!</div>
                        <div style={{ fontSize: 20, marginBottom: 24 }}>
                          Số câu đúng: {Object.keys(userAnswers).filter(qid => {
                            const q = quizData.find(item => item.id === qid);
                            return q && userAnswers[qid] === q.correctAnswerIndex;
                          }).length} / {quizData.length}
                        </div>
                        <button
                          onClick={handleReset}
                          style={{
                            padding: '16px 40px',
                            fontSize: 20,
                            borderRadius: 12,
                            background: '#e53e3e',
                            color: '#fff',
                            border: 'none',
                            boxShadow: '0 2px 8px #b6c2d6',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            marginTop: 8
                          }}
                        >Làm lại</button>
                      </div>
                    </React.Fragment>
                  )}
                </div>
      {/* Nút quay lại chọn bộ ở dưới cùng */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '32px 0 0 0' }}>
        <button
          onClick={() => setSelectedQuizSet(null)}
          style={{ padding: '12px 32px', fontSize: 18, borderRadius: 12, background: '#fff', border: '2px solid #3182ce', color: '#3182ce', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 8px #b6c2d6' }}
        >← Chọn bộ khác</button>
      </div>
        </div>
      );
}

export default App;
            
