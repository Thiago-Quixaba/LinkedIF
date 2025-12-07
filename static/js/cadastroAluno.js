const senhaInput = document.getElementById("senhaAluno");
const eyeBtn = document.getElementById("eyeAluno");
const emailInput = document.getElementById("emailAluno");
const textError = document.getElementById("textErrorAluno");
const cadastroForm = document.getElementById("cadastroAluno"); 
const cadastroBtn = document.getElementById("cadastroAlunoBtn"); 
const loginLink = document.getElementById("registerBtn"); 
const cpfInput = document.getElementById("cpf");
const dataInput = document.getElementById("dataDeNascimento");

// ============================
// MÁSCARA DE CPF
// ============================
function aplicarMascaraCPF(input) {
    let cpf = input.value.replace(/\D/g, "");

    if (cpf.length > 11) cpf = cpf.substring(0, 11);

    if (cpf.length > 9) {
        input.value = `${cpf.substring(0,3)}.${cpf.substring(3,6)}.${cpf.substring(6,9)}-${cpf.substring(9,11)}`;
    } else if (cpf.length > 6) {
        input.value = `${cpf.substring(0,3)}.${cpf.substring(3,6)}.${cpf.substring(6,9)}`;
    } else if (cpf.length > 3) {
        input.value = `${cpf.substring(0,3)}.${cpf.substring(3,6)}`;
    } else {
        input.value = cpf;
    }
}

cpfInput.addEventListener("input", () => aplicarMascaraCPF(cpfInput));


// ============================
// VALIDAÇÃO DE CPF
// ============================
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, ""); // remove máscara

    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false; // rejeita repetidos (111.111...)

    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++)
        soma += parseInt(cpf[i - 1]) * (11 - i);

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf[9])) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++)
        soma += parseInt(cpf[i - 1]) * (12 - i);

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;

    return resto === parseInt(cpf[10]);
}


// ============================
// VALIDAÇÃO DE DATA (não pode ser futura)
// ============================
function dataNaoPodeSerFutura(data) {
    const hoje = new Date();
    const dataInformada = new Date(data);

    return dataInformada <= hoje;
}


// ============================
// MOSTRAR / ESCONDER SENHA
// ============================
eyeBtn.onclick = () => {
    const isPassword = senhaInput.type === "password";
    senhaInput.type = isPassword ? "text" : "password";
};


// ============================
// VALIDAÇÃO DE EMAIL IFPI
// ============================
emailInput.addEventListener("blur", () => {
    const regex = /^capau\.[a-zA-Z0-9]+@aluno\.ifpi\.edu\.br$/;

    if (emailInput.value && !regex.test(emailInput.value)) {
        textError.textContent = "Use um e-mail institucional do aluno IFPI (capau.matricula@aluno.ifpi.edu.br).";
        emailInput.classList.add("error-border");
    } else {
        textError.textContent = "";
        emailInput.classList.remove("error-border");
    }
});


// ============================
// SENHA MÍNIMA
// ============================
senhaInput.addEventListener("blur", () => {
    if (senhaInput.value && senhaInput.value.length < 8) {
        textError.textContent = "A senha deve ter no mínimo 8 caracteres.";
        senhaInput.classList.add("error-border");
    } else {
        textError.textContent = "";
        senhaInput.classList.remove("error-border");
    }
});


// ============================
// BOTÃO DE CADASTRAR
// ============================
cadastroBtn.addEventListener("click", async () => {
    
    const emailRegex = /^capau\.[a-zA-Z0-9]+@aluno\.ifpi\.edu\.br$/;

    const nome = document.getElementById("nome").value;
    const cpf = cpfInput.value;
    const dataNascimento = dataInput.value;
    const turma = document.getElementById("turma").value;

    // EMAIL
    if (!emailRegex.test(emailInput.value)) {
        textError.textContent = "Use um e-mail institucional do aluno IFPI.";
        emailInput.classList.add("error-border");
        emailInput.focus();
        return;
    }

    // SENHA
    if (senhaInput.value.length < 8) {
        textError.textContent = "A senha deve ter no mínimo 8 caracteres.";
        senhaInput.classList.add("error-border");
        senhaInput.focus();
        return;
    }

    // CPF
    if (!validarCPF(cpf)) {
        textError.textContent = "CPF inválido.";
        cpfInput.classList.add("error-border");
        cpfInput.focus();
        return;
    } else {
        cpfInput.classList.remove("error-border");
    }

    // DATA FUTURA
    if (!dataNaoPodeSerFutura(dataNascimento)) {
        textError.textContent = "A data de nascimento não pode ser no futuro.";
        dataInput.classList.add("error-border");
        dataInput.focus();
        return;
    } else {
        dataInput.classList.remove("error-border");
    }

    // CAMPOS VAZIOS
    if (!nome || !cpf || !dataNascimento || !turma) {
        textError.textContent = "Preencha todos os campos obrigatórios.";
        return;
    }

    const formData = new FormData(cadastroForm);
    
    try {
        textError.textContent = "Enviando dados...";
        textError.style.color = "blue";
        
        const response = await fetch('/cadastrarAluno', { 
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const html = await response.text();
            
            document.open();
            document.write(html);
            document.close();
            
        } else {
            textError.textContent = "Erro no cadastro. Tente novamente.";
            textError.style.color = "rgb(255, 80, 80)";
        }
    } catch (error) {
        textError.textContent = "Erro de conexão. Tente novamente.";
        textError.style.color = "rgb(255, 80, 80)";
    }
});


// ============================
// ENTER PARA PULAR CAMPOS
// ============================
emailInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        senhaInput.focus();
    }
});

senhaInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        cadastroBtn.click();
    }
});


// ============================
// VOLTAR PARA LOGIN
// ============================
loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "/";
});
