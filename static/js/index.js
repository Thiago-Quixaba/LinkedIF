const alunoBtn = document.getElementById("alunoBtn");
const profBtn = document.getElementById("profBtn");
const tipoUsuario = document.getElementById("tipoUsuario");
const senhaInput = document.getElementById("senha");
const eyeBtn = document.querySelector(".eye");
const emailInput = document.getElementById("email");
const loginForm = document.getElementById("loginForm");
const emailError = document.getElementById("emailError");
const loginBtn = document.getElementById("loginBtn"); 

alunoBtn.onclick = () => {
    alunoBtn.classList.add("active");
    profBtn.classList.remove("active");
    tipoUsuario.value = "aluno";
};

profBtn.onclick = () => {
    profBtn.classList.add("active");
    alunoBtn.classList.remove("active");
    tipoUsuario.value = "professor"; 
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

    const regex = /^capau\.[a-zA-Z0-9]+@(aluno\.)?ifpi\.edu\.br$/;

    if (!regex.test(emailInput.value)) {
        emailError.textContent = "Use um e-mail institucional do IFPI.";
        emailInput.classList.add("error-border");
        emailInput.focus(); 
        return; 
    } else {
        emailError.textContent = "";
        emailInput.classList.remove("error-border");
    }

    if (senhaInput.value.length < 8) {
        emailError.textContent = "A senha deve ter no mínimo 8 caracteres.";
        senhaInput.classList.add("error-border");
        senhaInput.focus();
        return;
    } else {
        senhaInput.classList.remove("error-border");
    }

    const formData = new FormData(loginForm);
    
    try {
        const response = await fetch('/login', { 
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            window.location.href = '/dashboard';
        } else {
            emailError.textContent = "Credenciais inválidas. Tente novamente.";
        }
    } catch (error) {
        emailError.textContent = "Erro de conexão. Tente novamente.";
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