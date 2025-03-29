export const mockQuestions = [
  {
    id: 1,
    question_text: "A client with type 2 diabetes is prescribed metformin. Which statement indicates the client understands the medication?",
    choices: [
      { text: "I will take this medication with breakfast to prevent low blood sugar.", isCorrect: false },
      { text: "I will take this medication with meals to reduce stomach upset.", isCorrect: true },
      { text: "I should check my blood glucose more frequently when I first start this medication.", isCorrect: false },
      { text: "I need to monitor for symptoms of lactic acidosis, such as dizziness and weakness.", isCorrect: false }
    ],
    explanation: "Metformin is commonly taken with meals to reduce GI side effects. This medication does not cause hypoglycemia when used alone, and while monitoring glucose is helpful, it is not specific to metformin therapy compared to other diabetes medications.",
    ref_sources: [
      "Lewis, S. L., Bucher, L., Heitkemper, M. M., & Harding, M. M. (2022). Medical-Surgical Nursing: Assessment and Management of Clinical Problems (11th ed.). Elsevier, pp. 1142-1145.",
      "American Diabetes Association. (2023). Standards of Medical Care in Diabetes. Diabetes Care, 46(Supplement 1), S1-S2."
    ],
    topic: "Pharmacological and Parenteral Therapies",
    sub_topic: "Medication Administration",
    topic_id: 6,
    sub_topic_id: 64,
    question_type: "multiple_choice",
    difficulty: "medium",
    ngn: false,
    time_taken: "1:45"
  },
  {
    id: 2,
    question_text: "A nurse is performing a respiratory assessment on a client with pneumonia. Which finding should the nurse report to the provider immediately?",
    choices: [
      { text: "Respiratory rate of 22 breaths per minute", isCorrect: false },
      { text: "Fine crackles at the right lung base", isCorrect: false },
      { text: "Oxygen saturation of 88% on room air", isCorrect: true },
      { text: "Productive cough with yellow sputum", isCorrect: false }
    ],
    explanation: "An oxygen saturation of 88% on room air indicates significant hypoxemia requiring immediate intervention. The other findings are expected in a client with pneumonia and do not represent emergent situations.",
    ref_sources: [
      "Potter, P. A., Perry, A. G., Stockert, P., & Hall, A. (2021). Fundamentals of Nursing (10th ed.). Elsevier, pp. 892-896.",
      "Hinkle, J. L., & Cheever, K. H. (2022). Brunner & Suddarth's Textbook of Medical-Surgical Nursing (15th ed.). Wolters Kluwer, pp. 574-578."
    ],
    topic: "Physiological Adaptation",
    sub_topic: "Alterations in Body Systems",
    topic_id: 8,
    sub_topic_id: 70,
    question_type: "multiple_choice",
    difficulty: "medium",
    ngn: false,
    time_taken: "2:24"
  },
  {
    id: 3,
    question_text: "A nurse is caring for a client with heart failure. Which intervention should the nurse implement first?",
    choices: [
      { text: "Administer prescribed diuretics", isCorrect: false },
      { text: "Position the client with the head of bed elevated", isCorrect: true },
      { text: "Auscultate lung sounds", isCorrect: false },
      { text: "Apply oxygen via nasal cannula", isCorrect: false }
    ],
    explanation: "Elevating the head of the bed reduces venous return to the heart, decreases preload, and improves breathing immediately. While the other interventions are appropriate, positioning should be done first to alleviate respiratory distress.",
    ref_sources: [
      "Ignatavicius, D. D., Workman, M. L., & Rebar, C. R. (2021). Medical-Surgical Nursing: Concepts for Interprofessional Collaborative Care (10th ed.). Elsevier, pp. 732-740.",
      "American Heart Association. (2023). Heart Failure Guidelines. Circulation, 147(12), e123-e269."
    ],
    topic: "Physiological Adaptation",
    sub_topic: "Illness Management",
    topic_id: 8,
    sub_topic_id: 73,
    question_type: "multiple_choice",
    difficulty: "hard",
    ngn: true,
    time_taken: "3:12"
  }
  // More mock questions can be added here
];

export const mockUserProgress = {
  name: "John McManaman",
  correctPercentage: 75,
  totalQuestions: 100,
  unusedQuestions: 45,
  usedQuestions: 55,
  omittedQuestions: 5,
  recentTests: [
    {
      date: "2024-03-15",
      score: 82,
      totalQuestions: 25
    },
    {
      date: "2024-03-14",
      score: 76,
      totalQuestions: 25
    }
  ]
};
