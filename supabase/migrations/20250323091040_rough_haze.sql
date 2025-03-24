/*
  # Add Topics and Subtopics Data

  1. New Data
    - Insert all NCLEX topics and their subtopics
    - Maintain referential integrity through foreign keys
    - Preserve existing data if any

  2. Changes
    - Add unique constraint on topics name
    - Add unique constraint on subtopics topic_id + name
    - Insert topics first to get IDs
    - Insert subtopics with correct topic_id references
*/

-- Add unique constraint to topics name
ALTER TABLE topics
ADD CONSTRAINT topics_name_key UNIQUE (name);

-- Add unique constraint to subtopics topic_id + name combination
ALTER TABLE subtopics
ADD CONSTRAINT subtopics_topic_id_name_key UNIQUE (topic_id, name);

-- Insert topics
INSERT INTO topics (name, description) VALUES
  ('Management of Care', 'Focuses on coordination of care, safety, legal rights, and ethical practice.'),
  ('Safety and Infection Control', 'Covers prevention of injury, emergency response, and infection prevention.'),
  ('Health Promotion and Maintenance', 'Addresses prevention, early detection, and lifestyle choices.'),
  ('Psychosocial Integrity', 'Deals with mental health, coping, and cultural aspects of care.'),
  ('Basic Care and Comfort', 'Covers activities of daily living, nutrition, and rest.'),
  ('Pharmacological and Parenteral Therapies', 'Focuses on medication administration and pain management.'),
  ('Reduction of Risk Potential', 'Addresses complications and health alterations.'),
  ('Physiological Adaptation', 'Covers care for acute, chronic, and life-threatening conditions.')
ON CONFLICT (name) DO NOTHING;

-- Insert subtopics using DO block to handle multiple statements
DO $$
DECLARE
  v_topic_id INTEGER;
BEGIN
  -- Management of Care subtopics
  SELECT id INTO v_topic_id FROM topics WHERE name = 'Management of Care';
  INSERT INTO subtopics (topic_id, name, description) VALUES
    (v_topic_id, 'Advance Directives/Self-Determination/Life Planning', 'Legal documents and patient autonomy in healthcare decisions'),
    (v_topic_id, 'Advocacy', 'Patient advocacy and protection of rights'),
    (v_topic_id, 'Assignment, Delegation, and Supervision', 'Task delegation and oversight'),
    (v_topic_id, 'Case Management', 'Coordinating patient care services'),
    (v_topic_id, 'Client Rights', 'Understanding and protecting patient rights'),
    (v_topic_id, 'Collaboration with Multidisciplinary Team', 'Working with healthcare team members'),
    (v_topic_id, 'Concepts of Management', 'Healthcare management principles'),
    (v_topic_id, 'Confidentiality/Information Security', 'Protecting patient information'),
    (v_topic_id, 'Continuity of Care', 'Maintaining consistent care across settings'),
    (v_topic_id, 'Establishing Priorities', 'Care prioritization and time management'),
    (v_topic_id, 'Ethical Practice', 'Ethical decision-making in healthcare'),
    (v_topic_id, 'Informed Consent', 'Patient rights and procedure consent'),
    (v_topic_id, 'Information Technology', 'Healthcare technology and documentation'),
    (v_topic_id, 'Legal Rights and Responsibilities', 'Legal aspects of nursing practice'),
    (v_topic_id, 'Performance Improvement (Quality Improvement)', 'Healthcare quality enhancement'),
    (v_topic_id, 'Referrals', 'Coordinating specialized care services')
  ON CONFLICT (topic_id, name) DO NOTHING;

  -- Safety and Infection Control subtopics
  SELECT id INTO v_topic_id FROM topics WHERE name = 'Safety and Infection Control';
  INSERT INTO subtopics (topic_id, name, description) VALUES
    (v_topic_id, 'Accident/Error/Injury Prevention', 'Prevention of healthcare-related injuries'),
    (v_topic_id, 'Emergency Response Plan', 'Emergency preparedness and response'),
    (v_topic_id, 'Ergonomic Principles', 'Safe patient handling and movement'),
    (v_topic_id, 'Handling Hazardous and Infectious Materials', 'Safe handling of dangerous materials'),
    (v_topic_id, 'Home Safety', 'Patient safety in home environment'),
    (v_topic_id, 'Reporting of Incident/Event/Irregular Occurrence/Variance', 'Incident reporting procedures'),
    (v_topic_id, 'Safe Use of Equipment', 'Proper equipment operation and safety'),
    (v_topic_id, 'Security Plan', 'Facility and patient security measures'),
    (v_topic_id, 'Standard Precautions/Transmission-Based Precautions/Surgical Asepsis', 'Infection prevention measures'),
    (v_topic_id, 'Use of Restraint/Safety Devices', 'Proper use of patient restraints')
  ON CONFLICT (topic_id, name) DO NOTHING;

  -- Health Promotion and Maintenance subtopics
  SELECT id INTO v_topic_id FROM topics WHERE name = 'Health Promotion and Maintenance';
  INSERT INTO subtopics (topic_id, name, description) VALUES
    (v_topic_id, 'Aging Process', 'Understanding aging and related care'),
    (v_topic_id, 'Ante-/Intra-/Postpartum and Newborn Care', 'Pregnancy and newborn care'),
    (v_topic_id, 'Developmental Stages and Transitions', 'Life stages and development'),
    (v_topic_id, 'Health Promotion/Disease Prevention', 'Preventive healthcare measures'),
    (v_topic_id, 'Health Screening', 'Preventive health screenings'),
    (v_topic_id, 'High-Risk Behaviors', 'Managing risky health behaviors'),
    (v_topic_id, 'Lifestyle Choices', 'Health-related lifestyle decisions'),
    (v_topic_id, 'Self-Care', 'Patient self-management skills'),
    (v_topic_id, 'Techniques of Physical Assessment', 'Physical examination methods')
  ON CONFLICT (topic_id, name) DO NOTHING;

  -- Psychosocial Integrity subtopics
  SELECT id INTO v_topic_id FROM topics WHERE name = 'Psychosocial Integrity';
  INSERT INTO subtopics (topic_id, name, description) VALUES
    (v_topic_id, 'Abuse or Neglect', 'Identifying and addressing abuse'),
    (v_topic_id, 'Behavioral Interventions', 'Managing behavioral issues'),
    (v_topic_id, 'Substance Use Disorders/Dependencies', 'Addiction and treatment'),
    (v_topic_id, 'Coping Mechanisms', 'Stress and anxiety management'),
    (v_topic_id, 'Crisis Intervention', 'Emergency mental health care'),
    (v_topic_id, 'Cultural Awareness and Influences on Health', 'Cultural competency'),
    (v_topic_id, 'End-of-Life Care', 'Terminal illness and death care'),
    (v_topic_id, 'Family Dynamics', 'Family relationships and health'),
    (v_topic_id, 'Grief and Loss', 'Managing grief processes'),
    (v_topic_id, 'Mental Health Concepts', 'Psychiatric nursing principles'),
    (v_topic_id, 'Religious and Spiritual Influences on Health', 'Spiritual aspects of care'),
    (v_topic_id, 'Sensory/Perceptual Alterations', 'Sensory changes and care'),
    (v_topic_id, 'Stress Management', 'Stress reduction techniques'),
    (v_topic_id, 'Support Systems', 'Patient support resources'),
    (v_topic_id, 'Therapeutic Communication', 'Effective patient communication'),
    (v_topic_id, 'Therapeutic Environment', 'Creating healing environments')
  ON CONFLICT (topic_id, name) DO NOTHING;

  -- Basic Care and Comfort subtopics
  SELECT id INTO v_topic_id FROM topics WHERE name = 'Basic Care and Comfort';
  INSERT INTO subtopics (topic_id, name, description) VALUES
    (v_topic_id, 'Assistive Devices', 'Mobility and function aids'),
    (v_topic_id, 'Elimination', 'Bowel and bladder management'),
    (v_topic_id, 'Mobility/Immobility', 'Movement and positioning'),
    (v_topic_id, 'Nonpharmacological Comfort Interventions', 'Non-drug comfort measures'),
    (v_topic_id, 'Nutrition and Oral Hydration', 'Nutrition and hydration care'),
    (v_topic_id, 'Personal Hygiene', 'Basic hygiene care'),
    (v_topic_id, 'Rest and Sleep', 'Sleep and rest promotion')
  ON CONFLICT (topic_id, name) DO NOTHING;

  -- Pharmacological and Parenteral Therapies subtopics
  SELECT id INTO v_topic_id FROM topics WHERE name = 'Pharmacological and Parenteral Therapies';
  INSERT INTO subtopics (topic_id, name, description) VALUES
    (v_topic_id, 'Adverse Effects/Interactions', 'Medication side effects'),
    (v_topic_id, 'Blood and Blood Products', 'Blood product administration'),
    (v_topic_id, 'Central Venous Access Devices', 'Central line management'),
    (v_topic_id, 'Dosage Calculations', 'Medication calculations'),
    (v_topic_id, 'Expected Actions/Outcomes', 'Medication effects monitoring'),
    (v_topic_id, 'Medication Administration', 'Safe medication delivery'),
    (v_topic_id, 'Parenteral/Intravenous Therapies', 'IV therapy management'),
    (v_topic_id, 'Pharmacological Pain Management', 'Pain medication management'),
    (v_topic_id, 'Total Parenteral Nutrition', 'TPN administration')
  ON CONFLICT (topic_id, name) DO NOTHING;

  -- Reduction of Risk Potential subtopics
  SELECT id INTO v_topic_id FROM topics WHERE name = 'Reduction of Risk Potential';
  INSERT INTO subtopics (topic_id, name, description) VALUES
    (v_topic_id, 'Changes/Abnormalities in Vital Signs', 'Vital sign monitoring'),
    (v_topic_id, 'Diagnostic Tests', 'Medical test procedures'),
    (v_topic_id, 'Lab Values', 'Laboratory result interpretation'),
    (v_topic_id, 'Potential for Alterations in Body Systems', 'System dysfunction risks'),
    (v_topic_id, 'Potential for Complications of Diagnostic Tests/Treatments/Procedures', 'Procedure complications'),
    (v_topic_id, 'Potential for Complications from Surgical Procedures and Health Alterations', 'Surgery risks'),
    (v_topic_id, 'System-Specific Assessments', 'Body system evaluation'),
    (v_topic_id, 'Therapeutic Procedures', 'Treatment procedures')
  ON CONFLICT (topic_id, name) DO NOTHING;

  -- Physiological Adaptation subtopics
  SELECT id INTO v_topic_id FROM topics WHERE name = 'Physiological Adaptation';
  INSERT INTO subtopics (topic_id, name, description) VALUES
    (v_topic_id, 'Alterations in Body Systems', 'System dysfunction management'),
    (v_topic_id, 'Fluid and Electrolyte Imbalances', 'Fluid balance management'),
    (v_topic_id, 'Hemodynamics', 'Blood flow monitoring'),
    (v_topic_id, 'Illness Management', 'Disease management'),
    (v_topic_id, 'Medical Emergencies', 'Emergency response'),
    (v_topic_id, 'Pathophysiology', 'Disease processes'),
    (v_topic_id, 'Unexpected Response to Therapies', 'Treatment complications')
  ON CONFLICT (topic_id, name) DO NOTHING;
END $$;