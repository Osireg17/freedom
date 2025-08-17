-- AceYourHireVue Seed Data
-- This file populates the database with sample data for testing and development

-- Insert sample users
INSERT INTO users (id, first_name, last_name, email, photo_url, industry, years_of_experience, username, subscription_tier, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'John', 'Doe', 'john.doe@example.com', 'https://i.pravatar.cc/150?img=1', 'Technology', 5, 'johndoe', 'free', NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'Jane', 'Smith', 'jane.smith@example.com', 'https://i.pravatar.cc/150?img=2', 'Marketing', 3, 'janesmith', 'standard', NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'Michael', 'Johnson', 'michael.johnson@example.com', 'https://i.pravatar.cc/150?img=3', 'Finance', 8, 'michaelj', 'pro', NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', 'Sarah', 'Williams', 'sarah.williams@example.com', 'https://i.pravatar.cc/150?img=4', 'Healthcare', 2, 'sarahw', 'free', NOW(), NOW()),
('55555555-5555-5555-5555-555555555555', 'David', 'Brown', 'david.brown@example.com', 'https://i.pravatar.cc/150?img=5', 'Engineering', 12, 'davidb', 'standard', NOW(), NOW());

-- Insert sample behavioral questions
INSERT INTO behavioral_questions (id, category, question_text) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Leadership', 'Tell me about a time when you had to lead a team through a difficult project. How did you handle it?'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Problem Solving', 'Describe a challenging problem you encountered at work and how you solved it.'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Communication', 'Give me an example of when you had to explain a complex technical concept to a non-technical audience.'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Teamwork', 'Tell me about a time when you had to work with a difficult team member. How did you handle the situation?'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Adaptability', 'Describe a situation where you had to quickly adapt to a significant change at work.'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Conflict Resolution', 'Tell me about a time when you had to resolve a conflict between team members.'),
('gggggggg-gggg-gggg-gggg-gggggggggggg', 'Time Management', 'Describe how you handle multiple competing priorities and tight deadlines.'),
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'Innovation', 'Tell me about a time when you came up with a creative solution to improve a process or solve a problem.');

-- Insert sample interviews
INSERT INTO interviews (id, user_id, interview_type, company_name, job_position, job_description, job_experience, resume_filename, time_to_answer, status, last_question_index, original_interview_id, created_at, updated_at) VALUES
-- Completed interviews
('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', '11111111-1111-1111-1111-111111111111', 'ai', 'Google', 'Software Engineer', 'We are looking for a passionate Software Engineer to design, develop and install software solutions. The successful candidate will be able to build high-quality, innovative and fully performing software in compliance with coding standards and technical design.', 'Mid-level (3-5 years)', NULL, 60, 'completed', 5, NULL, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', '22222222-2222-2222-2222-222222222222', 'ai', 'Microsoft', 'Product Marketing Manager', 'Join our dynamic marketing team to drive product strategy and go-to-market execution. You will work closely with engineering, sales, and design teams to launch innovative products.', 'Senior level (5+ years)', NULL, 90, 'completed', 4, NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', '33333333-3333-3333-3333-333333333333', 'resume', 'JP Morgan Chase', 'Financial Analyst', 'Analyze financial data, prepare reports, and support investment decisions. Strong analytical skills and attention to detail required.', 'Entry level (0-2 years)', 'michael_johnson_resume.pdf', 120, 'completed', 6, NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
-- Ongoing interviews
('d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', '44444444-4444-4444-4444-444444444444', 'ai', 'Johnson & Johnson', 'Clinical Research Coordinator', 'Coordinate clinical trials and ensure compliance with regulatory requirements. Experience in healthcare or clinical research preferred.', 'Mid-level (3-5 years)', NULL, 75, 'ongoing', 2, NULL, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
-- Not started interviews
('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5', '55555555-5555-5555-5555-555555555555', 'custom', 'Tesla', 'Mechanical Engineer', 'Design and develop mechanical systems for electric vehicles. Strong background in automotive engineering required.', 'Senior level (5+ years)', NULL, 60, 'not_started', 0, NULL, NOW(), NOW());

-- Insert sample interview questions for completed interviews
INSERT INTO interview_questions (id, interview_id, question_number, question_text, question_type, original_question_id) VALUES
-- Questions for Google Software Engineer interview
('q1q1q1q1-q1q1-q1q1-q1q1-q1q1q1q1q1q1', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 1, 'Tell me about yourself and your experience in software development.', 'behavioral', NULL),
('q2q2q2q2-q2q2-q2q2-q2q2-q2q2q2q2q2q2', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 2, 'How would you design a scalable system to handle millions of users?', 'technical', NULL),
('q3q3q3q3-q3q3-q3q3-q3q3-q3q3q3q3q3q3', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 3, 'Describe a time when you had to debug a particularly challenging issue.', 'behavioral', NULL),
('q4q4q4q4-q4q4-q4q4-q4q4-q4q4q4q4q4q4', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 4, 'What are your thoughts on code reviews and how do you approach them?', 'behavioral', NULL),
('q5q5q5q5-q5q5-q5q5-q5q5-q5q5q5q5q5q5', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 5, 'How do you stay updated with the latest technologies and programming languages?', 'behavioral', NULL),

-- Questions for Microsoft Product Marketing Manager interview
('q6q6q6q6-q6q6-q6q6-q6q6-q6q6q6q6q6q6', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 1, 'Walk me through how you would launch a new product feature.', 'situational', NULL),
('q7q7q7q7-q7q7-q7q7-q7q7-q7q7q7q7q7q7', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 2, 'How do you measure the success of a marketing campaign?', 'technical', NULL),
('q8q8q8q8-q8q8-q8q8-q8q8-q8q8q8q8q8q8', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 3, 'Tell me about a time when a product launch didn\'t go as planned.', 'behavioral', NULL),
('q9q9q9q9-q9q9-q9q9-q9q9-q9q9q9q9q9q9', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 4, 'How would you handle conflicting priorities from different stakeholders?', 'situational', NULL),

-- Questions for JP Morgan Financial Analyst interview
('qaaaaaa-qaaa-qaaa-qaaa-qaaaaaaaaaa', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 1, 'Explain your experience with financial modeling and analysis.', 'behavioral', NULL),
('qbbbbbb-qbbb-qbbb-qbbb-qbbbbbbbbbb', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 2, 'How would you value a company using different valuation methods?', 'technical', NULL),
('qcccccc-qccc-qccc-qccc-qcccccccccc', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 3, 'Describe a time when you identified a significant financial risk.', 'behavioral', NULL),
('qdddddd-qddd-qddd-qddd-qdddddddddd', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 4, 'What financial metrics would you track for a SaaS company?', 'technical', NULL),
('qeeeeeee-qeee-qeee-qeee-qeeeeeeeeee', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 5, 'How do you ensure accuracy in your financial reports?', 'behavioral', NULL),
('qfffffff-qfff-qfff-qfff-qfffffffffft', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 6, 'Walk me through a DCF model and its key assumptions.', 'technical', NULL),

-- Questions for ongoing Johnson & Johnson interview
('qggggggg-qggg-qggg-qggg-qgggggggggg', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', 1, 'Tell me about your experience in clinical research.', 'behavioral', NULL),
('qhhhhhhh-qhhh-qhhh-qhhh-qhhhhhhhhhh', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', 2, 'How do you ensure compliance with GCP guidelines?', 'technical', NULL),
('qiiiiiii-qiii-qiii-qiii-qiiiiiiiii', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', 3, 'Describe a challenging situation you faced with study participants.', 'situational', NULL);

-- Insert sample interview answers for completed interviews
INSERT INTO interview_answers (id, interview_id, interview_question_id, transcription, evaluation, redo_attempt_number, overall_score, star_scores, communication_scores, content_scores, interpersonal_scores, speech_metrics, improvement_suggestions, audio_url, audio_duration_ms, analyzed_at, created_at, updated_at) VALUES
-- Answers for Google Software Engineer interview
('ans11111-1111-1111-1111-111111111111', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'q1q1q1q1-q1q1-q1q1-q1q1-q1q1q1q1q1q1', 'I''m a software engineer with 5 years of experience in full-stack development. I''ve worked primarily with JavaScript, Python, and Java, building scalable web applications. In my current role at ABC Corp, I lead a team of 3 developers and have successfully delivered several high-impact projects including a customer portal that serves over 100,000 users daily.', 'Strong introduction that covers relevant experience and achievements. Good mention of leadership experience and scale of impact.', 0, 85, '{"situation": 8, "task": 9, "action": 8, "result": 9}', '{"clarity": 8, "confidence": 9, "engagement": 8}', '{"relevance": 9, "depth": 8, "examples": 8}', '{"enthusiasm": 8, "professionalism": 9}', '{"speaking_pace": 8, "filler_words": 7, "articulation": 9}', '["Consider adding more specific technical details about your projects", "Mention specific programming frameworks or tools you''ve mastered"]', 'https://example.com/audio/ans1.mp3', 45000, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

('ans22222-2222-2222-2222-222222222222', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'q2q2q2q2-q2q2-q2q2-q2q2-q2q2q2q2q2q2', 'For a system handling millions of users, I would start with a microservices architecture using load balancers and horizontal scaling. I''d implement caching layers with Redis, use CDNs for static content, and design the database with read replicas and sharding strategies. Monitoring and auto-scaling would be crucial components.', 'Excellent technical response demonstrating deep understanding of scalable architecture principles.', 0, 92, '{"situation": 9, "task": 10, "action": 9, "result": 8}', '{"clarity": 9, "confidence": 10, "engagement": 9}', '{"relevance": 10, "depth": 9, "examples": 8}', '{"enthusiasm": 9, "professionalism": 10}', '{"speaking_pace": 9, "filler_words": 9, "articulation": 10}', '["Consider mentioning specific cloud providers or tools", "Could elaborate more on monitoring strategies"]', 'https://example.com/audio/ans2.mp3', 52000, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

-- Answers for Microsoft Product Marketing Manager interview
('ans33333-3333-3333-3333-333333333333', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', 'q6q6q6q6-q6q6-q6q6-q6q6-q6q6q6q6q6q6', 'I would start by conducting market research to understand customer needs and competitive landscape. Then I''d work with the engineering team to define the value proposition and create a go-to-market strategy. This includes developing messaging, training the sales team, creating marketing materials, and coordinating a multi-channel launch campaign with PR, social media, and email marketing.', 'Comprehensive approach to product launch with good strategic thinking and cross-functional collaboration.', 0, 88, '{"situation": 9, "task": 9, "action": 9, "result": 8}', '{"clarity": 9, "confidence": 8, "engagement": 9}', '{"relevance": 9, "depth": 8, "examples": 8}', '{"enthusiasm": 9, "professionalism": 9}', '{"speaking_pace": 8, "filler_words": 8, "articulation": 9}', '["Consider mentioning specific metrics for measuring launch success", "Could add more detail about timeline and milestones"]', 'https://example.com/audio/ans3.mp3', 48000, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

-- Answers for JP Morgan Financial Analyst interview
('ans44444-4444-4444-4444-444444444444', 'c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'qaaaaaa-qaaa-qaaa-qaaa-qaaaaaaaaaa', 'I have extensive experience building financial models for valuation, budgeting, and forecasting. In my previous role, I created DCF models for M&A transactions worth over $500M. I''m proficient in advanced Excel functions, VBA, and have experience with Bloomberg Terminal and FactSet for market data analysis. I also built sensitivity analysis models to stress-test various scenarios.', 'Strong technical background with quantifiable achievements and relevant tools knowledge.', 0, 90, '{"situation": 9, "task": 9, "action": 9, "result": 10}', '{"clarity": 10, "confidence": 9, "engagement": 8}', '{"relevance": 10, "depth": 9, "examples": 9}', '{"enthusiasm": 8, "professionalism": 10}', '{"speaking_pace": 9, "filler_words": 9, "articulation": 10}', '["Excellent use of specific examples and quantifiable results", "Consider mentioning regulatory compliance experience"]', 'https://example.com/audio/ans4.mp3', 41000, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');