# Rate Repository App

A React Native mobile application for browsing and reviewing GitHub repositories, built with Expo, Apollo Client (GraphQL), React Router Native, Formik, and AsyncStorage for Full Stack Open Part 10.

## Features

- **Repository List**: Browse repositories with sorting (latest, highest rated, lowest rated), search filter with debounce, and infinite scrolling pagination.
- **Repository Details**: Individual repository view with statistics, link to GitHub, and user reviews list.
- **Authentication**: Sign in and sign up with Formik and Yup validation, storing JWT tokens in AsyncStorage.
- **Create Review**: Submit reviews for any GitHub repository.
- **My Reviews**: View current user's reviews with actions to open the repository or delete a review with confirmation.
- **Testing**: Automated unit and integration tests using Jest and React Native Testing Library.

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the Expo development server:
   ```bash
   npm start
   ```

3. Run tests:
   ```bash
   npm test
   ```

4. Run linter:
   ```bash
   npm run lint
   ```
