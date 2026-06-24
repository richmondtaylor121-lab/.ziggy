# .ziggy Agent System

This folder serves as the central directory for the **.ziggy** AI agent system, managing its skills, configuration, and memory.

## Subfolders
- **`skills/`**: Contains markdown files defining individual specialized skills (system prompts).
- **`config/`**: Holds configuration registries, including the list of active skills.
- **`memory/`**: Stores dynamic execution history and session context.

## Adding a New Skill
1. **Write the prompt**: Draft a system prompt defining the skill's role and rules.
2. **Save the file**: Save it as a `.md` file inside the `skills/` folder.
3. **Register it**: Add an entry for the skill in `config/skills.json`.

## Running a Skill in Antigravity
To execute a skill, load the contents of its `.md` file directly into your Antigravity agent's system prompt field.
