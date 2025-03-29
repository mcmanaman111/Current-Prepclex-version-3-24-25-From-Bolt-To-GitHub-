import type { Category } from './types';

// Client needs categories with hardcoded counts that add up to exactly 19 questions
export const clientNeeds: Category[] = [
  {
    id: '1',
    name: 'Pharmacological and Parenteral Therapies',
    count: 4,
    topicCount: 1,
    topics: [
      {
        id: '11',
        name: 'Medication Administration',
        count: 4
      }
    ]
  },
  {
    id: '2',
    name: 'Safety and Infection Control',
    count: 4,
    topicCount: 1,
    topics: [
      {
        id: '21',
        name: 'Standard Precautions',
        count: 4
      }
    ]
  },
  {
    id: '3',
    name: 'Health Promotion and Maintenance',
    count: 2,
    topicCount: 1,
    topics: [
      {
        id: '31',
        name: 'Health Screening',
        count: 2
      }
    ]
  },
  {
    id: '4',
    name: 'Psychosocial Integrity',
    count: 2,
    topicCount: 2,
    topics: [
      {
        id: '41',
        name: 'Mental Health Concepts',
        count: 1
      },
      {
        id: '42',
        name: 'Therapeutic Communication',
        count: 1
      }
    ]
  },
  {
    id: '5',
    name: 'Basic Care and Comfort',
    count: 2,
    topicCount: 2,
    topics: [
      {
        id: '51',
        name: 'Mobility',
        count: 1
      },
      {
        id: '52',
        name: 'Nutrition and Oral Hydration',
        count: 1
      }
    ]
  },
  {
    id: '6',
    name: 'Management of Care',
    count: 1,
    topicCount: 1,
    topics: [
      {
        id: '61',
        name: 'Assignment and Delegation',
        count: 1
      }
    ]
  },
  {
    id: '7',
    name: 'Reduction of Risk Potential',
    count: 2,
    topicCount: 1,
    topics: [
      {
        id: '71',
        name: 'Vital Signs',
        count: 2
      }
    ]
  },
  {
    id: '8',
    name: 'Physiological Adaptation',
    count: 2,
    topicCount: 2,
    topics: [
      {
        id: '81',
        name: 'Alterations in Body Systems',
        count: 1
      },
      {
        id: '82',
        name: 'Illness Management',
        count: 1
      }
    ]
  }
];
