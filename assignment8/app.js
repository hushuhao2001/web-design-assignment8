const API_BASE = "https://691515a384e8bd126af891e4.mockapi.io";
const BOOKS_URL = API_BASE + "/books";

window.addEventListener("DOMContentLoaded", function () {
  const page = document.body.dataset.page;
  if (page === "index") {
    loadIndex();
  } else if (page === "detail") {
    loadDetail();
  } else if (page === "create") {
    initCreate();
  }
});

function loadIndex() {
  const listElement = document.getElementById("book-list");
  const messageElement = document.getElementById("list-message");
  messageElement.textContent = "Loading books...";
  fetch(BOOKS_URL)
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Failed to load data");
      }
      return response.json();
    })
    .then(function (data) {
      messageElement.textContent = "";
      listElement.innerHTML = "";
      if (!Array.isArray(data) || data.length === 0) {
        messageElement.textContent = "No books found.";
        return;
      }
      data.forEach(function (book, index) {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = "detail.html?id=" + book.id;
        link.textContent = book.title || "Untitled book";
        const meta = document.createElement("span");
        meta.textContent = book.author ? "by " + book.author : "";
        li.appendChild(link);
        li.appendChild(meta);
        listElement.appendChild(li);
      });
    })
    .catch(function () {
      messageElement.textContent = "Error loading books from API.";
    });
}

function loadDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const messageElement = document.getElementById("detail-message");
  const contentElement = document.getElementById("detail-content");

  if (!id) {
    messageElement.textContent = "No book id provided.";
    return;
  }

  messageElement.textContent = "Loading book...";
  fetch(BOOKS_URL + "/" + encodeURIComponent(id))
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Failed to load book");
      }
      return response.json();
    })
    .then(function (book) {
      messageElement.textContent = "";
      contentElement.innerHTML = "";

      addDetailRow(contentElement, "Title", book.title);
      addDetailRow(contentElement, "Author", book.author);
      addDetailRow(contentElement, "Publisher", book.publisher);
      addDetailRow(contentElement, "Year", book.year);
      addDetailRow(contentElement, "Pages", book.pages);
      addDetailRow(contentElement, "ID", book.id);
    })
    .catch(function () {
      messageElement.textContent = "Error loading book from API.";
    });
}

function addDetailRow(container, label, value) {
  const dt = document.createElement("dt");
  dt.textContent = label;
  const dd = document.createElement("dd");
  dd.textContent = value !== undefined && value !== null && value !== "" ? value : "-";
  container.appendChild(dt);
  container.appendChild(dd);
}

function initCreate() {
  const form = document.getElementById("create-form");
  const messageElement = document.getElementById("create-message");
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    clearErrors();
    messageElement.textContent = "";
    messageElement.className = "message";

    const title = document.getElementById("title").value.trim();
    const author = document.getElementById("author").value.trim();
    const publisher = document.getElementById("publisher").value.trim();
    const yearValue = document.getElementById("year").value.trim();
    const pagesValue = document.getElementById("pages").value.trim();

    let valid = true;
    const currentYear = new Date().getFullYear();

    if (!title) {
      showError("title-error", "Title is required.");
      valid = false;
    }
    if (!author) {
      showError("author-error", "Author is required.");
      valid = false;
    }
    if (!publisher) {
      showError("publisher-error", "Publisher is required.");
      valid = false;
    }

    const year = parseInt(yearValue, 10);
    if (!yearValue) {
      showError("year-error", "Year is required.");
      valid = false;
    } else if (isNaN(year) || year < 1800 || year > currentYear) {
      showError("year-error", "Enter a valid year between 1800 and " + currentYear + ".");
      valid = false;
    }

    const pages = parseInt(pagesValue, 10);
    if (!pagesValue) {
      showError("pages-error", "Pages is required.");
      valid = false;
    } else if (isNaN(pages) || pages <= 0) {
      showError("pages-error", "Pages must be a positive number.");
      valid = false;
    }

    if (!valid) {
      messageElement.textContent = "Please fix the errors above.";
      messageElement.classList.add("error");
      return;
    }

    const payload = {
      title: title,
      author: author,
      publisher: publisher,
      year: year,
      pages: pages
    };

    messageElement.textContent = "Submitting...";
    fetch(BOOKS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Failed to create book");
        }
        return response.json();
      })
      .then(function () {
        messageElement.textContent = "Book created successfully. Redirecting to homepage...";
        messageElement.classList.add("success");
        setTimeout(function () {
          window.location.href = "index.html";
        }, 1200);
      })
      .catch(function () {
        messageElement.textContent = "Error creating book via API.";
        messageElement.classList.add("error");
      });
  });
}

function showError(id, message) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = message;
  }
}

function clearErrors() {
  const ids = ["title-error", "author-error", "publisher-error", "year-error", "pages-error"];
  ids.forEach(function (id) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = "";
    }
  });
}
