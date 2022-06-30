const messagesContainer = document.querySelector("#messages-container");
const channelForm = document.querySelector("#channel-form");
const channelFormInput = document.querySelector("#channel-form input");
const channelNameText = document.querySelector("#channel-name-text");
const toggleModeButton = document.querySelector(".btn-toggle-mode");

toggleModeButton.addEventListener("click", () => {
  if (!document.body.classList.contains("dark")) {
    document.body.style.background = "#000";
    document.body.style.color = "#fff";
    channelFormInput.style.color = "#fff";
    toggleModeButton.innerHTML = `<i class="bi bi-brightness-high-fill"></i>`;
    document.body.classList.add("dark");
  } else {
    document.body.style.background = "#fff";
    document.body.style.color = "#000";
    channelFormInput.style.color = "#000";
    toggleModeButton.innerHTML = `<i class="bi bi-moon-fill"></i>`;
    document.body.classList.remove("dark");
  }
});

channelForm.addEventListener("submit", (event) => {
  event.preventDefault();
  messagesContainer.innerHTML = "";
  const formData = new FormData(channelForm);
  const channel = formData.get("channel-name").toLocaleLowerCase();
  if (!channel) return;
  const client = new tmi.Client({
    channels: [channel],
  });
  client.connect();
  channelNameText.innerHTML = `<i class="bi bi-tv-fill"></i>:<span id="view-channel-name">${channel}</span>`;
  channelForm.reset();

  client.on("message", (channel, tags, message, self) => {
    if (self) return;
    const messageElement = document.createElement("li");
    messageElement.classList.add("message");
    const messageContent = {
      name: tags["display-name"],
      message,
    };
    messageElement.innerHTML = `<span id="chat-name">${messageContent.name}</span> ${messageContent.message}`;
    const chatName = messageElement.querySelector("#chat-name");
    if (tags.color) {
      chatName.style.color = tags.color;
      chatName.style.fontWeight = "bold";
    } else {
      chatName.style.color = "#7744d5";
      chatName.style.fontWeight = "bold";
    }
    if (message.startsWith("@")) {
      let [mention, ...args] = message.split(" ");
      messageElement.innerHTML = `<span id="chat-name">${messageContent.name}</span> <span class="purple">${mention}</span> ${args}`;
    }
    if (message.startsWith("http") || message.startsWith("https")) {
      const [link, ...args] = message.split("/^[^s]+/");
      messageElement.innerHTML = `<span id="chat-name">${messageContent.name}</span> <a href="${link}" class="purple">${link}</a>`;
    }
    if (
      messageContent.name == "Nightbot" ||
      messageContent.name == "Streamlabs"
    ) {
      messageElement.innerHTML = `<i class="bi bi-robot"></i> <span id="chat-name">${messageContent.name}</span>: ${messageContent.message}`;
      messageElement.style.border = "2px solid #f00";
    }
    if (
      tags.badges &&
      tags.badges.subscriber &&
      messageContent.name !== "Nightbot"
    ) {
      messageElement.innerHTML = `<i class="bi bi-twitch purple fs-3"></i> <span id="chat-name">${messageContent.name}</span>: ${messageContent.message}`;
    }
    if (tags.badges && tags.badges.broadcaster) {
      messageElement.innerHTML = `<i class="bi bi-camera-video-fill red"></i> <span id="chat-name">${messageContent.name}</span>: ${messageContent.message}`;
      messageElement.style.border = "2px solid #f00";
    }
    messagesContainer.appendChild(messageElement);
    messageElement.scrollIntoView();

    client.on(
      "subscription",
      (channel, username, method, message, userstate) => {
        const subMessage = document.createElement("li");
        subMessage.classList.add("message");
        subMessage.innerHTML = `<i class="bi bi-star-fill fs-3"></i> <span id="chat-name">${username}</span> se ha suscrito`;
        messagesContainer.appendChild(subMessage);
        subMessage.scrollIntoView();
      }
    );
    // TODO: Implemnt rest of events
    // TODO: Render emotes in chat
  });
});
