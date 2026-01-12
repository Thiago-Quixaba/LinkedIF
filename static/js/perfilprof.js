/* ============================================================
   ABRIR MODAL DE EDIÇÃO
============================================================ */

document.querySelectorAll(".editarProjeto").forEach(btn => {
    btn.addEventListener("click", async () => {
        let id = btn.dataset.id;

        try {
            let req = await fetch(`/projeto/view/${id}`);
            let data = await req.json();

            if (!data.success || !data.projeto) {
                alert("Erro ao carregar projeto.");
                return;
            }

            let projeto = data.projeto;

            // Preenche modal
            document.getElementById("edit_id").value = projeto.id;
            document.getElementById("edit_titulo").value = projeto.title;
            document.getElementById("edit_descricao").value = projeto.description || "";
            document.getElementById("edit_requisitos").value = projeto.requirements || "";
            document.getElementById("edit_contact").value = projeto.contact || "";
            document.getElementById("edit_vacancies").value = projeto.vacancies || "";

            // Abre modal
            document.getElementById("modalEditarProjeto").classList.add("show");
            document.body.style.overflow = "hidden";

        } catch (error) {
            console.error("Erro ao buscar projeto:", error);
        }
    });
});


/* ============================================================
   APAGAR PROJETO
============================================================ */
document.querySelectorAll(".apagarProjeto").forEach(btn => {
    btn.addEventListener("click", () => {
        let id = btn.dataset.id;

        confirmarAcao({
            titulo: "Apagar projeto",
            mensagem: "Essa ação não pode ser desfeita.",
            onConfirm: async () => {
                try {
                    await fetch(`/projeto/apagar/${id}`, { method: "DELETE" });
                    location.reload();
                } catch (e) {
                    console.error("Erro ao apagar projeto", e);
                }
            }
        });
    });
});

/* ============================================================
   COMPARTILHAR PROJETO
============================================================ */

document.querySelectorAll(".compartilharProjeto").forEach(btn => {
    btn.addEventListener("click", () => {
        let id = btn.dataset.id;
        let link = `${window.location.origin}/projeto/view/${id}`;

        confirmarAcao({
            titulo: "Compartilhar projeto",
            mensagem: "Copiar link do projeto para a área de transferência?",
            onConfirm: () => {
                navigator.clipboard.writeText(link);
            }
        });
    });
});


/* ============================================================
   ABRIR MODAL DE CRIAÇÃO
============================================================ */

document.querySelectorAll(".open-create-project").forEach(btn => {
    btn.addEventListener("click", () => {
        document.getElementById("modal-criar-projeto").classList.add("show");
        document.body.style.overflow = "hidden";
    });
});

function closeCreateProject() {
    document.getElementById("modal-criar-projeto").classList.remove("show");
    document.body.style.overflow = "auto";
}


/* ============================================================
   SALVAR PROJETO NOVO
============================================================ */

document.querySelectorAll(".contactInput").forEach(input => {

    input.addEventListener("input", () => {
        let numbers = input.value.replace(/\D/g, "");

        if (numbers.length > 11) {
            numbers = numbers.slice(0, 11);
        }

        let formatted = "";

        if (numbers.length > 0) {
            formatted = numbers;
        }

        if (numbers.length >= 3) {
            formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
        }

        if (numbers.length >= 8) {
            formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
        }

        input.value = formatted;
    });
});

document.querySelectorAll(".vacanciesInput").forEach(input => {
    input.addEventListener("input", () => {
        // mantém APENAS dígitos
        let value = input.value.replace(/[^0-9]/g, "");

        // remove zero ou vazio
        if (value === "" || value === "0") {
            input.value = "";
            return;
        }

        input.value = parseInt(value, 10);
    });
});

document.getElementById("formCriarProjeto").addEventListener("submit", async e => {
    e.preventDefault();

    let form = new FormData(e.target);

    let titulo = form.get("title");
    let descricao = form.get("description");
    let requisitos = form.get("requirements");
    let contato = form.get("contact");
    if (contato) {contato = contato.replace(/\D/g, "");};
    let vagas = form.get("vacancies");
    if (!vagas || parseInt(vagas) < 1) {vagas = null;}


    let formFinal = new FormData();
    formFinal.append("professor_id", form.get("professor_id"));
    formFinal.append("title", titulo);
    formFinal.append("description", descricao);
    formFinal.append("requirements", requisitos);
    formFinal.append("contact", contato || null);
    formFinal.append("vacancies", vagas);

    let req = await fetch("/criar_projeto", {
        method: "POST",
        body: formFinal
    });

    let res = await req.json();
    let msg = document.getElementById("msgProjeto");

    if (res.success) {
        msg.style.color = "lightgreen";
        msg.textContent = "Projeto criado com sucesso!";
        setTimeout(() => location.reload(), 800);
    } else {
        msg.style.color = "red";
        msg.textContent = "Erro ao criar projeto: " + (res.error || "desconhecido");
        setTimeout(() => location.reload(), 800);
    }
});


/* ============================================================
   SALVAR EDIÇÃO DE PROJETO
============================================================ */
function closeEditarProjeto() {
    document.getElementById("modalEditarProjeto").classList.remove("show");
    document.body.style.overflow = "auto";
}


document.getElementById("formEditarProjeto")?.addEventListener("submit", async e => {
    e.preventDefault();

    let id = document.getElementById("edit_id").value;
    let titulo = document.getElementById("edit_titulo").value;
    let descricao = document.getElementById("edit_descricao").value;
    let requisitos = document.getElementById("edit_requisitos").value;
    let contact = document.getElementById("edit_contact").value;
    if (contact) {contact = contact.replace(/\D/g, "");};
    let vacancies = document.getElementById("edit_vacancies").value;
    if (!vacancies || parseInt(vacancies) < 1) {vacancies = null;}

    confirmarAcao({
        titulo: "Salvar alterações",
        mensagem: "Deseja salvar as alterações deste projeto?",
        onConfirm: async () => {

            let form = new FormData();
            form.append("title", titulo);
            form.append("description", descricao);
            form.append("requirements", requisitos);
            form.append("contact", contact);
            form.append("vacancies", vacancies);

            try {
                await fetch(`/projeto/editar/${id}`, {
                    method: "POST",
                    body: form
                });

                location.reload();
            } catch (e) {
                console.error("Erro ao editar projeto", e);
            }
        }
    });
});

function confirmarAcao({ titulo, mensagem, onConfirm }) {
    const modal = document.getElementById("modalConfirmar");
    const titleEl = document.getElementById("confirmTitle");
    const msgEl = document.getElementById("confirmMessage");
    const btnConfirmar = document.getElementById("btnConfirmar");
    const btnCancelar = document.getElementById("btnCancelar");

    titleEl.textContent = titulo || "Confirmar ação";
    msgEl.textContent = mensagem || "Tem certeza que deseja continuar?";

    modal.classList.add("show");
    document.body.style.overflow = "hidden";

    const fechar = () => {
        modal.classList.remove("show");
        document.body.style.overflow = "auto";
        btnConfirmar.onclick = null;
        btnCancelar.onclick = null;
    };

    btnCancelar.onclick = fechar;

    btnConfirmar.onclick = () => {
        fechar();
        onConfirm();
    };
}

// Abrir modal de alunos
document.getElementById("btnVerAlunos")?.addEventListener("click", () => {
    document.getElementById("modalAlunos").classList.add("show");
    document.body.style.overflow = "hidden";
});

// Fechar modal
function closeModalAlunos() {
    document.getElementById("modalAlunos").classList.remove("show");
    document.body.style.overflow = "auto";
}

// Busca em tempo real
document.getElementById("searchAluno")?.addEventListener("input", e => {
    const termo = e.target.value.toLowerCase();

    document.querySelectorAll(".student-item").forEach(item => {
        item.style.display = item.textContent.toLowerCase().includes(termo)
            ? "block"
            : "none";
    });
});


// abrir modal
document.getElementById("btnEditarFoto")?.addEventListener("click", () => {
    document.getElementById("modalFotoProfessor").classList.add("show");
    document.body.style.overflow = "hidden";
});

function closeModalFoto() {
    document.getElementById("modalFotoProfessor").classList.remove("show");
    document.body.style.overflow = "auto";
}

// ============================
// UPLOAD DA FOTO – PROFESSOR
// ============================
document.getElementById("formFotoProfessor")?.addEventListener("submit", async e => {
    e.preventDefault();

    const file = document.getElementById("fotoProfessor").files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    // 1️⃣ envia para o BACKEND (igual aluno)
    const req = await fetch("/upload_image", {
        method: "POST",
        body: formData
    });

    const res = await req.json();
    console.log(res);

    if (!res.success) {
        alert("Erro ao enviar imagem.");
        return;
    }

    // 2️⃣ salva URL criptografada no professor
    await fetch("/atualizar_foto_professor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photo_url: res.url })
    });

    location.reload();
});


const modalAluno = document.getElementById("modalAlunoDetalhes");
const modalContent = modalAluno.querySelector(".modal-content");
const closeBtn = modalAluno.querySelector(".close-btn");

// fechar no X
closeBtn.addEventListener("click", () => {
    fecharModalAluno();
});

// fechar clicando fora
modalAluno.addEventListener("click", (e) => {
    if (!modalContent.contains(e.target)) {
        fecharModalAluno();
    }
});

function fecharModalAluno() {
    modalAluno.classList.remove("show");
    document.body.style.overflow = "";
}

document.querySelectorAll(".student-item").forEach(item => {
    item.addEventListener("click", async () => {
        const id = item.dataset.id;

        try {
            const req = await fetch(`/aluno/view/${id}`);
            const data = await req.json();

            if (!data.success) return;

            const aluno = data.aluno;
            const perfil = data.perfil || {};

            document.getElementById("alunoNome").textContent = aluno.name;
            document.getElementById("alunoClasse").textContent = aluno.class;

            document.getElementById("alunoFoto").src =
                aluno.photo_url || "/static/img/default_user.png";

            document.getElementById("alunoSkills").textContent =
                perfil.skills || "Não informado";

            document.getElementById("alunoExperiences").textContent =
                perfil.experiences || "Não informado";

            // Email
            document.getElementById("alunoContatoEmail").innerHTML =
                aluno.email
                    ? `<a href="https://mail.google.com/mail/?view=cm&to=${aluno.email}" target="_blank" class="whatsapp-btn">
                            <i class="fas fa-envelope"></i> Entrar em contato
                        </a>`
                    : "";

            // WhatsApp
            document.getElementById("alunoContatoWhatsapp").innerHTML =
                perfil.contact
                    ? `<a href="https://wa.me/55${perfil.contact}" target="_blank" class="whatsapp-btn">
                            <i class="fab fa-whatsapp"></i> Entrar em contato
                        </a>`
                    : `<button disabled>
                            <i class="fab fa-whatsapp"></i> Contato indisponível
                        </button>`;

            document.getElementById("modalAlunoDetalhes").classList.add("show");
            document.body.style.overflow = "hidden";

        } catch (e) {
            console.error("Erro ao carregar aluno:", e);
        }
    });
});

/* ============================================================
   ABRIR MODAL DE EDIÇÃO AO CLICAR NO PROJETO
============================================================ */

// Event listener para abrir modal quando clicar em um projeto
document.addEventListener("DOMContentLoaded", function() {
    // Seleciona todos os projetos
    document.querySelectorAll(".projeto-item").forEach(projeto => {
        projeto.addEventListener("click", async function() {
            let id = this.dataset.id;
            
            try {
                // Busca os dados do projeto
                let req = await fetch(`/projeto/view/${id}`);
                let data = await req.json();

                if (!data.success || !data.projeto) {
                    alert("Erro ao carregar projeto.");
                    return;
                }

                let projetoData = data.projeto;

                // Preenche o modal de edição
                document.getElementById("edit_id").value = projetoData.id;
                document.getElementById("edit_titulo").value = projetoData.title;
                document.getElementById("edit_descricao").value = projetoData.description || "";
                document.getElementById("edit_requisitos").value = projetoData.requirements || "";
                document.getElementById("edit_contact").value = projetoData.contact || "";
                document.getElementById("edit_vacancies").value = projetoData.vacancies || "";

                // Abre o modal
                document.getElementById("modalEditarProjeto").classList.add("show");
                document.body.style.overflow = "hidden";

            } catch (error) {
                console.error("Erro ao buscar projeto:", error);
            }
        });
    });
});

// Se quiser um estilo diferente para indicar que é clicável, adicione este CSS:
/*
.mini-project.projeto-item {
    cursor: pointer;
    transition: all 0.3s ease;
}

.mini-project.projeto-item:hover {
    background-color: #f5f5f5;
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
*/

/* ============================================================
   ABRIR MODAL COM INFORMAÇÕES DO ALUNO
============================================================ */


// Função para fechar o modal
function fecharModalAluno() {
    modalAluno.classList.remove("show");
    document.body.style.overflow = "auto";
}

// Fechar ao clicar no X
closeBtn.addEventListener("click", fecharModalAluno);

// Fechar ao clicar fora do modal
modalAluno.addEventListener("click", (e) => {
    if (!modalContent.contains(e.target)) {
        fecharModalAluno();
    }
});

// Fechar com ESC
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalAluno.classList.contains("show")) {
        fecharModalAluno();
    }
});

// Event listener para cada aluno
document.querySelectorAll(".aluno-item").forEach(item => {
    item.addEventListener("click", async () => {
        const id = item.dataset.id;

        try {
            // Busca informações do aluno
            const req = await fetch(`/aluno/view/${id}`);
            const data = await req.json();

            if (!data.success) {
                console.error("Erro ao carregar aluno:", data.error);
                return;
            }

            const aluno = data.aluno;
            const perfil = data.perfil || {};

            // Preenche os dados no modal
            document.getElementById("alunoNome").textContent = aluno.name;
            document.getElementById("alunoClasse").textContent = aluno.class;
            document.getElementById("alunoSkills").textContent = perfil.skills || "Não informado";
            document.getElementById("alunoExperiences").textContent = perfil.experiences || "Não informado";

            // Foto do aluno
            const fotoElement = document.getElementById("alunoFoto");
            fotoElement.src = aluno.photo_url || "/static/img/default_user.png";
            fotoElement.alt = `Foto de ${aluno.name}`;

            // Email - link para Gmail
            const emailContainer = document.getElementById("alunoContatoEmail");
            if (aluno.email) {
                emailContainer.innerHTML = `
                    <a href="https://mail.google.com/mail/?view=cm&to=${aluno.email}" 
                       target="_blank" 
                       class="email-btn">
                        <i class="fas fa-envelope"></i> ${aluno.email}
                    </a>
                `;
            } else {
                emailContainer.innerHTML = '<span class="sem-info">Email não informado</span>';
            }

            // WhatsApp - link direto
            const whatsappContainer = document.getElementById("alunoContatoWhatsapp");
            if (perfil.contact && perfil.contact.trim() !== "") {
                const numero = perfil.contact.replace(/\D/g, "");
                whatsappContainer.innerHTML = `
                    <a href="https://wa.me/55${numero}" 
                       target="_blank" 
                       class="whatsapp-btn">
                        <i class="fab fa-whatsapp"></i> Entrar em contato
                    </a>
                `;
            } else {
                whatsappContainer.innerHTML = '<span class="sem-info">WhatsApp não informado</span>';
            }

            // Abre o modal
            modalAluno.classList.add("show");
            document.body.style.overflow = "hidden";

        } catch (error) {
            console.error("Erro ao carregar aluno:", error);
            alert("Erro ao carregar informações do aluno. Tente novamente.");
        }
    });
});