import PropTypes from "prop-types";

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  answered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  archived: "bg-gray-100 text-gray-600 border-gray-200",
};

const QuestionList = ({ questions, type }) => {
  if (!questions?.length) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white">
        <div className="text-center text-sm">
          <p className="font-medium text-gray-700">
            {type === "received" ? "받은 질문이 없습니다" : "보낸 질문이 없습니다"}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            새로운 질문이 등록되면 이곳에서 확인할 수 있어요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="y-scroll flex flex-col gap-4 max-h-[600px] overflow-y-auto">
        {questions.map((question) => {
          // const statusClass = STATUS_STYLES[question.status] ?? STATUS_STYLES.pending;
          
          return (
            <div key={question.id} className="p-6 rounded-2xl border border-gray-200 bg-white shadow-sm h-[10rem] flex justify-center items-center">
              <div className="flex">
                <img src="https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1095249842.jpg" alt="anonymous user" className="w-12 h-12 mr-4"/>
                
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

QuestionList.propTypes = {
  questions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      content: PropTypes.string.isRequired,
      sentAt: PropTypes.string.isRequired,
      status: PropTypes.oneOf(["pending", "answered", "archived"]).isRequired,
      statusLabel: PropTypes.string.isRequired,
      from: PropTypes.string,
      to: PropTypes.string,
      answer: PropTypes.string,
      respondent: PropTypes.string,
      expectedReply: PropTypes.string,
    })
  ),
  type: PropTypes.oneOf(["received", "sent"]).isRequired,
};

QuestionList.defaultProps = {
  questions: [],
};

export default QuestionList;
