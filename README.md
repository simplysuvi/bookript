## Bookript
**Search. Read. Repeat.**

Bookript is a powerful and intuitive book search engine that allows users to find and explore a vast library of books. With a clean, modern interface, it provides a seamless experience for discovering new titles, authors, and topics.

### Features

- **Instant search:** Find books by title, author, or topic with real-time search suggestions.
- **Detailed book information:** Get comprehensive details for each book, including title, author(s), publication date, page count, and description.
- **Download links:** Access download links for selected books.
- **Responsive design:** Enjoy a seamless experience on any device, from desktops to mobile phones.
- **Light & dark mode:** Switch between light and dark themes for comfortable reading.

### Technologies used

#### Frontend

- **HTML5, CSS3, JavaScript (ES6+):** Core web technologies for building the user interface.
- **Google Books API:** Used to fetch book information and cover images.
- **Cheerio:** To scrape the download links from the source.

#### Backend

- **Node.js & Express:** For creating the serverless backend API.
- **Netlify Functions:** To host the serverless API for fetching download links.
- **Axios:** For making HTTP requests to external services.

#### Development and deployment

- **Netlify:** For continuous deployment and hosting of the entire application.
- **Nodemon:** For automatic server restarts during local development.

### Getting started

To get a local copy up and running, follow these simple steps.

#### Prerequisites

- **Node.js:** Make sure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
- **Netlify CLI:** Install the Netlify CLI to run the project locally and deploy it.
  ```sh
  npm install -g netlify-cli
  ```

#### Installation and setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-username/bookript.git
   cd bookript
   ```

2. **Install NPM packages:**
   ```sh
   npm install
   ```

3. **Run the development server:**
   ```sh
   npm run dev
   ```
   This will start the application on a local server, typically at `http://localhost:8888`.
