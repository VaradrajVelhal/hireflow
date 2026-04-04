def calculate_match_score(job_desc, user_skills):
    job_words = set(job_desc.lower().split())
    skill_words = set(user_skills.lower().split())

    if not skill_words:
        return 0

    match = job_words.intersection(skill_words)

    score = (len(match) / len(skill_words)) * 100

    return round(score, 2)