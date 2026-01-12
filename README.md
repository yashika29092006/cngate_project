#  CNGate: Find CNG without the headache

Ever been driving around with a low tank, wondering if the next CNG station actually has gas or if there's a mile-long line? That’s why I built **CNGate**. It’s a simple, smart way to check station status in real-time so you don't waste time driving to a closed pump.

---

## What can you do with it?

### For the everyday driver 
*   **Live Map:** No more guessing locations. Open the map, see the pins, and find the closest station.
*   **Know before you go:** See if they have gas (Available/Unavailable) and how busy it is (Low/High crowd) before you even leave your house.
*   **Real Feedback:** Read reviews from other drivers who were just there. If a station is out of gas, someone's probably already posted about it.

### For the Station Owners 
*   **Update your status:** One tap to let people know you're open or if you've run out of gas for the day.
*   **Manage your crowd:** Keep traffic moving by updating crowd levels.
*   **Professional Look:** Your dashboard is clean, fast, and stays synced with the map everyone else sees.

### For the Admins 
*   **Quality Control:** Approve new stations and keep the data clean.
*   **Support:** Answer user questions directly from the admin panel.

---

##  The Tech Behind It

I kept things modern and fast:
*   **Backend:** Python via **FastAPI** (it's super quick and reliable).
*   **Database:** **PostgreSQL** (hosted on Supabase) to keep all the station data and reviews safe.
*   **Maps:** **Leaflet.js** for the interactive map UI.
*   **Design:** Just pure **Vanilla CSS**. No bulky frameworks—just clean, custom-made styles with a "dark-mode" premium feel and smooth animations.

---

## How to get it running

### 1. The Backend (Python)
First, hop into the backend folder:
```bash
cd backend
```
Set up a virtual environment so you don't mess up your global Python settings:
```bash
python -m venv venv
venv\Scripts\activate
```
Install the stuff the app needs:
```bash
pip install -r requirements.txt
```
You'll need a `.env` file for your database link and keys. It should look something like this:
```env
DATABASE_URL=your_postgres_link_here
SECRET_KEY=something_random_and_secure
```
Once that's done, start the server:
```bash
uvicorn app.main:app --reload
```

### 2. The Frontend
You don't need to install anything! Just open `index.html` in your browser. (If you use VS Code, the **Live Server** extension works best to keep everything running smoothly).

---

##  A note on the design
I didn't want this to look like a boring database. I went with a **"High-end SaaS"** look:
*   Deep forest greens and emeralds (feels eco-friendly).
*   Outfit font (it's clean and easy on the eyes).

Enjoy using CNGate! 
