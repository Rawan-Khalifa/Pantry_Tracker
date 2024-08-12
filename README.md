# Pantry Tracker

Welcome to **Pantry Tracker**, a web application designed to help you keep track of the items in your pantry effortlessly. With this tool, you can easily manage your pantry inventory, add or remove items, and stay organized. The application is built using modern web technologies, including **Next.js**, **Firebase**, and **Material UI**, and is deployed on **Vercel**.

### Click [HERE](https://pantry-tracker-l1drxnbik-rawan-khalifas-projects.vercel.app/) to try it out!

## Features

- **Item Count:** Keep track of the quantity of each item in your pantry.
- **Add/Remove Items:** Easily add new items to your pantry or remove items you no longer need.
- **User Authentication:** Secure sign-up and sign-in pages for personalized user experience.
- **Responsive Design:** A clean and responsive interface built with Material UI to ensure a smooth user experience on any device.

## Technologies Used

- **Next.js:** A powerful React framework for building fast and user-friendly web applications.
- **Firebase:** Used for authentication and real-time database to manage user data securely.
- **Material UI:** A popular React UI framework for creating a visually appealing and responsive design.
- **Vercel:** Deployed using Vercel for seamless and efficient hosting.

## Getting Started

### Prerequisites

To run this project locally, you'll need to have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Rawan-Khalifa/Pantry_Tracker.git
   cd Pantry_Tracker

2. **Install Dependencies:**

   ```bash
   npm install

3. **Set Up Firebase:**

- Create a new Firebase project in the Firebase Console.
- Enable authentication (Email/Password) and Firestore in your Firebase project.
- Copy your Firebase config and replace the Firebase configuration in the project.
- Update the Firebase configuration in the .env.local file:

   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

4. **Run the development server:**
   
   ```bash
   npm run dev
   
Now you can Open http://localhost:3000 with your browser to see the result.

### Deployment

The project is deployed on Vercel. If you want to deploy your own version:

- Create a Vercel account at vercel.com.
- Import the project from your GitHub repository.
- Set up the environment variables for Firebase in Vercel.
- Deploy the project.

### Future Improvements

- Currently Fine-Tuning a BERT model to classify Food into categories based on this [dataset](https://www.kaggle.com/datasets/kkhandekar/calories-in-food-items-per-100-grams) from Kaggle.
- Adding an expiration date feature to send a warning to consume items and automatically remove expired items.
- Adding a grocery list besides the pantry list and the ability to move items in the grocery list to the pantry.




