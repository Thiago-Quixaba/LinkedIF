const textErrorConfirmar = document.getElementById("textErrorConfirmar");
const cadastroData = document.getElementById("cadastroData"); 
const confirmarBtn = document.getElementById("confirmarBtn");
const codigoInput = document.getElementById("codigo");

codigoInput.addEventListener("input", () => {
    codigoInput.value = codigoInput.value.replace(/\D/g, "");
});

confirmarBtn.addEventListener("click", async () => {
    const formData = new FormData(cadastroData);
    try {
        const response = await fetch('/confirmarEmailAluno', { 
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.confirm) {
            new Promise(resolve => setTimeout(resolve, 3000));
            textErrorConfirmar.textContent = "Cadastrando...";
            textErrorConfirmar.style.color = "rgb(0, 200, 0)";
            window.location.href = "/";
        } else {
            new Promise(resolve => setTimeout(resolve, 3000));
            textErrorConfirmar.textContent = "Codigo Invalido!";
            textErrorConfirmar.style.color = "rgb(255, 80, 80)";
            window.location.href = "/";
        }
    } catch (error) {
        new Promise(resolve => setTimeout(resolve, 3000));
        textErrorConfirmar.textContent = "Erro de conexão. Tente novamente.";
        textErrorConfirmar.style.color = "rgb(255, 80, 80)";
    }
});