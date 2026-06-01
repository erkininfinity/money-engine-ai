# Заявка на OpenAI Codex for OSS (Application Strategy)

Этот документ содержит готовые ответы и стратегию подачи заявки в программу **OpenAI Codex for OSS** для получения грантовых ИИ-кредитов на развитие проекта Money Engine AI.

---

## 📌 Когда подавать заявку?

Не подавайте заявку сразу после создания репозитория. Подавайте её, когда:
1. Выполнены коммиты в репозитории, и есть первая рабочая версия (релиз `v0.1.0` или `v0.2.0`).
2. Опубликован подробный `README.md` с описанием и скриншотами.
3. Описаны файлы лицензии, кодекса поведения и политики безопасности.
4. Добавлен хотя бы один публичный отчет о догфудинге (dogfooding report) в папку `examples/` или `docs/`.

---

## 📝 Вопросы и Ответы (Application Draft)

### 1. What is your role in the project? (Роль в проекте)
> I am the primary maintainer, creator, and lead developer of Money Engine AI. I manage the repository, write the core engine, design the frontend/backend architecture, coordinate security reports, and review community-contributed revenue playbooks.

### 2. Why does this repository qualify for the Codex for OSS program? (Почему проект подходит для программы)
> Money Engine AI is a self-hosted, local-first open-source application designed to help solo-founders, freelancers, and small businesses validate B2B offers and run 7-day revenue sprints. Unlike closed SaaS tools, we are entirely open-source (Apache 2.0) and privacy-focused, letting users run LLM processes locally or via their own OpenAI keys. 
> 
> We qualify because we are building a structured, machine-readable playbook ecosystem (YAML schemas) where the community can contribute open playbooks. OpenAI credits will help us run automated playbook validation tests, test LLM prompt outputs for compliance with our anti-spam/ethical guidelines, and power the local application for open-source users who want a developer-friendly out-of-the-box experience.

### 3. How will the API credits be used? (Как будут использоваться ИИ-кредиты)
> We will use the credits for OSS developer and maintainer workflows:
> 1. **Structured Output Validation:** Testing and evaluating our Zod-based JSON schema prompts (Revenue Path Generator, Offer Builder, 7-day Sprint Generator, and Weekly Review).
> 2. **Ethics & Compliance Evals:** Running automated regression test cases (evals) to ensure the AI outreach message generator adheres to our strict anti-spam guidelines and does not generate deceptive/false income claims.
> 3. **PR & Playbook Testing:** Validating user-contributed YAML playbooks against simulated founder profiles to ensure they generate actionable and realistic sprint tasks before they are merged into the main registry.
> 4. **Issue & Docs Automation:** Utilizing AI to help triage community issues, categorize bugs/features, and translate markdown documentation between English and Russian.

### 4. Is there anything else you'd like to share? (Дополнительная информация)
> We are actively dogfooding this project. All development is done in public, and we publish detailed "Dogfooding Reports" showing our own revenue experiments using the tool (both successful and failed sprints). We aim to build a highly transparent, ethical, and structured alternative to vague "AI business coaches" by providing concrete action checklists and metric-driven feedback loops.
