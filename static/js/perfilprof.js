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

document.getElementById("formCriarProjeto").addEventListener("submit", async e => {
    e.preventDefault();

    let form = new FormData(e.target);

    let titulo = form.get("title");
    let descricao = form.get("description");
    let requisitos = form.get("requirements");
    let contato = form.get("contact");
    let vagas = form.get("vacancies");

    let formFinal = new FormData();
    formFinal.append("professor_id", form.get("professor_id"));
    formFinal.append("title", titulo);
    formFinal.append("description", descricao);
    formFinal.append("requirements", requisitos);
    formFinal.append("contact", contato);
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
    let vacancies = document.getElementById("edit_vacancies").value;

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
