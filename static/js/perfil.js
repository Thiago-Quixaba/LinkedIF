document.addEventListener("DOMContentLoaded", () => {
    const contatoP = document.querySelector(".news-card ul li:nth-child(3) p");

    if (contatoP) {
        contatoP.textContent = formatarContato(contatoP.textContent);
    }
});

function formatarContato(contato) {
    if (!contato) return "Nenhum contato informado.";

    // garante só números
    contato = contato.replace(/\D/g, "");

    // Exemplo Brasil celular
    if (contato.length === 13) {
        return `+${contato.slice(0,2)} (${contato.slice(2,4)}) ${contato.slice(4,9)}-${contato.slice(9)}`;
    }

    if (contato.length === 11) {
        return `(${contato.slice(0,2)}) ${contato.slice(2,7)}-${contato.slice(7)}`;
    }

    return contato; // fallback
}


function atualizarAvatar(url) {
    const finalUrl = url + "?v=" + Date.now();

    const avatarPerfil = document.querySelector(
        ".profile-shortcut-card .avatar img"
    );
    const avatarHeader = document.querySelector(
        ".top-header .avatar img"
    );
    const preview = document.getElementById("previewFoto");

    if (avatarPerfil) avatarPerfil.src = finalUrl;
    if (avatarHeader) avatarHeader.src = finalUrl;
    if (preview) preview.src = finalUrl;
}

// ============================
// ABRIR MODAL
// ============================
document.getElementById("open-edit-modal").addEventListener("click", () => {
    document.getElementById("edit-modal").classList.add("show");
    document.body.style.overflow = "hidden";
});

// ============================
// FECHAR MODAL
// ============================
function closeEditModal() {
    document.getElementById("edit-modal").classList.remove("show");
    document.body.style.overflow = "auto";
    document.getElementById("msg").textContent = "";
}

document.getElementById("edit-modal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("edit-modal")) {
        closeEditModal();
    }
});


// ============================
// UPLOAD DA FOTO – IMGBB
// ============================
document.getElementById("fotoPerfil").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // PREVIEW imediata
    document.getElementById("previewFoto").src = URL.createObjectURL(file);

    let formData = new FormData();
    formData.append("image", file);

    let req = await fetch("/upload_image", {
        method: "POST",
        body: formData
    });

    let res = await req.json();
    console.log(res);

    if (res.success && res.url.startsWith("http")) {
        atualizarAvatar(res.url);
        document.getElementById("photo_url").value = res.url;
    } else {
        alert("Erro ao enviar foto.");
    }
});


// ============================
// SUBMIT DO FORM
// ============================
document.getElementById("formPerfil").addEventListener("submit", async (e) => {
    e.preventDefault();

    let form = new FormData(e.target);

    let contato = form.get("contact");
    if (contato) {contato = contato.replace(/\D/g, ""); form.set("contact", contato);}

    let req = await fetch("/atualizar_perfil", {
        method: "POST",
        body: form
    });

    let res = await req.json();

    if (res.update) {
        let msg = document.getElementById("msg");
        msg.textContent = "Perfil atualizado!";
        msg.style.color = "lightgreen";

        // Atualiza painel direito
        document.querySelector(".news-card ul li:nth-child(1) p").textContent = form.get("skills");
        document.querySelector(".news-card ul li:nth-child(2) p").textContent = form.get("experiences");
        document.querySelector(".news-card ul li:nth-child(3) p").textContent = formatarContato(form.get("contact"));


        // ✅ ATUALIZA FOTO VISUALMENTE
        if (res.photo_url) {
            // Atualiza a imagem no perfil
            document.getElementById("previewFoto").src = res.photo_url;
            document.getElementById("photo_url").value = res.photo_url;  // Atualiza o campo hidden
        }

        setTimeout(() => closeEditModal(), 1500);
    }
});
async function buscarProjetos() {
    let termo = document.getElementById("campoBusca").value.trim();
    let box = document.getElementById("resultadoBusca");
    let listaInicial = document.getElementById("listaInicialProjetos");

    // Se limpar ou digitar pouco, volta lista original
    if (termo.length < 2) {
        box.innerHTML = "";
        listaInicial.style.display = "block";
        return;
    }

    // Esconde lista inicial
    listaInicial.style.display = "none";

    box.innerHTML = "<p style='color: gray;'>Buscando...</p>";

    let req = await fetch(`/buscar_projetos?termo=${encodeURIComponent(termo)}`);
    let res = await req.json();

    let projetos = res.projetos;

    if (!Array.isArray(projetos) || projetos.length === 0) {
        box.innerHTML = `
            <div class="project-card">
                <p style="text-align:center;color:#ccc;padding:20px;">
                    Nenhum projeto encontrado.
                </p>
            </div>`;
        return;
    }

    box.innerHTML = "";

    projetos.forEach(p => {
        box.innerHTML += `
            <div class="project-card">

                <div class="project-header">
                    <div>
                        <h4>${p.professor_nome}</h4>
                        <small>${p.professor_email}</small>
                    </div>
                </div>

                <div class="project-body">
                    <p class="proj-title">${p.title}</p>
                    <p><strong>Descrição:</strong> ${p.description}</p>
                    <p><strong>Requisitos:</strong> ${p.requirements}</p>
                </div>

                <div class="project-actions">
                    <button><i class="fas fa-envelope"></i> Entrar em contato</button>
                    <button><i class="fas fa-share"></i> Compartilhar</button>
                </div>

            </div>
        `;
    });
}
let timeoutBusca;

document.getElementById("campoBusca").addEventListener("input", () => {
    clearTimeout(timeoutBusca);

    timeoutBusca = setTimeout(() => {
        buscarProjetos();
    }, 400);
});

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

/* ========================================
   MODAL PARA EDITAR FOTO DO ALUNO
======================================== */

// Abrir modal de foto
document.getElementById("btnEditarFotoAluno")?.addEventListener("click", () => {
    document.getElementById("modalFotoAluno").classList.add("show");
    document.body.style.overflow = "hidden";
});

// Fechar modal
function closeModalFotoAluno() {
    document.getElementById("modalFotoAluno").classList.remove("show");
    document.body.style.overflow = "auto";
}

// Fechar ao clicar fora
document.getElementById("modalFotoAluno")?.addEventListener("click", (e) => {
    if (e.target === document.getElementById("modalFotoAluno")) {
        closeModalFotoAluno();
    }
});

// ========================================
// UPLOAD DA FOTO - ALUNO
// ========================================
document.getElementById("formFotoAluno")?.addEventListener("submit", async e => {
    e.preventDefault();

    const file = document.getElementById("fotoAluno").files[0];
    if (!file) {
        alert("Selecione uma imagem!");
        return;
    }

    const formData = new FormData();
    formData.append("image", file);

    // 1. Envia para o backend (upload_image)
    const req = await fetch("/upload_image", {
        method: "POST",
        body: formData
    });

    const res = await req.json();

    if (!res.success) {
        alert("Erro ao enviar imagem: " + (res.error || "Desconhecido"));
        return;
    }

    // 2. Atualiza a URL da foto no perfil do aluno
    const alunoId = document.querySelector('input[name="aluno_id"]').value;
    
    try {
        // Usa a mesma rota de atualizar perfil
        const updateForm = new FormData();
        updateForm.append("aluno_id", alunoId);
        updateForm.append("photo_url", res.url);
        
        // Mantém os dados existentes
        const skills = document.querySelector('textarea[name="skills"]').value;
        const experiences = document.querySelector('textarea[name="experiences"]').value;
        const contact = document.querySelector('input[name="contact"]').value;
        
        updateForm.append("skills", skills);
        updateForm.append("experiences", experiences);
        updateForm.append("contact", contact);

        const updateReq = await fetch("/atualizar_perfil", {
            method: "POST",
            body: updateForm
        });

        const updateRes = await updateReq.json();

        if (updateRes.update) {
            // Atualiza visualmente as fotos
            atualizarAvatar(updateRes.photo_url || res.url);
            
            // Fecha o modal
            closeModalFotoAluno();
            
            // Recarrega a página para garantir sincronização
            setTimeout(() => location.reload(), 800);
        } else {
            alert("Erro ao atualizar foto no perfil.");
        }
    } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao processar a atualização da foto.");
    }
});

// Função para atualizar avatar em todos os lugaresfunction atualizarAvatar(url) {
    const finalUrl = url + "?v=" + Date.now();

    // Atualiza no card do perfil
    const avatarPerfil = document.querySelector(".avatar-edit img");
    if (avatarPerfil) avatarPerfil.src = finalUrl;
    
    // Atualiza no preview do modal de edição
    const preview = document.getElementById("previewFoto");
    if (preview) preview.src = finalUrl;
    
    // Atualiza o campo hidden do formulário
    const photoUrlInput = document.getElementById("photo_url");
    if (photoUrlInput) photoUrlInput.value = finalUrl;
// Torna a foto preview clicável para edição
document.getElementById("previewFoto")?.addEventListener("click", () => {
    closeEditModal(); // Fecha modal atual
    setTimeout(() => {
        document.getElementById("modalFotoAluno").classList.add("show");
        document.body.style.overflow = "hidden";
    }, 300);
});