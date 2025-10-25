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
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <ul className="divide-y divide-gray-100">
        {questions.map((question) => {
          const statusClass = STATUS_STYLES[question.status] ?? STATUS_STYLES.pending;

          return (
            <li key={question.id} className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-500">
                    <span className="font-medium text-gray-700">
                      {type === "received" ? question.from : question.to}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span>{question.sentAt}</span>
                    <span className="text-gray-300">•</span>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass}`}
                    >
                      {question.statusLabel}
                    </span>
                  </div>
                  <p className="text-base font-medium text-gray-900">
                    {question.content}
                  </p>
                  {type === "received" && question.answer ? (
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
                      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        내 답변
                      </div>
                      <p className="leading-relaxed">{question.answer}</p>
                    </div>
                  ) : null}
                </div>

                {type === "received" ? (
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900"
                  >
                    답장하기
                  </button>
                ) : (
                  <div className="flex w-full flex-col items-start gap-2 text-xs text-gray-500 sm:w-auto sm:items-end">
                    <span>
                      답변 요청: <strong className="ml-1 text-gray-700">{question.respondent}</strong>
                    </span>
                    {question.expectedReply ? (
                      <span>
                        예상 답변일: <strong className="ml-1 text-gray-700">{question.expectedReply}</strong>
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
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
