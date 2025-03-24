import { Category } from './types';

export const clientNeeds: Category[] = [
  {
    id: 'management',
    name: 'Management of Care',
    count: 224,
    topicCount: 16,
    topics: [
      { id: 'advance-directives', name: 'Advance Directives/Self-Determination/Life Planning', count: 14 },
      { id: 'advocacy', name: 'Advocacy', count: 14 },
      { id: 'assignment', name: 'Assignment, Delegation, and Supervision', count: 14 },
      { id: 'case-management', name: 'Case Management', count: 14 },
      { id: 'client-rights', name: 'Client Rights', count: 14 },
      { id: 'collaboration', name: 'Collaboration with Multidisciplinary Team', count: 14 },
      { id: 'management-concepts', name: 'Concepts of Management', count: 14 },
      { id: 'confidentiality', name: 'Confidentiality/Information Security', count: 14 },
      { id: 'continuity', name: 'Continuity of Care', count: 14 },
      { id: 'priorities', name: 'Establishing Priorities', count: 14 },
      { id: 'ethical', name: 'Ethical Practice', count: 14 },
      { id: 'informed-consent', name: 'Informed Consent', count: 14 },
      { id: 'it', name: 'Information Technology', count: 14 },
      { id: 'legal-rights', name: 'Legal Rights and Responsibilities', count: 14 },
      { id: 'quality', name: 'Performance Improvement (Quality Improvement)', count: 14 },
      { id: 'referrals', name: 'Referrals', count: 14 }
    ]
  },
  {
    id: 'safety',
    name: 'Safety and Infection Control',
    count: 156,
    topicCount: 10,
    topics: [
      { id: 'accident-prevention', name: 'Accident/Error/Injury Prevention', count: 16 },
      { id: 'emergency-response', name: 'Emergency Response Plan', count: 16 },
      { id: 'ergonomic', name: 'Ergonomic Principles', count: 16 },
      { id: 'hazardous-materials', name: 'Handling Hazardous and Infectious Materials', count: 16 },
      { id: 'home-safety', name: 'Home Safety', count: 16 },
      { id: 'incident-reporting', name: 'Reporting of Incident/Event/Irregular Occurrence/Variance', count: 16 },
      { id: 'equipment-safety', name: 'Safe Use of Equipment', count: 15 },
      { id: 'security', name: 'Security Plan', count: 15 },
      { id: 'precautions', name: 'Standard Precautions/Transmission-Based Precautions/Surgical Asepsis', count: 15 },
      { id: 'restraints', name: 'Use of Restraint/Safety Devices', count: 15 }
    ]
  },
  {
    id: 'health-promotion',
    name: 'Health Promotion and Maintenance',
    count: 178,
    topicCount: 9,
    topics: [
      { id: 'aging', name: 'Aging Process', count: 20 },
      { id: 'antepartum', name: 'Ante-/Intra-/Postpartum and Newborn Care', count: 20 },
      { id: 'development', name: 'Developmental Stages and Transitions', count: 20 },
      { id: 'health-promotion', name: 'Health Promotion/Disease Prevention', count: 20 },
      { id: 'screening', name: 'Health Screening', count: 20 },
      { id: 'risk-behaviors', name: 'High-Risk Behaviors', count: 20 },
      { id: 'lifestyle', name: 'Lifestyle Choices', count: 20 },
      { id: 'self-care', name: 'Self-Care', count: 19 },
      { id: 'assessment', name: 'Techniques of Physical Assessment', count: 19 }
    ]
  },
  {
    id: 'psychosocial',
    name: 'Psychosocial Integrity',
    count: 134,
    topicCount: 16,
    topics: [
      { id: 'abuse-neglect', name: 'Abuse or Neglect', count: 8 },
      { id: 'behavioral', name: 'Behavioral Interventions', count: 8 },
      { id: 'substance', name: 'Substance Use Disorders/Dependencies', count: 8 },
      { id: 'coping', name: 'Coping Mechanisms', count: 8 },
      { id: 'crisis', name: 'Crisis Intervention', count: 8 },
      { id: 'cultural', name: 'Cultural Awareness and Influences on Health', count: 8 },
      { id: 'end-of-life', name: 'End-of-Life Care', count: 8 },
      { id: 'family', name: 'Family Dynamics', count: 8 },
      { id: 'grief', name: 'Grief and Loss', count: 9 },
      { id: 'mental-health', name: 'Mental Health Concepts', count: 9 },
      { id: 'religious', name: 'Religious and Spiritual Influences on Health', count: 9 },
      { id: 'sensory', name: 'Sensory/Perceptual Alterations', count: 9 },
      { id: 'stress', name: 'Stress Management', count: 9 },
      { id: 'support', name: 'Support Systems', count: 9 },
      { id: 'therapeutic-comm', name: 'Therapeutic Communication', count: 8 },
      { id: 'therapeutic-env', name: 'Therapeutic Environment', count: 8 }
    ]
  },
  {
    id: 'basic-care',
    name: 'Basic Care and Comfort',
    count: 145,
    topicCount: 7,
    topics: [
      { id: 'assistive', name: 'Assistive Devices', count: 21 },
      { id: 'elimination', name: 'Elimination', count: 21 },
      { id: 'mobility', name: 'Mobility/Immobility', count: 21 },
      { id: 'non-pharm', name: 'Nonpharmacological Comfort Interventions', count: 21 },
      { id: 'nutrition', name: 'Nutrition and Oral Hydration', count: 21 },
      { id: 'hygiene', name: 'Personal Hygiene', count: 20 },
      { id: 'rest', name: 'Rest and Sleep', count: 20 }
    ]
  },
  {
    id: 'pharmacological',
    name: 'Pharmacological and Parenteral Therapies',
    count: 186,
    topicCount: 9,
    topics: [
      { id: 'adverse', name: 'Adverse Effects/Interactions', count: 21 },
      { id: 'blood', name: 'Blood and Blood Products', count: 21 },
      { id: 'central-lines', name: 'Central Venous Access Devices', count: 21 },
      { id: 'calculations', name: 'Dosage Calculations', count: 21 },
      { id: 'expected', name: 'Expected Actions/Outcomes', count: 21 },
      { id: 'med-admin', name: 'Medication Administration', count: 21 },
      { id: 'parenteral', name: 'Parenteral/Intravenous Therapies', count: 20 },
      { id: 'pain', name: 'Pharmacological Pain Management', count: 20 },
      { id: 'tpn', name: 'Total Parenteral Nutrition', count: 20 }
    ]
  },
  {
    id: 'risk-reduction',
    name: 'Reduction of Risk Potential',
    count: 198,
    topicCount: 8,
    topics: [
      { id: 'vital-signs', name: 'Changes/Abnormalities in Vital Signs', count: 25 },
      { id: 'diagnostics', name: 'Diagnostic Tests', count: 25 },
      { id: 'lab-values', name: 'Lab Values', count: 25 },
      { id: 'alterations', name: 'Potential for Alterations in Body Systems', count: 25 },
      { id: 'test-complications', name: 'Potential for Complications of Diagnostic Tests/Treatments/Procedures', count: 25 },
      { id: 'surgical-complications', name: 'Potential for Complications from Surgical Procedures and Health Alterations', count: 25 },
      { id: 'assessments', name: 'System-Specific Assessments', count: 24 },
      { id: 'procedures', name: 'Therapeutic Procedures', count: 24 }
    ]
  },
  {
    id: 'physiological',
    name: 'Physiological Adaptation',
    count: 167,
    topicCount: 7,
    topics: [
      { id: 'body-systems', name: 'Alterations in Body Systems', count: 24 },
      { id: 'fluid', name: 'Fluid and Electrolyte Imbalances', count: 24 },
      { id: 'hemodynamics', name: 'Hemodynamics', count: 24 },
      { id: 'illness', name: 'Illness Management', count: 24 },
      { id: 'emergencies', name: 'Medical Emergencies', count: 24 },
      { id: 'pathophysiology', name: 'Pathophysiology', count: 24 },
      { id: 'unexpected', name: 'Unexpected Response to Therapies', count: 23 }
    ]
  }
];

// Export categories without topics for the subject view
export const categories = [
  { id: 'fundamentals', name: 'Fundamentals', count: 245, topicCount: 0 },
  { id: 'adult-health', name: 'Adult Health', count: 312, topicCount: 0 },
  { id: 'pediatrics', name: 'Pediatrics', count: 178, topicCount: 0 },
  { id: 'mental-health', name: 'Mental Health', count: 134, topicCount: 0 },
  { id: 'maternal-newborn', name: 'Maternal - Newborn', count: 156, topicCount: 0 },
  { id: 'pharmacology', name: 'Pharmacology', count: 186, topicCount: 0 },
  { id: 'critical-care', name: 'Critical Care', count: 198, topicCount: 0 },
  { id: 'management', name: 'Management of Care', count: 224, topicCount: 0 }
];