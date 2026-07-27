# Airads

The official digital platform for Airads College. It brings together the
college website, campuses, admissions, Virtual Campus, and online learning in
one Django and React application.

## Highlights

- Public college, campus, school, news, and admissions pages
- Online applications and applicant onboarding
- Virtual Campus course discovery and enrollment
- Course creation, learning, assessments, and certificates
- Student, instructor, and administrator dashboards
- Payments, reports, inquiries, reviews, and notifications

## Requirements

- Python 3.10+
- Node.js 20+
- PostgreSQL for production, or SQLite for local development

## Installation

```bash
git clone git@github.com:Airads-College/airads.git
cd airads

python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
npm install

cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
```

Update `.env` with the database, email, host, and payment settings required by
your environment.

## Development

Run Django and Vite in separate terminals:

```bash
source .venv/bin/activate
python manage.py runserver
```

```bash
npm run dev
```

Open `http://localhost:8000`.

## Checks

```bash
source .venv/bin/activate
python manage.py check
python -m pytest -q
npm test
npm run build
```
