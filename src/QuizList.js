// QuizList.js: Hiển thị danh sách các câu hỏi quiz
import React from 'react';
import QuizItem from './QuizItem'; // Import component hiển thị từng câu hỏi
import { Droppable } from '@hello-pangea/dnd';

// quizData: mảng dữ liệu câu hỏi
// userAnswers: đáp án người dùng chọn
// onDropAnswer: hàm xử lý khi thả đáp án
// showResult: trạng thái hiển thị kết quả
function QuizList({ quizData, userAnswers, onDropAnswer, showResult, currentQuestionIndex, totalQuestions }) {
  return (
    <div>
      {quizData.map((q) => (
        <Droppable droppableId={q.id} key={q.id} direction="horizontal">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <QuizItem
                key={q.id}
                question={q}
                userAnswer={userAnswers[q.id]}
                onDropAnswer={answerIdx => onDropAnswer(q.id, answerIdx)}
                showResult={showResult}
                droppableProvided={provided}
                questionIndex={currentQuestionIndex}
                totalQuestions={totalQuestions}
              />
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ))}
    </div>
  );
}

// Xuất component QuizList để sử dụng ở file khác
export default QuizList;
