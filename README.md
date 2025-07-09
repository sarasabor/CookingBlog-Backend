# CookingBlog 🍽️ — Personalized Recipe Suggestions

CookingBlog is a full-featured, multilingual recipe web application that provides personalized cooking suggestions based on your **mood**, **available ingredients**, and **number of servings**. With a user-friendly interface, smart filtering, and intelligent logic grounded in real psychological and nutritional research, CookingBlog aims to improve your everyday cooking experience in both fun and functional ways.

---

## 🌟 Features

### 🎯 Core Functionalities

* **Mood-Based Suggestions**: Users can get recipes tailored to their psychological state (e.g., sad → comforting food).
* **Smart Ingredient Filter**: Suggests recipes based on ingredients users already have at home.
* **Multi-language Support**: Fully localized interface and recipe data in **English**, **French**, and **Arabic**.
* **Advanced Favorites Page**: Search, filter, and paginate through your saved recipes.
* **Rating System**: Users can leave reviews and rate recipes, which influences smart suggestions.
* **Admin Dashboard (Protected)**: Admins can add new recipes with multilingual fields and image uploads.

---

## 🧠 Scientific Foundation

The mood-based recommendations are inspired by studies in **Eating Psychology** and **Behavioral Nutrition**, particularly:

* *"The Influence of Emotional States on Food Choice"* by Macht (2008)
* *"Mood and Food Consumption"* – Journal of Health Psychology
* *"Comfort Food Preferences and Psychological Relief"* – Health Communication Journal

These studies show clear correlations between mood and food cravings (e.g., stressed people often crave carbs, anxious people need calming herbs like chamomile, etc.). CookingBlog uses this data to curate recipe types that align with user states.

---

## 🛠️ Technologies Used

### 🚀 Backend (Node.js + Express)

* **Node.js** + **Express.js** for server setup and RESTful APIs
* **MongoDB** + **Mongoose** for data storage and schema modeling
* **JWT** + **bcrypt** for authentication and authorization
* **Multer** + **Cloudinary** for image upload & storage
* **Custom middleware** for admin/user role verification

### 🌐 Frontend (React.js)

* **React.js** with **Hooks** for component logic
* **React Router DOM** for routing
* **Tailwind CSS** for responsive UI styling
* **i18next** for multilingual support
* **Axios** for API interaction
* **React Toastify** for notifications
* **Framer Motion** (optional) for animations

### 🧪 Tools & Dev Experience

* **Vite** for development speed
* **React DevTools** for debugging
* **ESLint + Prettier** for code consistency

---

## 🗂️ Folder Structure

```bash
cookingBlog/
├── backend/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   └── utils/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   └── i18n/
│   └── public/
```

---

## 🔐 Authentication & Roles

* **JWT-based login system** with hashed passwords (bcrypt)
* Role-based access (admin / user)
* Admins can access protected endpoints for recipe creation and modification

---

## 📸 Media Handling

* **Cloudinary** is used to host and manage uploaded recipe images
* All recipes support images with fallback placeholders

---

## 🌍 Internationalization (i18n)

* Fully translated UI and content in three languages
* Language switcher available on all pages
* Dynamic translation of moods, ingredients, and tags based on current language

---

## ✅ Future Enhancements (Planned)

* Voice-controlled interface for accessibility
* Smart shopping list generation based on saved recipes
* AI-powered mood detection via facial or textual analysis

---

## 🙏 Acknowledgements

This project was developed with deep care and attention to both user experience and scientific credibility. Every feature was designed to be meaningful, helpful, and inclusive. Special thanks to the open-source community and research institutions that inspired the data-driven logic behind this application.

---

## 📬 Contact

For questions, collaborations, or feedback:
**Email:** [saborsara.wad@gmail.com](saborsara.wad@gmail.com)

---

> "Cooking is not just about ingredients and recipes; it's about the mood, the people, and the story behind every meal."
