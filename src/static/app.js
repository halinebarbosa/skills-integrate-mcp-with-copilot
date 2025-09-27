
document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      activitiesList.innerHTML = "";

      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Formulário individual para cada atividade
        const signupForm = document.createElement("form");
        signupForm.className = "signup-form";
        signupForm.innerHTML = `
          <div class="form-group">
            <label for="email-${name}">Email do aluno:</label>
            <input type="email" id="email-${name}" name="email" required placeholder="your-email@mergington.edu" />
          </div>
          <button type="submit">Registrar aluno</button>
        `;

        signupForm.addEventListener("submit", async (event) => {
          event.preventDefault();
          const email = signupForm.querySelector("input[name='email']").value;
          try {
            const response = await fetch(
              `/activities/${encodeURIComponent(name)}/signup?email=${encodeURIComponent(email)}`,
              { method: "POST" }
            );
            const result = await response.json();
            if (response.ok) {
              messageDiv.textContent = result.message;
              messageDiv.className = "success";
              signupForm.reset();
              fetchActivities();
            } else {
              messageDiv.textContent = result.detail || "Ocorreu um erro";
              messageDiv.className = "error";
            }
            messageDiv.classList.remove("hidden");
            setTimeout(() => {
              messageDiv.classList.add("hidden");
            }, 5000);
          } catch (error) {
            messageDiv.textContent = "Falha ao registrar. Tente novamente.";
            messageDiv.className = "error";
            messageDiv.classList.remove("hidden");
            console.error("Erro ao registrar:", error);
          }
        });

        // Participantes
        const participantsHTML =
          details.participants.length > 0
            ? `<div class="participants-section">
                <h5>Participantes:</h5>
                <ul class="participants-list">
                  ${details.participants
                    .map(
                      (email) =>
                        `<li><span class="participant-email">${email}</span><button class="delete-btn" data-activity="${name}" data-email="${email}">❌</button></li>`
                    )
                    .join("")}
                </ul>
              </div>`
            : `<p><em>Nenhum participante ainda</em></p>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Horário:</strong> ${details.schedule}</p>
          <p><strong>Vagas disponíveis:</strong> ${spotsLeft}</p>
          <div class="participants-container">
            ${participantsHTML}
          </div>
        `;

        activityCard.appendChild(signupForm);
        activitiesList.appendChild(activityCard);
      });

      // Adiciona eventos aos botões de remover participante
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleUnregister);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Falha ao carregar atividades. Tente novamente mais tarde.</p>";
      console.error("Erro ao buscar atividades:", error);
    }
  }

  // Função para remover participante
  async function handleUnregister(event) {
    const button = event.target;
    const activity = button.getAttribute("data-activity");
    const email = button.getAttribute("data-email");
    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`,
        { method: "DELETE" }
      );
      const result = await response.json();
      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "Ocorreu um erro";
        messageDiv.className = "error";
      }
      messageDiv.classList.remove("hidden");
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Falha ao remover. Tente novamente.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Erro ao remover:", error);
    }
  }

  // Inicializa app
  fetchActivities();
});
