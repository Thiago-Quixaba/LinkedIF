const alunoBtn = document.getElementById("alunoBtn");
const profBtn  = document.getElementById("profBtn");
const tipoUsuario = document.getElementById("tipoUsuario");

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



const senhaInput = document.getElementById("senha");
const eyeBtn = document.querySelector(".eye");

eyeBtn.onclick = () => {
    const isPassword = senhaInput.type === "password";
    senhaInput.type = isPassword ? "text" : "password";
};



