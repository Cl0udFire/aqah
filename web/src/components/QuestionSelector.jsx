import PropTypes from "prop-types";

const QUESTION_TABS = [
  { value: "received", label: "받은 질문" },
  { value: "sent", label: "보낸 질문" },
];

const QuestionSelector = ({ value, onChange }) => {
  return (
    <div className="inline-flex items-center rounded-full bg-gray-100 p-1 text-sm font-medium text-gray-600">
      {QUESTION_TABS.map((tab) => {
        const isActive = tab.value === value;

        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`relative rounded-full px-4 py-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1 ${
              isActive
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
            aria-pressed={isActive}
          >
            {tab.label}
            {isActive ? (
              <span
                className="pointer-events-none absolute inset-0 rounded-full border border-gray-200"
                aria-hidden
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
};

QuestionSelector.propTypes = {
  value: PropTypes.oneOf(["received", "sent"]).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default QuestionSelector;
