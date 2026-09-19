# ExamSense AI Companion

Create a new project with Supabase enabled.

Build a production-quality responsive web/mobile-first education application called ExamSense.



PRODUCT OVERVIEW



ExamSense is an AI-powered personalized learning companion for college students.



The app helps students learn from their own:



- syllabus

- notes

- PDF documents

- textbooks

- previous-year question papers



The long-term product will provide:



- AI tutoring

- RAG-based answers from student documents

- question generation

- mock tests

- mistake explanation

- weak-topic detection

- personalized study plans

- progress analytics

- offline/on-device AI capabilities



IMPORTANT:

This phase is only for the application foundation and complete UI/UX.

Do NOT implement real AI, RAG, document processing, or external AI APIs yet.

Use realistic mock data and clearly structured service interfaces so these can be integrated in later phases.



PLATFORM



Build the application as:



- responsive web application

- mobile-first design

- optimized for Android phone screens

- future-ready for Capacitor packaging



The application must work well on:



- mobile

- tablet

- desktop



DESIGN STYLE



Create a modern premium education-product design.



Requirements:



- clean

- minimal

- professional

- futuristic but not overly flashy

- excellent readability

- smooth animations

- accessible contrast

- consistent spacing

- rounded cards

- subtle shadows

- clean typography

- responsive layouts



Avoid:



- excessive gradients

- excessive glassmorphism

- unnecessary decorative elements

- cluttered dashboards



Use a consistent design system for:



- buttons

- cards

- inputs

- tabs

- badges

- modals

- progress bars

- charts

- alerts



Use an elegant primary accent color and neutral supporting colors.

Do not hard-code styles inconsistently across pages.



APPLICATION STRUCTURE



Create the following main screens/routes.



1. Landing / Welcome Screen



Show:



- ExamSense logo

- tagline:

  "Your Personal AI Study Companion"

- short description:

  "Learn from your syllabus, notes and previous exam papers with personalized AI-powered study tools."

- Get Started button

- Sign In button



Create a clean educational hero section.



2. Authentication UI



Create screens for:



- Sign In

- Sign Up

- Forgot Password



Fields:



- Full Name

- Email

- Password

- Confirm Password



Include:



- validation states

- loading states

- error states

- success states



For now use mock authentication behavior.



3. Main Student Dashboard



Create a professional dashboard containing:



Header:



- student profile avatar

- greeting such as "Good morning, Alex"

- notification icon

- settings icon



Overview cards:



- Study Streak

- Today's Progress

- Topics Mastered

- Weak Topics



Today's Study section:



- today's recommended tasks

- task completion indicators

- estimated study time



Subjects section:



- list of enrolled subjects

- progress percentage

- subject status



Quick Actions:



- Ask AI Tutor

- Upload Notes

- Analyze Previous Papers

- Start Mock Test

- Generate Questions

- View Study Plan



AI Status card:



- AI Assistant status

- Offline AI status placeholder

- "On-device AI" label

  This is only a UI placeholder for future implementation.



4. My Subjects



Display all subjects as cards.



Each subject should show:



- subject name

- code

- overall progress

- number of topics

- completed topics

- weak topics count

- last studied time



Provide:



- Add Subject

- Edit Subject

- Delete Subject

- Open Subject



5. Subject Details



When a subject is opened, show:



Subject header:



- Subject name

- subject code

- overall progress



Tabs:



- Overview

- Syllabus

- Notes

- Previous Papers

- Practice

- Analytics



Overview should display:



- completion percentage

- strongest topic

- weakest topic

- recent activity

- recommended next topic



6. Syllabus Manager



Allow students to define:



- subject

- unit

- chapter

- topic

- subtopic



Example:



Subject: Power Electronics



Unit I:



- Power semiconductor devices

- Diodes

- SCR

- TRIAC



Unit II:



- Controlled rectifiers

- etc.



Create UI for:



- Add Unit

- Add Topic

- Edit Topic

- Mark Topic Completed

- Mark Topic For Review



Show topic priority:



- High

- Medium

- Low



7. Notes & Documents



Create a document-management page.



Sections:



- Uploaded Notes

- PDFs

- Study Materials

- Processed Documents



Document card should show:



- filename

- document type

- subject

- upload date

- status

- page count

- processing status



Buttons:



- Upload

- View

- Delete

- Reprocess



Use mock document data for now.



8. Previous Year Papers



Create a dedicated previous-paper management page.



Each paper card:



- subject

- university/exam

- academic year

- semester

- uploaded date

- analysis status



Buttons:



- Upload Paper

- View

- Analyze



Create placeholder UI for future analysis results.



9. AI Tutor



Create a polished chat interface.



Features in UI:



- conversation area

- user messages

- AI messages

- typing indicator

- message input

- send button

- attachment button

- clear chat



Add selectable modes:



- Simple Explanation

- Exam Answer

- Deep Explanation



Add source panel placeholder:

"Sources from your study materials"



Include:



- confidence indicator placeholder

- cited document placeholder



IMPORTANT:

Do not connect a real AI model in this phase.



10. Question Generator



Create a UI where the student selects:



- Subject

- Unit

- Topic

- Difficulty

- Number of questions

- Question type



Question types:



- MCQ

- Short Answer

- Long Answer

- Application Based



Button:

"Generate Questions"



Show generated-question placeholder cards.



11. Mock Test



Create:



- test setup screen

- question screen

- answer selection

- question navigation

- timer

- progress indicator

- submit test



Result screen should show:



- score

- percentage

- correct answers

- incorrect answers

- unanswered

- topic performance



Use mock questions.



12. Mistake Explainer



Create UI for displaying:



Question

Student Answer

Correct Answer

Why Your Answer Was Wrong

Concept To Review

Recommended Practice



This will be connected to AI later.



13. Study Planner



Create a calendar/task-based study planner.



Display:



- today's tasks

- weekly schedule

- recommended topics

- estimated study time

- completion status



Create:



- Add Task

- Edit Task

- Complete Task



Include placeholder AI-generated recommendation section.



14. Progress Analytics



Create analytics dashboard.



Show:



- overall score

- study time

- streak

- topic mastery

- subject progress

- test performance

- weak-topic trends



Use charts and progress visuals with mock data.



15. Weak Topics



Create a dedicated Weak Topics screen.



Each weak topic should display:



- topic name

- subject

- mastery percentage

- previous score

- recommended revision time

- priority



Priority levels:



- Critical

- High

- Medium



Provide:

"Start Revision"



16. Settings



Create settings for:



- profile

- notification preferences

- study preferences

- AI preferences

- offline AI placeholder

- data management

- theme

- language



Set application language to:

English



NAVIGATION



Create a mobile-friendly bottom navigation with:



- Home

- Subjects

- AI Tutor

- Practice

- Profile



For desktop, use a sidebar navigation.



Sidebar sections:



Dashboard

Subjects

Syllabus

Notes

Previous Papers

AI Tutor

Question Generator

Mock Tests

Study Planner

Weak Topics

Analytics

Settings



COMPONENT ARCHITECTURE



Use reusable components for:



- cards

- buttons

- modals

- forms

- tabs

- progress indicators

- charts

- chat messages

- document cards

- question cards

- subject cards



Do not duplicate UI code unnecessarily.



DATA ARCHITECTURE



Create clean mock data models/interfaces for:



Student

Subject

Unit

Topic

Document

QuestionPaper

Question

Test

TestResult

StudyTask

WeakTopic

ChatMessage

ProgressRecord



Structure the application so backend/database integration can be added later without rewriting the UI.



IMPORTANT TECHNICAL REQUIREMENTS



- Keep the application responsive.

- Avoid broken routes.

- Add loading states.

- Add empty states.

- Add error states.

- Add confirmation dialogs for destructive actions.

- Use realistic sample data.

- Keep all UI text in English.

- Make the app visually consistent.

- Use accessible form labels and buttons.

- Do not implement fake AI claims.

- Do not call external AI APIs in this phase.



FINAL RESULT



At the end of Phase 1, the application should look like a complete polished education product with all major screens and navigation working using mock data.



The next phases will add:



1. authentication backend

2. database

3. document processing

4. RAG

5. AI Tutor

6. question generation

7. mock test intelligence

8. weakness detection

9. personalized study planning

10. offline/on-device AI

11. iQOO/NPU integration

Upgrade the existing ExamSense application by adding real backend authentication and database integration using Supabase.



Do NOT redesign the existing UI.

Preserve the current design system and navigation.



AUTHENTICATION



Implement Supabase Authentication with:



- Email/password sign up

- Email/password sign in

- Sign out

- Forgot password

- Password reset



Create proper:



- loading states

- validation

- authentication errors

- success messages



USER PROFILE



Create a profile table connected to the authenticated user.



Store:



- user_id

- full_name

- email

- college

- course

- year

- semester

- preferred study duration

- created_at

- updated_at



DATABASE TABLES



Create Supabase tables for:



students

subjects

units

topics

documents

question_papers

questions

tests

test_results

study_tasks

weak_topics

progress_records

chat_sessions

chat_messages



Use proper foreign keys and relationships.



SECURITY



Implement Row Level Security.



Students must only be able to access their own:



- profile

- subjects

- syllabus

- documents

- tests

- results

- study plans

- analytics

- chat history



REAL DATA FLOW



Replace mock student profile data with Supabase data.



Replace mock subjects with database-driven subjects.



Replace mock syllabus with database-driven data.



Preserve all existing UI and routes.



FINAL RESULT



The user should be able to:



1. create an account

2. sign in

3. create their profile

4. create subjects

5. manage syllabus

6. securely access their data



Do not implement AI yet

Implement all the above features with your full effort and potential and make the more proffesional

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://studywise-ai-pal.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9200898c-0712-4be4-b051-55480e9b5340).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
