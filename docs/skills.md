# Oryonix Agent Skills Directory

This document defines the specialized workflows and "skills" the Oryonix AI agent can perform autonomously. Each skill outlines the trigger conditions, the sequence of actions, and the expected outcome. This serves as the blueprint for extending the agent's capabilities beyond general browsing.

---

## 1. Educational Platforms (Coursera, Udemy, etc.)

**Objective**: Automate the process of progressing through course material and completing assignments on behalf of the user.

**Trigger**: User commands `Complete my Coursera module on [Topic]` or `Finish the pending assignments for [Course]`.

**Workflow**:

1. **Navigation**: Navigate to the course dashboard and identify the next incomplete item (video, reading, or quiz).
2. **Video Lectures**:
   - Click to start the video.
   - Automatically extract the transcript to synthesize summary notes.
   - Wait for the video to complete or mark it as done if the platform allows it.
3. **Quizzes and Assignments**:
   - Parse the DOM to extract the quiz questions and available options/input fields.
   - Use the LLM's reasoning engine (incorporating the course transcript context) to determine the correct answers.
   - Automate the clicking/typing to fill out the assignment.
   - Click "Submit".
4. **Verification**: Confirm the assignment was submitted successfully and proceed to the next module.

---

## 2. Professional Networking (LinkedIn)

**Objective**: Automate targeted networking outreach, profile engagement, and lead generation.

**Trigger**: User commands `Connect with [Job Title]s in [Location]` or `Endorse my recent connections for [Skill]`.

**Workflow (Outreach)**:

1. **Search**: Navigate to LinkedIn Search and apply filters for the target Job Title and Location.
2. **Iteration**: Parse the search results list.
3. **Engagement**: For each profile in the list:
   - Click "Connect".
   - If a note is allowed, generate a highly personalized connection request based on the user's bio and the target's recent activity/experience.
   - Click "Send".
4. **Pagination**: Automatically click "Next Page" when the current list is exhausted.
5. **Rate Limiting**: Implement random delays between actions to mimic human behavior and avoid triggering anti-bot protections.

---

## 3. [Template for Future Skills]

**Objective**: [What this skill achieves]

**Trigger**: [The user prompt that activates this workflow]

**Workflow**:

1. Step 1
2. Step 2
3. Step 3
