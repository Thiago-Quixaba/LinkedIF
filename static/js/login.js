console.log("login.js rodou em:", window.location.pathname);
const alunoBtn = document.getElementById("alunoBtn");
const profBtn = document.getElementById("profBtn");
const tipoUsuario = document.getElementById("tipoUsuario");
const senhaInput = document.getElementById("senhaLogin");
const eyeBtn = document.getElementById("eyeLogin");
const emailInput = document.getElementById("emailLogin");
const loginForm = document.getElementById("loginForm");
const textError = document.getElementById("textErrorLogin");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

alunoBtn.onclick = () => {
    alunoBtn.classList.add("active");
    profBtn.classList.remove("active");
    tipoUsuario.value = "aluno";
    registerBtn.href = "/cadastro/aluno";
};

profBtn.onclick = () => {
    profBtn.classList.add("active");
    alunoBtn.classList.remove("active");
    tipoUsuario.value = "professor";
    registerBtn.href = "/cadastro/professor";
};

eyeBtn.onclick = () => {
    const isPassword = senhaInput.type === "password";
    senhaInput.type = isPassword ? "text" : "password";
};

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    return false;
});

loginBtn.addEventListener("click", async () => {

    const regexAluno = /^capau\.[a-zA-Z0-9]+@aluno\.ifpi\.edu\.br$/;
    const regexProfessor = /^[a-zA-Z0-9._]+@ifpi\.edu\.br$/;

    if (tipoUsuario.value == "aluno") {
        if (!regexAluno.test(emailInput.value)) {
            textError.textContent = "Use um e-mail institucional do IFPI.";
            emailInput.classList.add("error-border");
            emailInput.focus(); 
            return; 
        } else {
            textError.textContent = "";
            emailInput.classList.remove("error-border");
        }
    } else if (tipoUsuario.value == "professor") {
        if (!regexProfessor.test(emailInput.value)) {
            textError.textContent = "Use um e-mail institucional do IFPI.";
            emailInput.classList.add("error-border");
            emailInput.focus(); 
            return; 
        } else {
            textError.textContent = "";
            emailInput.classList.remove("error-border");
        }
    }
    

    if (senhaInput.value.length < 8) {
        textError.textContent = "A senha deve ter no mínimo 8 caracteres.";
        senhaInput.classList.add("error-border");
        senhaInput.focus();
        return;
    } else {
        senhaInput.classList.remove("error-border");
    }

    const formData = new FormData(loginForm);
    
    try {
        const response = await fetch('/loggin', { 
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        switch (response.status) {

            case 200:
                if (data.type === "aluno") {
                    localStorage.setItem("login", data.Login);
                    localStorage.setItem("user", JSON.stringify(data.user.id));
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("type", data.type);
                    window.location.href = `/home/aluno/${data.user.id}`;
                }
                else if (data.type === "professor") {
                    localStorage.setItem("login", data.Login);
                    localStorage.setItem("user", JSON.stringify(data.user.id));
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("type", data.type);
                    window.location.href = `/home/professor/${data.user.id}`; 
                }
                break;


            case 401:
                textError.textContent = data.body;
                textError.style.color = "rgb(255, 80, 80)";
                senhaInput.classList.add("error-border");
                break;

            case 404:
                textError.textContent = data.body;
                textError.style.color = "rgb(255, 80, 80)";
                emailInput.classList.add("error-border");
                break;

            case 500:
                textError.textContent = data.body;
                textError.style.color = "rgb(255, 80, 80)";
                break;

            default:
                textError.textContent = "Erro desconhecido.";
                textError.style.color = "rgb(255, 80, 80)";
        }

    } catch {
        textError.textContent = "Falha de conexão.";
        textError.style.color = "rgb(255, 80, 80)";
    }
});

emailInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        loginBtn.click();
    }
});

senhaInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        loginBtn.click();
    }
});