function createElemWithText(
  elementType = "p",
  textContent = "",
  className = "",
) {
  const element = document.createElement(elementType);
  element.textContent = textContent;

  if (className) element.setAttribute("class", className);
  return element;
}

function createSelectOptions(users) {
  if (!users) {
    return undefined;
  }
  const options = [];
  users.forEach((user) => {
    let option = document.createElement("option");
    option.value = user.id;
    option.textContent = user.name;
    options.push(option);
  });
  return options;
}

function toggleCommentSection(postId) {
  if (!postId) {
    return undefined;
  }
  const section = document.querySelector(`section[data-post-id="${postId}"]`);

  if (section) {
    section.classList.toggle("hide");
  }
  return section;
}

function toggleCommentButton(postId) {
  if (!postId) {
    return undefined;
  }
  const button = document.querySelector(`button[data-post-id="${postId}"]`);
  if (button) {
    button.textContent =
      button.textContent === "Show Comments"
        ? "Hide Comments"
        : "Show Comments";
  }
  return button;
}

function deleteChildElements(parentElement) {
  if (!(parentElement instanceof HTMLElement)) {
    return undefined;
  }
  let child = parentElement.lastElementChild;
  while (child) {
    parentElement.removeChild(child);
    child = parentElement.lastElementChild;
  }
  return parentElement;
}
function addButtonListeners() {
  const buttons = document.querySelectorAll("main button");

  buttons.forEach((button) => {
    if (button.dataset.postId) {
      button.addEventListener("click", (event) => {
        toggleComments(event, button.dataset.postId);
      });
    }
  });

  return buttons;
}
function removeButtonListeners() {
  const buttons = document.querySelectorAll("main button");

  buttons.forEach((button) => {
    if (button.dataset.postId) {
      button.removeEventListener("click", (event) => {
        toggleComments(event, button.dataset.postId);
      });
    }
  });

  return buttons;
}
function createComments(commentsData) {
  if (!commentsData) {
    return undefined;
  }
  let fragment = document.createDocumentFragment();

  commentsData.forEach((comment) => {
    let article = document.createElement("article");

    let h3 = createElemWithText("h3", comment.name);

    let pBody = createElemWithText("p", comment.body);

    let pEmail = createElemWithText("p", `From: ${comment.email}`);

    article.appendChild(h3);
    article.appendChild(pBody);
    article.appendChild(pEmail);

    fragment.appendChild(article);
  });
  return fragment;
}
function populateSelectMenu(usersData) {
  if (!usersData) {
    return undefined;
  }
  let selectMenu = document.getElementById("selectMenu");
  let options = createSelectOptions(usersData);

  options.forEach((option) => {
    selectMenu.appendChild(option);
  });
  return selectMenu;
}

// Async functions API https://jsonplaceholder.typicode.com/
async function getUsers() {
  try {
    let response = await fetch("https://jsonplaceholder.typicode.com/users");
    let users = await response.json();

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}
async function getUserPosts(userId) {
  if (!userId) {
    return undefined;
  }
  try {
    let response = await fetch(
      `https://jsonplaceholder.typicode.com/posts?userId=${userId}`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch the posts");
    }
    let posts = await response.json();

    return posts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}
async function getUser(userId) {
  if (!userId) {
    return undefined;
  }
  try {
    let response = await fetch(
      `https://jsonplaceholder.typicode.com/users/${userId}`,
    );
    let user = await response.json();

    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
  }
}
async function getPostComments(postId) {
  if (!postId) {
    return undefined;
  }
  try {
    let response = await fetch(
      `https://jsonplaceholder.typicode.com/posts/${postId}/comments`,
    );
    let comments = await response.json();

    return comments;
  } catch (error) {
    console.error("Error fetching comments:", error);
  }
}
async function displayComments(postId) {
  if (!postId) {
    return undefined;
  }
  let section = document.createElement("section");

  section.dataset.postId = postId;

  section.classList.add("comments", "hide");

  let comments = await getPostComments(postId);
  let fragment = createComments(comments);

  section.appendChild(fragment);

  return section;
}
async function createPosts(posts) {
  if (!posts) {
    return undefined;
  }
  let fragment = document.createDocumentFragment();

  for (const post of posts) {
    const article = document.createElement("article");

    const title = createElemWithText("h2", post.title);
    const body = createElemWithText("p", post.body);
    const pId = createElemWithText("p", `Post ID: ${post.id}`);
    const author = await getUser(post.userId);
    const authorInfo = createElemWithText(
      "p",
      `Author: ${author.name} with ${author.company.name}`,
    );
    let cCatchphrase = createElemWithText("p", `${author.company.catchPhrase}`);

    const button = document.createElement("button");
    button.textContent = "Show Comments";
    button.dataset.postId = post.id;

    article.appendChild(title);
    article.appendChild(body);
    article.appendChild(pId);
    article.appendChild(authorInfo);
    article.appendChild(cCatchphrase);
    article.appendChild(button);

    const section = await displayComments(post.id);
    article.appendChild(section);

    fragment.appendChild(article);
  }
  return fragment;
}
async function displayPosts(posts) {
  let main = document.querySelector("main");
  let element =
    posts && posts.length > 0
      ? await createPosts(posts)
      : createElemWithText(
          "p",
          "Select an Employee to display their posts.",
          "default-text",
        );

  main.append(element);

  return element;
}

// "Procedurl functions"
function toggleComments(event, postId) {
  if (!event || !postId) {
    return undefined;
  }

  let result = [];
  event.target.listener = true;
  result.push(toggleCommentSection(postId));
  result.push(toggleCommentButton(postId));
  return result;
}
async function refreshPosts(posts) {
  if (!posts) {
    return undefined;
  }
  let removeButtons = removeButtonListeners();

  let main = document.querySelector("main");
  let updateMain = deleteChildElements(main);

  let fragment = await displayPosts(posts);
  let addButtons = addButtonListeners();

  return [removeButtons, updateMain, fragment, addButtons];
}
async function selectMenuChangeEventHandler(e) {
  if (!e) {
    return undefined;
  }
  document.getElementById("selectMenu").disabled = true;
  let userId = e?.target?.value || 1;
  let posts = await getUserPosts(userId);
  let refreshPostsArray = await refreshPosts(posts);
  document.getElementById("selectMenu").disabled = false;

  return [userId, posts, refreshPostsArray];
}
async function initPage() {
  let users = await getUsers();
  let select = populateSelectMenu(users);

  return [users, select];
}
function initApp() {
  initPage().then(([users, select]) => {
    let selectMenu = document.getElementById("selectMenu");

    selectMenu.addEventListener("change", selectMenuChangeEventHandler, false);
  });
}

document.addEventListener("DOMContentLoaded", initApp, false);
