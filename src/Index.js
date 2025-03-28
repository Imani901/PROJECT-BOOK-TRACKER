document.addEventListener("DOMContentLoaded", () => {
    const bookForm = document.getElementById("book-form");
    const bookList = document.getElementById("book-list");
    const titleInput = document.getElementById("title");
    const authorInput = document.getElementById("author");
    const rateInput = document.getElementById("rating");
    const commentInput = document.getElementById("comment");
    const recommendationsList = document.getElementById("recommendations-list");
    const submitButton = bookForm.querySelector("button[type='submit']");
    let books = [];

    function renderBooks() {
        bookList.innerHTML = "";
        books.forEach((book, index) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>${book.rating ? book.rating + ' ★' : 'Not rated'}</td>
                <td>${book.comment || 'No comments'}</td>
                <td>
                    <button class="edit" data-index="${index}">Edit</button>
                    <button class="delete" data-index="${index}">Delete</button>
                </td>
            `;
            bookList.appendChild(tr);
        });
    }

    bookForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const title = titleInput.value; 
        const author = authorInput.value; 
        const rating = rateInput.value;
        const comment = commentInput.value;

        const newBook = { title, author, rating, comment };
        books.push(newBook);
        renderBooks();
        await fetchRecommendations(author, title); // Fetch recommendations after adding a book
        bookForm.reset();
    });

    bookList.addEventListener("click", (e) => {
        const index = e.target.getAttribute("data-index");
        if (e.target.classList.contains("delete")) {
            deleteBook(index);
        } else if (e.target.classList.contains("edit")) {
            editBook(index);
        } 
    });

    const deleteBook = (index) => {
        books.splice(index, 1);
        renderBooks();
    };

    const editBook = (index) => {
        const newTitle = prompt("Enter new title:", books[index].title);
        const newAuthor = prompt("Enter new author:", books[index].author);
        const newRating = prompt("Enter new rating:", books[index].rating);
        const newComment = prompt("Add a new comment:", books[index].comment);
        if (newTitle && newAuthor && newRating && newComment) {
            books[index] = { ...books[index], title: newTitle, author: newAuthor, rating: newRating, comment: newComment };
            renderBooks();
            fetchRecommendations(newAuthor, newTitle); // Fetch recommendations after editing a book
        }
    };

    const fetchRecommendations = async (author, currentBookTitle) => {
        try {
            const response = await fetch(`https://openlibrary.org/search.json?author=${encodeURIComponent(author)}&limit=5`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            // Map the data to get the relevant book information
            const recommendedBooks = data.docs
                .filter(book => book.title !== currentBookTitle) // Exclude the current book
                .map(book => ({
                    title: book.title,
                    author: book.author_name ? book.author_name.join(', ') : 'Unknown Author',
                    cover: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : 'No cover available'
                }));

            displayRecommendations(recommendedBooks);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        }
    };

    const displayRecommendations = (books) => {
        recommendationsList.innerHTML = ""; // Clear previous recommendations
        books.forEach(book => {
            const li = document.createElement("li");
            li.innerHTML = `
                <strong>${book.title}</strong> by ${book.author}
                <img src="${book.cover}" alt="${book.title} cover" style="width:50px; height:auto;">
            `;
            recommendationsList.appendChild(li);
        });
    };

    titleInput.addEventListener("input", checkInputFields);
    authorInput.addEventListener("input", checkInputFields);

    function checkInputFields() {
        const title = titleInput.value.trim();
        const author = authorInput.value.trim();
        
        submitButton.disabled = !(title && author);
    }
});